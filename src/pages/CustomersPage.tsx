import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Plus, Phone,
  MessageCircle, X, Eye,
  Calendar, ClipboardList, Bell, Wrench,
  MessageSquare, PhoneCall, PlusCircle, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';

// ─── CRM Local Types ───────────────────────────────────────────────────────────

type InteractionType = 'Visit' | 'Call' | 'Note' | 'SMS' | 'WhatsApp';

interface CrmInteraction {
  id: string;
  date: string;        // ISO string
  type: InteractionType;
  note: string;
  loggedBy: string;
}

interface CrmFollowUp {
  date: string;        // YYYY-MM-DD
  reason: string;
}

interface CrmService {
  date: string;        // YYYY-MM-DD
  serviceType: 'Oil Change' | 'Chain Adjust' | 'Full Service' | 'Tyre Change' | 'Custom';
  customLabel?: string;
}

// ─── LocalStorage helpers ──────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getInteractions(customerId: string): CrmInteraction[] {
  return lsGet<CrmInteraction[]>(`crm_interactions_${customerId}`, []);
}
function saveInteractions(customerId: string, data: CrmInteraction[]) {
  lsSet(`crm_interactions_${customerId}`, data);
}

function getFollowUp(customerId: string): CrmFollowUp | null {
  return lsGet<CrmFollowUp | null>(`crm_followup_${customerId}`, null);
}
function saveFollowUp(customerId: string, data: CrmFollowUp | null) {
  lsSet(`crm_followup_${customerId}`, data);
}

function getService(customerId: string): CrmService | null {
  return lsGet<CrmService | null>(`service_${customerId}`, null);
}
function saveService(customerId: string, data: CrmService | null) {
  lsSet(`service_${customerId}`, data);
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns diff in days (positive = future, negative = past / 0 = today) */
function daysDiff(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + 'T00:00:00');
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

// ─── Shared style ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

// ─── Main Component ────────────────────────────────────────────────────────────

export const CustomersPage: React.FC = () => {
  const { customers, invoices, addCustomer, updateCustomer, recordCustomerPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedBikeSegment, setSelectedBikeSegment] = useState<string>('All Bikes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNote, setPaymentNote] = useState<string>('Cash debt settlement');

  // View modal tab
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'followup' | 'service'>('overview');

  // CRM state for the currently-viewed customer
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [followUp, setFollowUp] = useState<CrmFollowUp | null>(null);
  const [service, setService] = useState<CrmService | null>(null);

  // New interaction form
  const [newInterType, setNewInterType] = useState<InteractionType>('Note');
  const [newInterNote, setNewInterNote] = useState('');

  // Follow-up form
  const [fuDate, setFuDate] = useState('');
  const [fuReason, setFuReason] = useState('');

  // Service form
  const [svcDate, setSvcDate] = useState('');
  const [svcType, setSvcType] = useState<CrmService['serviceType']>('Oil Change');
  const [svcCustomLabel, setSvcCustomLabel] = useState('');

  // ── Load CRM data when viewCustomer changes ───────────────────────────────
  useEffect(() => {
    if (!viewCustomer) return;
    const ints = getInteractions(viewCustomer.id);
    const fu = getFollowUp(viewCustomer.id);
    const svc = getService(viewCustomer.id);
    setInteractions(ints);
    setFollowUp(fu);
    setService(svc);
    setFuDate(fu?.date ?? '');
    setFuReason(fu?.reason ?? '');
    setSvcDate(svc?.date ?? '');
    setSvcType(svc?.serviceType ?? 'Oil Change');
    setSvcCustomLabel(svc?.customLabel ?? '');
    setActiveTab('overview');
    setNewInterNote('');
    setNewInterType('Note');
  }, [viewCustomer]);

  // ── Computed: table-row badge states for ALL customers ──────────────────────
  const badgeMap = useCallback(() => {
    const result: Record<string, { followUpAlert: boolean; serviceAlert: 'amber' | 'red' | null }> = {};
    for (const c of customers) {
      const fu = getFollowUp(c.id);
      let followUpAlert = false;
      if (fu) {
        const diff = daysDiff(fu.date);
        followUpAlert = diff <= 0; // overdue or today
      }
      const svc = getService(c.id);
      let serviceAlert: 'amber' | 'red' | null = null;
      if (svc) {
        const diff = daysDiff(svc.date);
        if (diff < 0) serviceAlert = 'red';
        else if (diff <= 7) serviceAlert = 'amber';
      }
      result[c.id] = { followUpAlert, serviceAlert };
    }
    return result;
  }, [customers]);

  const badges = badgeMap();

  // ── KPI: follow-ups due today ───────────────────────────────────────────────
  const followUpsDueToday = customers.filter(c => {
    const fu = getFollowUp(c.id);
    if (!fu) return false;
    return daysDiff(fu.date) <= 0;
  }).length;

  // ── New Customer Form State ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bikeModel: 'Honda CD70',
    regNumber: '',
    group: 'Regular' as Customer['group'],
    creditLimit: 10000,
    receivableBalance: 0,
    loyaltyTier: 'Bronze' as Customer['loyaltyTier'],
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Customer Name and Phone number are required.');
      return;
    }
    addCustomer({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      bikeModel: formData.bikeModel,
      regNumber: formData.regNumber,
      group: formData.group,
      creditLimit: Number(formData.creditLimit),
      receivableBalance: Number(formData.receivableBalance),
      loyaltyTier: formData.loyaltyTier,
    });
    setShowAddModal(false);
    setFormData({
      name: '', phone: '', address: '', bikeModel: 'Honda CD70',
      regNumber: '', group: 'Regular', creditLimit: 10000,
      receivableBalance: 0, loyaltyTier: 'Bronze',
    });
  };

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer) return;
    if (paymentAmount <= 0) { alert('Please enter a valid payment amount.'); return; }
    recordCustomerPayment(paymentCustomer.id, paymentAmount, paymentMethod, paymentNote);
    alert(`Payment of Rs. ${paymentAmount.toLocaleString()} recorded for ${paymentCustomer.name}. Ledger balance updated.`);
    setPaymentCustomer(null);
    setPaymentAmount(0);
  };

  const sendWhatsAppReminder = (cust: Customer) => {
    const text = encodeURIComponent(
      `السلام علیکم ${cust.name} صاحب! سائبر اورین موٹرسائیکل شاپ کی طرف سے آپ کے کھاتے کی بقایا رقم Rs. ${cust.receivableBalance.toLocaleString()} ہے۔ برائے مہربانی اپنا بقایا کلیئر کروائیں۔ شکریہ! رابطہ: 0300-1234567`
    );
    window.open(`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // CRM: add interaction
  const handleAddInteraction = () => {
    if (!viewCustomer || !newInterNote.trim()) return;
    const entry: CrmInteraction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: newInterType,
      note: newInterNote.trim(),
      loggedBy: 'Staff',
    };
    const updated = [entry, ...interactions];
    setInteractions(updated);
    saveInteractions(viewCustomer.id, updated);
    setNewInterNote('');
  };

  // CRM: save follow-up
  const handleSaveFollowUp = () => {
    if (!viewCustomer) return;
    if (!fuDate) { saveFollowUp(viewCustomer.id, null); setFollowUp(null); return; }
    const fu: CrmFollowUp = { date: fuDate, reason: fuReason };
    setFollowUp(fu);
    saveFollowUp(viewCustomer.id, fu);
    alert('Follow-up saved!');
  };

  // CRM: clear follow-up
  const handleClearFollowUp = () => {
    if (!viewCustomer) return;
    saveFollowUp(viewCustomer.id, null);
    setFollowUp(null);
    setFuDate('');
    setFuReason('');
  };

  // CRM: save service
  const handleSaveService = () => {
    if (!viewCustomer) return;
    if (!svcDate) { saveService(viewCustomer.id, null); setService(null); return; }
    const svc: CrmService = {
      date: svcDate,
      serviceType: svcType,
      customLabel: svcType === 'Custom' ? svcCustomLabel : undefined,
    };
    setService(svc);
    saveService(viewCustomer.id, svc);
    alert('Service date saved!');
  };

  // CRM: clear service
  const handleClearService = () => {
    if (!viewCustomer) return;
    saveService(viewCustomer.id, null);
    setService(null);
    setSvcDate('');
    setSvcType('Oil Change');
    setSvcCustomLabel('');
  };

  const filteredCustomers = customers.filter(c => {
    const matchQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.bikeModel && c.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchGroup = selectedGroup === 'All' || c.group === selectedGroup;
    const matchBike = selectedBikeSegment === 'All Bikes' || (
      selectedBikeSegment === 'Other'
        ? !c.bikeModel || (!c.bikeModel.includes('CD70') && !c.bikeModel.includes('CG125') && !c.bikeModel.includes('YBR') && !c.bikeModel.includes('GS150'))
        : c.bikeModel?.toLowerCase().includes(selectedBikeSegment.toLowerCase().replace('honda ', '').replace('yamaha ', '').replace('suzuki ', ''))
    );
    return matchQuery && matchGroup && matchBike;
  });

  // ── Interaction type icon ───────────────────────────────────────────────────
  const interIcon = (type: InteractionType) => {
    switch (type) {
      case 'Visit': return <Users className="w-3.5 h-3.5 text-brand-500" />;
      case 'Call': return <PhoneCall className="w-3.5 h-3.5 text-blue-400" />;
      case 'Note': return <ClipboardList className="w-3.5 h-3.5 text-slate-400" />;
      case 'SMS': return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'WhatsApp': return <MessageCircle className="w-3.5 h-3.5 text-green-400" />;
    }
  };

  // ── Follow-up countdown badge ───────────────────────────────────────────────
  const followUpBadge = (fu: CrmFollowUp) => {
    const diff = daysDiff(fu.date);
    if (diff < 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px]"><Bell className="w-3 h-3" />OVERDUE by {Math.abs(diff)}d</span>;
    if (diff === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold text-[10px]"><Bell className="w-3 h-3" />Due TODAY</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]"><Clock className="w-3 h-3" />Follow-up in {diff}d</span>;
  };

  // ── Service due badge ───────────────────────────────────────────────────────
  const serviceBadge = (svc: CrmService) => {
    const diff = daysDiff(svc.date);
    const label = svc.serviceType === 'Custom' ? (svc.customLabel || 'Custom') : svc.serviceType;
    if (diff < 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px]"><Wrench className="w-3 h-3" />{label} OVERDUE</span>;
    if (diff <= 7) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-[10px]"><Wrench className="w-3 h-3" />{label} in {diff}d</span>;
    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto pb-28"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-500" />
              Customer Management &amp; CRM Ledgers
            </h1>
            <p className="text-xs text-slate-400">
              Accounts receivable, credit limits, maintenance reminders, and WhatsApp ledger alerts.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Customer</span>
          </button>
        </div>

        {/* Summary KPI Strip — 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Accounts Receivable</span>
            <div className="text-xl font-extrabold text-rose-400 mt-1">
              Rs. {customers.reduce((s, c) => s + c.receivableBalance, 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Owed by workshop mechanics &amp; credit buyers</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Mechanic / Workshop Partners</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {customers.filter(c => c.group === 'Mechanic' || c.group === 'Wholesale').length} Accounts
            </div>
            <span className="text-[10px] text-brand-500 font-semibold">Special mechanic rates applied in POS</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Loyalty Program Members</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0)} Total Points
            </div>
            <span className="text-[10px] text-slate-400">Earn 1 pt per Rs. 100 spent</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Bell className="w-3 h-3 text-red-400" /> Follow-ups Due Today
            </span>
            <div className={`text-xl font-extrabold mt-1 ${followUpsDueToday > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {followUpsDueToday} {followUpsDueToday === 1 ? 'Follow-up' : 'Follow-ups'}
            </div>
            <span className="text-[10px] text-slate-400">Scheduled CRM follow-ups</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, phone, or bike model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {['All', 'Walk-in', 'Regular', 'Mechanic', 'Wholesale', 'VIP'].map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedGroup === group
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Motorcycle Model Segmentation Toolbar */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              🏍️ Bike Model Segment:
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Target offers & service by motorcycle
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All Bikes', 'Honda CD70', 'Honda CG125', 'Yamaha YBR125', 'Suzuki GS150', 'Other'].map(bike => {
              const count = bike === 'All Bikes' 
                ? customers.length 
                : bike === 'Other'
                ? customers.filter(c => !c.bikeModel || (!c.bikeModel.includes('CD70') && !c.bikeModel.includes('CG125') && !c.bikeModel.includes('YBR') && !c.bikeModel.includes('GS150'))).length
                : customers.filter(c => c.bikeModel?.toLowerCase().includes(bike.toLowerCase().replace('honda ', '').replace('yamaha ', '').replace('suzuki ', ''))).length;
              const isSelected = selectedBikeSegment === bike;
              return (
                <button
                  key={bike}
                  onClick={() => setSelectedBikeSegment(bike)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  <span>{bike}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer List Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Contact &amp; Bike</th>
                  <th className="p-3">Category Group</th>
                  <th className="p-3">Receivable Balance</th>
                  <th className="p-3">Credit Limit</th>
                  <th className="p-3">Loyalty Pts</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map(cust => {
                  const { followUpAlert, serviceAlert } = badges[cust.id] ?? {};
                  return (
                    <tr key={cust.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                          {cust.name}
                          {/* CRM inline badges */}
                          {followUpAlert && (
                            <span title="Follow-up overdue / due today" className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                          )}
                          {serviceAlert === 'red' && (
                            <span title="Service overdue" className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                          )}
                          {serviceAlert === 'amber' && (
                            <span title="Service due within 7 days" className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">ID: {cust.id}</div>
                      </td>
                      <td className="p-3 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{cust.phone}</span>
                        </div>
                        {cust.bikeModel && (
                          <div className="text-[10px] text-brand-500 font-medium mt-0.5">
                            {cust.bikeModel} {cust.regNumber ? `(${cust.regNumber})` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cust.group === 'Mechanic' ? 'bg-orange-950 text-orange-300' :
                          cust.group === 'Wholesale' ? 'bg-blue-950 text-blue-300' :
                          cust.group === 'VIP' ? 'bg-purple-950 text-purple-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {cust.group}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-sm">
                        {cust.receivableBalance > 0 ? (
                          <span className="text-rose-400">
                            Rs. {cust.receivableBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Clear (Rs. 0)</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        Rs. {cust.creditLimit.toLocaleString()}
                      </td>
                      <td className="p-3 text-amber-400 font-semibold">
                        {cust.loyaltyPoints} Pts ({cust.loyaltyTier})
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {/* Receive Payment */}
                        {cust.receivableBalance > 0 && (
                          <button
                            onClick={() => { setPaymentCustomer(cust); setPaymentAmount(cust.receivableBalance); }}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-semibold text-[11px] transition"
                            title="Receive Ledger Payment"
                          >
                            Pay Debt
                          </button>
                        )}

                        {/* Send WhatsApp Reminder */}
                        {cust.receivableBalance > 0 && cust.phone && (
                          <button
                            onClick={() => sendWhatsAppReminder(cust)}
                            className="px-2 py-1 rounded bg-green-950 hover:bg-green-900 text-green-400 font-semibold text-[11px] transition"
                            title="Send WhatsApp Balance Notice"
                          >
                            <MessageCircle className="w-3.5 h-3.5 inline mr-1" />
                            Remind
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-800 transition"
                          title="View Customer Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          REGISTER CUSTOMER MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Register Customer Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Customer / Workshop Name:</label>
                <input type="text" required placeholder="e.g., Ustad Shaukat (Shaukat Auto)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone Number (WhatsApp):</label>
                  <input type="text" required placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Customer Category:</label>
                  <select value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value as Customer['group'] })} className={inputCls}>
                    <option value="Regular">Regular Customer</option>
                    <option value="Mechanic">Mechanic (Special Rates)</option>
                    <option value="Wholesale">Wholesale Dealer</option>
                    <option value="VIP">VIP Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Motorcycle Model:</label>
                  <input type="text" placeholder="Honda CG125, YBR, etc."
                    value={formData.bikeModel}
                    onChange={e => setFormData({ ...formData, bikeModel: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Number Plate:</label>
                  <input type="text" placeholder="LEA-2024-9912"
                    value={formData.regNumber}
                    onChange={e => setFormData({ ...formData, regNumber: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Authorized Credit Limit (Rs.):</label>
                  <input type="number"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} font-bold`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Opening Debt Balance (Rs.):</label>
                  <input type="number"
                    value={formData.receivableBalance}
                    onChange={e => setFormData({ ...formData, receivableBalance: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} font-bold !text-rose-400`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25">
                  Save Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SETTLE DEBT MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Receive Ledger Payment</h3>
              <button onClick={() => setPaymentCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400">
              Customer: <strong className="text-slate-100">{paymentCustomer.name}</strong> • Current Due:{' '}
              <strong className="text-rose-400">Rs. {paymentCustomer.receivableBalance.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleSettlePayment} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Amount Received (PKR):</label>
                <input type="number" min="1" max={paymentCustomer.receivableBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className={`${inputCls} font-bold text-base !text-emerald-400`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Payment Method:</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputCls}>
                  <option value="cash">Cash Tendered (Updates Active Counter Drawer)</option>
                  <option value="bank">Bank Transfer / Online / Raast</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Receipt Notes / Reference:</label>
                <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className={inputCls} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPaymentCustomer(null)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">
                  Confirm &amp; Post Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW CUSTOMER PROFILE MODAL — with CRM TABS
      ═══════════════════════════════════════════════════════════════════════ */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0">
              <div>
                <h3 className="font-bold text-white text-base">{viewCustomer.name}</h3>
                <p className="text-xs text-slate-400">{viewCustomer.phone} • {viewCustomer.group} Account</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-slate-800 shrink-0 overflow-x-auto">
              {(
                [
                  { key: 'overview', label: 'Overview', Icon: Eye },
                  { key: 'timeline', label: 'CRM Timeline', Icon: ClipboardList },
                  { key: 'followup', label: 'Follow-up', Icon: Bell },
                  { key: 'service', label: 'Service Tracker', Icon: Wrench },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === key
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4 text-xs">

              {/* ── TAB: OVERVIEW ──────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400">Receivable Due</span>
                      <div className="text-base font-extrabold text-rose-400">Rs. {viewCustomer.receivableBalance.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400">Total Purchases</span>
                      <div className="text-base font-extrabold text-white">Rs. {viewCustomer.totalPurchases.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400">Loyalty Balance</span>
                      <div className="text-base font-extrabold text-amber-400">{viewCustomer.loyaltyPoints} Pts</div>
                    </div>
                  </div>

                  {/* Bike Info */}
                  {(viewCustomer.bikeModel || viewCustomer.regNumber) && (
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-300 block text-[11px]">Motorcycle Details</span>
                      {viewCustomer.bikeModel && (
                        <div className="flex justify-between text-slate-400">
                          <span>Model</span>
                          <span className="text-brand-400 font-semibold">{viewCustomer.bikeModel}</span>
                        </div>
                      )}
                      {viewCustomer.regNumber && (
                        <div className="flex justify-between text-slate-400">
                          <span>Reg. Plate</span>
                          <span className="font-mono text-slate-200">{viewCustomer.regNumber}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CRM quick-status in overview */}
                  <div className="flex flex-wrap gap-2">
                    {followUp && followUpBadge(followUp)}
                    {service && serviceBadge(service)}
                  </div>

                  {/* Existing maintenance reminders */}
                  {viewCustomer.reminders && viewCustomer.reminders.length > 0 && (
                    <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/60">
                      <span className="font-bold text-amber-300 block mb-1">Active Service Reminders:</span>
                      {viewCustomer.reminders.map(r => (
                        <div key={r.id} className="text-[11px] text-amber-200 flex justify-between">
                          <span>{r.title}</span>
                          <span className="font-mono">Due: {r.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── TAB: CRM TIMELINE ──────────────────────────────────────── */}
              {activeTab === 'timeline' && (
                <>
                  {/* Log new interaction */}
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                    <span className="font-bold text-slate-300 block text-[11px]">Log New Interaction</span>
                    <div className="flex gap-2">
                      <select
                        value={newInterType}
                        onChange={e => setNewInterType(e.target.value as InteractionType)}
                        className="p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                      >
                        <option>Visit</option>
                        <option>Call</option>
                        <option>Note</option>
                        <option>SMS</option>
                        <option>WhatsApp</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Enter note / summary..."
                        value={newInterNote}
                        onChange={e => setNewInterNote(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInteraction(); } }}
                        className="flex-1 p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        onClick={handleAddInteraction}
                        className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition text-xs flex items-center gap-1 whitespace-nowrap"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Note
                      </button>
                    </div>
                  </div>

                  {/* Timeline list */}
                  {interactions.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No interactions logged yet. Add the first one above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {interactions.map(item => (
                        <div key={item.id} className="flex gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                          <div className="mt-0.5 shrink-0">{interIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-bold text-slate-200 text-[11px]">{item.type}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(item.date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-0.5 break-words">{item.note}</p>
                            <span className="text-[10px] text-slate-500">By: {item.loggedBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── TAB: FOLLOW-UP ─────────────────────────────────────────── */}
              {activeTab === 'followup' && (
                <>
                  {/* Current status */}
                  {followUp ? (
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <span className="font-bold text-slate-300 block text-[11px]">Current Follow-up</span>
                      <div className="flex items-center gap-3 flex-wrap">
                        {followUpBadge(followUp)}
                        <span className="text-slate-300 font-mono text-[11px]">{followUp.date}</span>
                      </div>
                      {followUp.reason && (
                        <p className="text-slate-400 italic">"{followUp.reason}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-4">
                      <Bell className="w-8 h-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs">No follow-up scheduled.</p>
                    </div>
                  )}

                  {/* Schedule / update form */}
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
                    <span className="font-bold text-slate-300 block text-[11px]">Schedule / Update Follow-up</span>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-400">Follow-up Date:</label>
                      <input
                        type="date"
                        value={fuDate}
                        min={today()}
                        onChange={e => setFuDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-400">Reason / Note:</label>
                      <input
                        type="text"
                        placeholder="e.g., Check if payment received, discuss bulk order..."
                        value={fuReason}
                        onChange={e => setFuReason(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      {followUp && (
                        <button
                          onClick={handleClearFollowUp}
                          className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={handleSaveFollowUp}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition"
                      >
                        <Calendar className="w-3.5 h-3.5 inline mr-1" /> Save Follow-up
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: SERVICE TRACKER ───────────────────────────────────── */}
              {activeTab === 'service' && (
                <>
                  {/* Current service badge */}
                  {service ? (
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                      <span className="font-bold text-slate-300 block text-[11px]">Upcoming Service</span>
                      <div className="flex items-center gap-3 flex-wrap">
                        {serviceBadge(service) ?? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                            <Wrench className="w-3 h-3" /> On Schedule
                          </span>
                        )}
                        <span className="text-slate-300 font-mono text-[11px]">{service.date}</span>
                        <span className="text-slate-400 text-[11px]">
                          {service.serviceType === 'Custom' ? service.customLabel : service.serviceType}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-4">
                      <Wrench className="w-8 h-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs">No service date tracked yet.</p>
                    </div>
                  )}

                  {/* Service form */}
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
                    <span className="font-bold text-slate-300 block text-[11px]">Set / Update Next Service</span>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-400">Service Date:</label>
                      <input
                        type="date"
                        value={svcDate}
                        onChange={e => setSvcDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-400">Service Type:</label>
                      <select
                        value={svcType}
                        onChange={e => setSvcType(e.target.value as CrmService['serviceType'])}
                        className={inputCls}
                      >
                        <option value="Oil Change">Oil Change</option>
                        <option value="Chain Adjust">Chain Adjust</option>
                        <option value="Full Service">Full Service</option>
                        <option value="Tyre Change">Tyre Change</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    {svcType === 'Custom' && (
                      <div>
                        <label className="font-semibold block mb-1 text-slate-400">Custom Service Label:</label>
                        <input
                          type="text"
                          placeholder="e.g., Brake Pad Replace"
                          value={svcCustomLabel}
                          onChange={e => setSvcCustomLabel(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      {service && (
                        <button
                          onClick={handleClearService}
                          className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={handleSaveService}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition"
                      >
                        <Wrench className="w-3.5 h-3.5 inline mr-1" /> Save Service Date
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-3 shrink-0 flex justify-end">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
