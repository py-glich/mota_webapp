import React, { useState } from 'react';
import { 
  MessageSquare, Send, Plus, MessageCircle, X, Smartphone, 
  Radio, Settings, CheckCircle2, AlertCircle, Users, Search, 
  Copy, Check, Zap, CreditCard, Globe, RefreshCw, Sparkles, 
  ChevronRight, PhoneCall, History, CheckCheck, Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MarketingCampaign, SmsGatewayConfig, SmsLogEntry } from '../types';

export const MarketingPage: React.FC = () => {
  const { 
    campaigns, addCampaign, customers, 
    smsLogs, smsGatewayConfig, sendSms, 
    broadcastSmsCampaign, updateSmsGatewayConfig 
  } = useApp();
  const { currentUser } = useAuth();

  // Active Hub Tab: SMS Engine vs WhatsApp Broadcast
  const [activeTab, setActiveTab] = useState<'sms' | 'whatsapp'>('sms');

  // Shared dark theme styles
  const inputCls = 'w-full p-2.5 border rounded-xl bg-[#111622] border-[#1E2638] text-slate-100 placeholder-slate-500 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500';

  // -------------------------------------------------------------
  // SMS GATEWAY MODAL & CONFIG
  // -------------------------------------------------------------
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayProvider, setGatewayProvider] = useState<SmsGatewayConfig['provider']>(smsGatewayConfig?.provider || 'brand_sms');
  const [senderMask, setSenderMask] = useState(smsGatewayConfig?.senderId || 'MOTOPRO');
  const [apiKey, setApiKey] = useState(smsGatewayConfig?.apiKey || 'pk_live_moto_9921_secret');
  const [apiSecret, setApiSecret] = useState(smsGatewayConfig?.apiSecret || '');
  const [endpointUrl, setEndpointUrl] = useState(smsGatewayConfig?.endpointUrl || 'https://api.brandsms.pk/v2/send');
  const [gatewayCredits, setGatewayCredits] = useState(smsGatewayConfig?.creditsRemaining || 850);

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmsGatewayConfig({
      provider: gatewayProvider,
      senderId: senderMask.trim().toUpperCase() || 'MOTOPRO',
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      endpointUrl: endpointUrl.trim(),
      creditsRemaining: gatewayCredits,
      status: 'active'
    });
    setShowGatewayModal(false);
    alert('SMS Gateway configuration updated successfully! Gateway status: ACTIVE.');
  };

  // -------------------------------------------------------------
  // 1-CLICK INSTANT DUE PAYMENT REMINDER SMS
  // -------------------------------------------------------------
  const [sendingDueId, setSendingDueId] = useState<string | null>(null);
  const [dueNotificationStatus, setDueNotificationStatus] = useState<string | null>(null);

  const handleSendInstantDueSms = async (customerId: string, name: string, phone: string, dueAmount: number) => {
    setSendingDueId(customerId);
    setDueNotificationStatus(null);
    try {
      const msg = `محترم ${name} صاحب!\nسائبر اورین موٹرسائیکل آٹو پارٹس کی طرف سے آپ کے کھاتے کا بقایا بیلنس Rs. ${dueAmount.toLocaleString()} ہے۔ برائے مہربانی اس ہفتے اپنا کھاتہ کلیئر کروائیں۔ شکریہ!\nرابطہ: 0300-1234567`;
      
      const res = await sendSms(phone, name, msg, 'payment_reminder', customerId);
      if (res.success) {
        setDueNotificationStatus(`Payment reminder SMS dispatched to ${name} (${phone}) successfully!`);
        setTimeout(() => setDueNotificationStatus(null), 5000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error sending SMS: ${err.message}`);
    } finally {
      setSendingDueId(null);
    }
  };

  // -------------------------------------------------------------
  // SMS CAMPAIGN COMPOSER STATE
  // -------------------------------------------------------------
  const [smsCampaignTitle, setSmsCampaignTitle] = useState('Weekend Oil & Tune Special');
  const [smsTargetAudience, setSmsTargetAudience] = useState('All Customers');
  const [smsMessageBody, setSmsMessageBody] = useState(
    'Special Discount for {customer_name}! Get 15% OFF on Shell & Havoline Engine Oils + Free Brake Inspection at MotoPro Auto Parts this weekend. Visit today!'
  );
  const [smsTestPhone, setSmsTestPhone] = useState('03001234567');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // SMS Pre-built Templates
  const smsTemplates = [
    {
      id: 'khata_urdu',
      label: 'Khata Due Reminder (اردو)',
      category: 'payment_reminder' as const,
      text: 'محترم {customer_name} صاحب!\nسائبر اورین موٹرسائیکل آٹو پارٹس کی طرف آپ کے کھاتے کا بقایا Rs. {due_amount} ہے۔ برائے مہربانی اس ہفتے ادائیگی کریں۔ شکریہ!\nرابطہ: 0300-1234567'
    },
    {
      id: 'khata_eng',
      label: 'Balance Due Notice (English)',
      category: 'payment_reminder' as const,
      text: 'Dear {customer_name}, your outstanding khata balance at MotoPro Auto Parts is Rs. {due_amount}. Kindly clear your account this week. Contact: 0300-1234567.'
    },
    {
      id: 'new_stock',
      label: 'Genuine Spare Parts Stock Arrival',
      category: 'parts_arrival' as const,
      text: 'معزز گاہک! سائبر اورین پر اٹلس ہونڈا اور یاماہا کے جینین اسپیئر پارٹس (سلنڈر کٹ، کلچ پلیٹ، چین گراری) کی تازہ کھیپ ہول سیل ریٹس پر پہنچ چکی ہے۔ وزٹ فرمائیں!'
    },
    {
      id: 'oil_offer',
      label: 'Engine Oil & Tuning Promotion',
      category: 'offer' as const,
      text: 'Special Offer for {customer_name}! Get 15% OFF on Shell & Havoline 4T Engine Oils + Free Brake inspection at MotoPro Auto Parts this week! Call 0300-1234567.'
    },
    {
      id: 'repeat_voucher',
      label: 'Repeat Customer 10% Voucher',
      category: 'offer' as const,
      text: 'Thank you for choosing MotoPro {customer_name}! As our valued repeat customer, enjoy 10% OFF with code MOTO10 on your next parts or servicing. Valid till Sunday!'
    },
    {
      id: 'cd70_tuning',
      label: 'Honda CD70 Complete Tuning Package',
      category: 'offer' as const,
      text: 'Special for {customer_name} (CD70)! Complete tuning, oil change + tappet adjustment package for only Rs. 990 at MotoPro Auto Parts this weekend! Visit today.'
    },
    {
      id: 'cg125_sprocket',
      label: 'Honda CG125 Sprocket & Chain Promo',
      category: 'offer' as const,
      text: 'Exclusive offer for {customer_name}! Genuine CG125 Chain Sprocket kits + free fitting at MotoPro Workshop this week. Limited stock. Contact: 0300-1234567.'
    }
  ];

  // Live character and SMS Units counter
  const charLength = smsMessageBody.length;
  // 1 SMS unit is 160 GSM standard chars (or 70 Unicode chars if Urdu is detected)
  const isUnicode = /[\u0600-\u06FF]/.test(smsMessageBody);
  const maxPerUnit = isUnicode ? 70 : 160;
  const smsUnits = Math.max(1, Math.ceil(charLength / maxPerUnit));

  // Filtered customer count for target audience
  const getAudienceCount = () => {
    if (smsTargetAudience === 'Debtors Only') {
      return customers.filter(c => c.receivableBalance > 0).length || 1;
    }
    if (smsTargetAudience === 'Mechanics & Workshops') {
      return customers.filter(c => c.group === 'Mechanic').length || 1;
    }
    if (smsTargetAudience === 'VIP Loyalty Members') {
      return customers.filter(c => (c.loyaltyPoints || 0) >= 50).length || 1;
    }
    if (smsTargetAudience === 'Honda CD70 Riders') {
      return customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('cd70')).length || 1;
    }
    if (smsTargetAudience === 'Honda CG125 Riders') {
      return customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('125')).length || 1;
    }
    if (smsTargetAudience === 'Yamaha YBR125 Riders') {
      return customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('ybr')).length || 1;
    }
    if (smsTargetAudience === 'Suzuki GS150 Riders') {
      return customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('gs')).length || 1;
    }
    if (smsTargetAudience === 'Repeat Customers (3+ Purchases)') {
      return customers.filter(c => (c.totalPurchases && c.totalPurchases > 10000) || (c.loyaltyPoints && c.loyaltyPoints > 20)).length || 1;
    }
    return customers.length || 1;
  };

  const handleApplySmsTemplate = (temp: typeof smsTemplates[0]) => {
    setSmsMessageBody(temp.text);
    setSmsCampaignTitle(temp.label);
  };

  const handleSendTestSms = async () => {
    if (!smsTestPhone.trim() || !smsMessageBody.trim()) {
      alert('Please enter a test mobile number and message content.');
      return;
    }
    setIsSendingTest(true);
    try {
      const merged = smsMessageBody
        .replace(/{customer_name}/g, 'استاد اکرم (ٹیسٹ)')
        .replace(/{due_amount}/g, '14,200');

      const res = await sendSms(smsTestPhone, 'Test Recipient', merged, 'custom');
      if (res.success) {
        alert(`Test SMS successfully sent to ${smsTestPhone} via ${smsGatewayConfig.senderId}! (Units: ${smsUnits})`);
      } else {
        alert(`Failed to send test SMS: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error sending test SMS: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleBroadcastSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessageBody.trim() || !smsCampaignTitle.trim()) {
      alert('Please enter both campaign title and message body.');
      return;
    }

    const count = getAudienceCount();
    const totalCreditsNeeded = count * smsUnits;

    if (smsGatewayConfig.creditsRemaining < totalCreditsNeeded) {
      alert(`Insufficient SMS credits! Campaign requires ${totalCreditsNeeded} credits, but you only have ${smsGatewayConfig.creditsRemaining} remaining. Please top up your gateway credits.`);
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this SMS campaign to ${count} recipients? This will deduct ${totalCreditsNeeded} SMS credits from your ${smsGatewayConfig.senderId} account.`)) {
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await broadcastSmsCampaign(smsTargetAudience, smsMessageBody, smsCampaignTitle);
      if (res.success) {
        alert(`Campaign "${smsCampaignTitle}" successfully broadcasted to ${res.count} customers!`);
      }
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // SMS Logs Search Filter
  const [smsLogSearch, setSmsLogSearch] = useState('');
  const filteredSmsLogs = (smsLogs || []).filter(log => 
    log.customerName.toLowerCase().includes(smsLogSearch.toLowerCase()) ||
    log.phoneNumber.includes(smsLogSearch) ||
    log.message.toLowerCase().includes(smsLogSearch.toLowerCase())
  );

  // -------------------------------------------------------------
  // WHATSAPP BROADCAST STATE
  // -------------------------------------------------------------
  const [showNewWaCampaign, setShowNewWaCampaign] = useState(false);
  const [waSelectedTemplate, setWaSelectedTemplate] = useState('balance');
  const [waTargetAudience, setWaTargetAudience] = useState('All Mechanics & Workshop Owners');
  const [waCampaignTitle, setWaCampaignTitle] = useState('');
  const [waMessageBody, setWaMessageBody] = useState('');
  const [waTestPhone, setWaTestPhone] = useState('+923001234567');

  const waTemplates = [
    {
      id: 'balance',
      name: 'Ledger Payment Reminder (اردو)',
      content: 'محترم {customer_name} صاحب!\nسائبر اورین موٹرسائیکل آٹو پارٹس کی طرف سے آپ کے کھاتے کا بقایا بیلنس Rs. {due_amount} ہے۔ برائے مہربانی اس ہفتے اپنا کھاتہ کلیئر کروائیں۔ شکریہ!\nرابطہ: 0300-1234567'
    },
    {
      id: 'tuning_oil',
      name: 'Winter Oil & Tuning Special Offer',
      content: 'Special Discount Offer for {customer_name}!\nGet 15% OFF on Caltex Havoline & Shell Engine Oils + Free Brake Shoe inspection at Cyberorion Motors this week! Visit us today.'
    },
    {
      id: 'spares_arrival',
      name: 'New Genuine Spare Parts Stock Arrival',
      content: 'معزز گاہک! سائبر اورین پر اٹلس ہونڈا اور یاماہا کے نئے اوریجنل اسپیئر پارٹس (کلچ پلیٹ، سلنڈر کٹ، چین گراری) کی تازہ کھیپ پہنچ چکی ہے۔ مناسب ہول سیل ریٹس پر دستیاب ہے۔'
    }
  ];

  const handleApplyWaTemplate = (tempId: string) => {
    const t = waTemplates.find(x => x.id === tempId);
    if (t) {
      setWaSelectedTemplate(tempId);
      setWaMessageBody(t.content);
      setWaCampaignTitle(t.name);
    }
  };

  const handleLaunchWaCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waCampaignTitle.trim() || !waMessageBody.trim()) {
      alert('Please provide campaign title and message content.');
      return;
    }

    addCampaign({
      title: waCampaignTitle,
      type: 'whatsapp',
      targetGroup: waTargetAudience,
      messageContent: waMessageBody,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'active',
      recipientCount: customers.length
    });

    setShowNewWaCampaign(false);
    alert(`Campaign "${waCampaignTitle}" scheduled! ${customers.length} messages queued for WhatsApp API gateway.`);
  };

  const openWhatsAppTest = () => {
    const sampleMsg = waMessageBody
      .replace(/{customer_name}/g, 'استاد اکرم')
      .replace(/{due_amount}/g, '14,200');
    window.open(`https://wa.me/${waTestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(sampleMsg)}`, '_blank');
  };

  // Customers with outstanding ledger balance
  const debtorCustomers = customers.filter(c => c.receivableBalance > 0);

  return (
    <div
      className="min-h-full bg-[#0A0D14] text-slate-100 p-3 sm:p-5 md:p-6 space-y-6 overflow-y-auto pb-28 font-sans"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              Marketing & Automated Messaging Engine
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Brand SMS gateway integration, automated khata collection reminders, and promotional broadcast campaigns.
            </p>
          </div>

          {/* Tab Switcher: SMS Engine vs WhatsApp Hub */}
          <div className="flex bg-[#0B0E14] p-1 rounded-xl border border-[#1E2638] text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('sms')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'sms'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS Marketing Integration</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Broadcasts</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SMS MARKETING ENGINE                               */}
        {/* ========================================================= */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            {/* SMS Gateway Status & Credits Bar */}
            <div className="bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#1E2638] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white capitalize">
                      {smsGatewayConfig.provider.replace('_', ' ').toUpperCase()} SMS Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {smsGatewayConfig.status === 'active' ? 'Operational & Ready' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                    <span>Sender Mask: <strong className="text-white font-mono">{smsGatewayConfig.senderId}</strong></span>
                    <span>•</span>
                    <span>Endpoint: <code className="text-slate-300 font-mono text-[11px]">{smsGatewayConfig.endpointUrl || 'https://api.brandsms.pk/v2/send'}</code></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining Credits</span>
                  <div className="text-lg font-black text-rose-400 font-mono">
                    {smsGatewayConfig.creditsRemaining.toLocaleString()} <span className="text-xs font-normal text-slate-400">SMS</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGatewayModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#171F30] hover:bg-[#1E273D] text-slate-200 border border-[#242F48] text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Settings className="w-3.5 h-3.5 text-rose-400" />
                  <span>Configure Gateway API</span>
                </button>
              </div>
            </div>

            {/* Notification Banner when SMS sent */}
            {dueNotificationStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dueNotificationStatus}</span>
              </div>
            )}

            {/* 1-CLICK INSTANT DUE BALANCE NOTICES */}
            <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Instant Ledger Due Reminders (Khata Debtors)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "Send Due SMS" to instantly dispatch an Urdu payment reminder to the debtor with their live balance.
                  </p>
                </div>
                <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  {debtorCustomers.length} Debtors with Outstanding Balance
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D111A] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1E2638]">
                    <tr>
                      <th className="p-3.5">Customer / Workshop</th>
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Customer Type</th>
                      <th className="p-3.5">Outstanding Balance</th>
                      <th className="p-3.5 text-right">Instant Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030]">
                    {debtorCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          All customer accounts are clear! No outstanding balances pending.
                        </td>
                      </tr>
                    ) : (
                      debtorCustomers.map(cust => (
                        <tr key={cust.id} className="hover:bg-[#161D2C] transition">
                          <td className="p-3.5 font-bold text-white">
                            <div>{cust.name}</div>
                            {cust.bikeModel && <div className="text-[10px] text-slate-400 font-normal">{cust.bikeModel}</div>}
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {cust.phone}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                              {cust.group || 'Customer'}
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-rose-400 font-mono">
                            Rs. {cust.receivableBalance.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              disabled={sendingDueId === cust.id}
                              onClick={() => handleSendInstantDueSms(cust.id, cust.name, cust.phone, cust.receivableBalance)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Send className="w-3 h-3" />
                              <span>{sendingDueId === cust.id ? 'Sending SMS...' : 'Send Due SMS'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* REPEAT CUSTOMER OFFERS & PROMOTIONS HUB */}
            <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Repeat Customer Offers & Promotional Deals
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reward returning motorcycle owners & workshop mechanics with exclusive promo vouchers & service discounts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {customers.filter(c => (c.totalPurchases && c.totalPurchases > 10000) || (c.loyaltyPoints && c.loyaltyPoints > 20)).length} High-Value Repeat Buyers
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D111A] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1E2638]">
                    <tr>
                      <th className="p-3.5">Repeat Customer</th>
                      <th className="p-3.5">Bike Model</th>
                      <th className="p-3.5">Total Spent</th>
                      <th className="p-3.5">Loyalty Tier</th>
                      <th className="p-3.5">Available Promo Offer</th>
                      <th className="p-3.5 text-right">Send Offer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030]">
                    {customers.filter(c => (c.totalPurchases && c.totalPurchases > 10000) || (c.loyaltyPoints && c.loyaltyPoints > 20)).map(cust => (
                      <tr key={cust.id} className="hover:bg-[#161D2C] transition">
                        <td className="p-3.5 font-bold text-white">
                          <div>{cust.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{cust.phone}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {cust.bikeModel || 'Universal'}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          Rs. {cust.totalPurchases.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800/40">
                            {cust.loyaltyTier || 'Bronze'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] font-mono text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                            10% OFF Code: MOTO10
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              const msg = `Dear ${cust.name}! As a valued repeat customer at MotoPro Auto Parts, enjoy 10% OFF with voucher code MOTO10 on your next purchase or oil change! Valid till Sunday. Call: 0300-1234567.`;
                              await sendSms(cust.phone, cust.name, msg, 'offer', cust.id);
                              alert(`10% Promo voucher dispatched to ${cust.name} (${cust.phone})!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Gift className="w-3 h-3" />
                            <span>Send Promo SMS</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BULK SMS CAMPAIGN COMPOSER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form & Composer (7 cols) */}
              <div className="lg:col-span-7 bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-rose-500" />
                    SMS Broadcast Campaign Composer
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Compose promotional, festive, or alert SMS. Merge tags are replaced automatically for each customer.
                  </p>
                </div>

                <form onSubmit={handleBroadcastSms} className="space-y-4">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-300 text-xs">Campaign Title:</label>
                    <input
                      type="text"
                      required
                      value={smsCampaignTitle}
                      onChange={e => setSmsCampaignTitle(e.target.value)}
                      placeholder="e.g. Ramadan Oil Change Promo"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-300 text-xs">Target Customer Segment:</label>
                    <select
                      value={smsTargetAudience}
                      onChange={e => setSmsTargetAudience(e.target.value)}
                      className={inputCls}
                    >
                      <option value="All Customers">All Registered Customers ({customers.length} Contacts)</option>
                      <option value="Debtors Only">Khata Debtors Only ({debtorCustomers.length} Contacts)</option>
                      <option value="Mechanics & Workshops">Mechanics & Workshops ({customers.filter(c => c.group === 'Mechanic').length} Contacts)</option>
                      <option value="VIP Loyalty Members">VIP Loyalty Club Members ({customers.filter(c => (c.loyaltyPoints || 0) >= 50).length} Contacts)</option>
                      <option value="Repeat Customers (3+ Purchases)">⭐ Repeat Customers ({customers.filter(c => (c.totalPurchases && c.totalPurchases > 10000) || (c.loyaltyPoints && c.loyaltyPoints > 20)).length} Contacts)</option>
                      <option value="Honda CD70 Riders">🏍️ Honda CD70 Riders ({customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('cd70')).length} Contacts)</option>
                      <option value="Honda CG125 Riders">🏍️ Honda CG125 Riders ({customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('125')).length} Contacts)</option>
                      <option value="Yamaha YBR125 Riders">🏍️ Yamaha YBR125 Riders ({customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('ybr')).length} Contacts)</option>
                      <option value="Suzuki GS150 Riders">🏍️ Suzuki GS150 Riders ({customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('gs')).length} Contacts)</option>
                    </select>
                  </div>

                  {/* Template Picker */}
                  <div>
                    <span className="font-semibold block mb-1.5 text-slate-300 text-xs">Select SMS Template:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {smsTemplates.map(temp => (
                        <button
                          key={temp.id}
                          type="button"
                          onClick={() => handleApplySmsTemplate(temp)}
                          className="p-2.5 rounded-xl border border-[#1E2638] hover:border-rose-500/50 bg-[#0B0E14] text-left transition flex flex-col justify-between"
                        >
                          <span className="font-bold text-[11px] text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-rose-400" />
                            {temp.label}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate mt-1">
                            {temp.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300 text-xs">Message Body (Urdu & English):</label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {charLength} chars | <strong className="text-rose-400">{smsUnits} SMS {smsUnits > 1 ? 'Units' : 'Unit'}</strong> ({isUnicode ? '70 chars/unit Urdu' : '160 chars/unit GSM'})
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      required
                      value={smsMessageBody}
                      onChange={e => setSmsMessageBody(e.target.value)}
                      className={`${inputCls} font-sans leading-relaxed`}
                    />

                    {/* Merge tag shortcuts */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">Insert tag:</span>
                      <button
                        type="button"
                        onClick={() => setSmsMessageBody(prev => prev + ' {customer_name}')}
                        className="px-2 py-0.5 rounded bg-[#171F30] hover:bg-rose-900/40 text-rose-300 text-[10px] font-mono border border-rose-500/30 transition"
                      >
                        + {'{customer_name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmsMessageBody(prev => prev + ' {due_amount}')}
                        className="px-2 py-0.5 rounded bg-[#171F30] hover:bg-rose-900/40 text-rose-300 text-[10px] font-mono border border-rose-500/30 transition"
                      >
                        + {'{due_amount}'}
                      </button>
                    </div>
                  </div>

                  {/* Test Dispatch Box */}
                  <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#1E2638] space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Single Test SMS Dispatch:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={smsTestPhone}
                        onChange={e => setSmsTestPhone(e.target.value)}
                        placeholder="03001234567"
                        className="flex-1 p-2 rounded-lg bg-[#111622] border border-[#1E2638] text-white font-mono text-xs focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        disabled={isSendingTest}
                        onClick={handleSendTestSms}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isSendingTest ? 'Sending...' : 'Send Test SMS'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Broadcast Trigger */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#1E2638]">
                    <div className="text-xs text-slate-400">
                      Total SMS Required: <strong className="text-white font-mono">{getAudienceCount() * smsUnits} Credits</strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isBroadcasting}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
                    >
                      <Radio className="w-4 h-4" />
                      <span>{isBroadcasting ? 'Broadcasting SMS...' : `Broadcast to ${getAudienceCount()} Customers`}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview & Phone Mockup (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-sm space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-rose-500" />
                    Handset SMS Notification Preview
                  </h4>

                  {/* Realistic Mobile Screen Mock */}
                  <div className="mx-auto max-w-[280px] bg-black rounded-3xl p-3 border-4 border-[#242F48] shadow-2xl space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pt-1 font-mono">
                      <span>04:15 PM</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-400">4G LTE</span>
                    </div>

                    {/* Sender Banner */}
                    <div className="p-2 rounded-xl bg-[#161D2C] border border-[#232D42] text-center">
                      <span className="text-[10px] text-slate-400 block">Brand SMS Gateway</span>
                      <span className="text-xs font-black text-rose-400 font-mono tracking-wider">{smsGatewayConfig.senderId}</span>
                    </div>

                    {/* Message Bubble */}
                    <div className="p-3 rounded-2xl bg-[#1E2638] text-white text-xs leading-relaxed font-sans shadow-md">
                      <p className="whitespace-pre-line text-[11px]">
                        {smsMessageBody
                          .replace(/{customer_name}/g, 'استاد اکرم')
                          .replace(/{due_amount}/g, '14,200')}
                      </p>
                      <div className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                        <span>Just now</span>
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-[#0B0E14] p-3 rounded-xl border border-[#1E2638] space-y-1">
                    <div className="font-bold text-slate-300">Gateway Specifications:</div>
                    <div>• Verified Operator Sender ID: <strong className="text-white font-mono">{smsGatewayConfig.senderId}</strong></div>
                    <div>• GSM Latin: 160 chars / credit | Urdu Nastaliq: 70 chars / credit</div>
                    <div>• DND & Anti-Spam Compliance: PTA / Operator Approved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME SMS LOGS & DELIVERY HISTORY */}
            <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-rose-500" />
                    SMS Dispatch & Delivery History Log
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Real-time transaction log of all automated customer reminders, single notifications, and bulk SMS broadcasts.
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search recipient, phone or text..."
                    value={smsLogSearch}
                    onChange={e => setSmsLogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#0B0E14] border border-[#1E2638] text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D111A] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1E2638]">
                    <tr>
                      <th className="p-3.5">Recipient</th>
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Message Content</th>
                      <th className="p-3.5">Template Category</th>
                      <th className="p-3.5">Units / Chars</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030]">
                    {filteredSmsLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          No SMS logs found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredSmsLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#161D2C] transition">
                          <td className="p-3.5 font-bold text-white">
                            {log.customerName}
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {log.phoneNumber}
                          </td>
                          <td className="p-3.5 max-w-sm">
                            <p className="text-[11px] text-slate-300 line-clamp-2 font-sans">
                              {log.message}
                            </p>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                              {log.templateType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {log.smsUnits} Unit ({log.characterCount}c)
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Delivered
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WHATSAPP BROADCASTS HUB                            */}
        {/* ========================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  WhatsApp Direct Marketing Hub
                </h3>
                <p className="text-xs text-slate-400">
                  Broadcast promotions and khata payment requests directly via WhatsApp Web & Cloud API.
                </p>
              </div>

              <button
                onClick={() => {
                  handleApplyWaTemplate('balance');
                  setShowNewWaCampaign(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create WhatsApp Campaign</span>
              </button>
            </div>

            {/* Templates Quick Selector */}
            <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-xs space-y-3">
              <h3 className="font-bold text-white text-sm">
                Pre-Built Motorcycle Shop Communication Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {waTemplates.map(temp => (
                  <div
                    key={temp.id}
                    onClick={() => {
                      handleApplyWaTemplate(temp.id);
                      setShowNewWaCampaign(true);
                    }}
                    className="p-3.5 rounded-xl border border-[#1E2638] hover:border-emerald-500 bg-[#0B0E14] hover:bg-[#161D2C] cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        {temp.name}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-3 mt-1.5 leading-relaxed font-sans">
                        {temp.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-2 block">
                      Use Template →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Broadcast Campaigns */}
            <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400">
                WhatsApp Campaign History & Delivery Logs
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D111A] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1E2638]">
                    <tr>
                      <th className="p-3">Campaign Title</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Target Audience</th>
                      <th className="p-3">Recipients</th>
                      <th className="p-3">Scheduled Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030]">
                    {campaigns.map(camp => (
                      <tr key={camp.id} className="hover:bg-[#161D2C] transition">
                        <td className="p-3">
                          <div className="font-bold text-white">{camp.title}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-sm">{camp.messageContent}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            WhatsApp
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{camp.targetGroup}</td>
                        <td className="p-3 font-mono font-bold text-slate-100">{camp.recipientCount} Customers</td>
                        <td className="p-3 text-slate-400 font-mono">{camp.scheduledDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400">
                            Sent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: SMS GATEWAY API CONFIGURATION                      */}
      {/* ========================================================= */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-[#1E2638] p-5 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-white text-sm">SMS Gateway API Configuration</h3>
              </div>
              <button onClick={() => setShowGatewayModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Gateway Provider:</label>
                <select
                  value={gatewayProvider}
                  onChange={e => setGatewayProvider(e.target.value as any)}
                  className={inputCls}
                >
                  <option value="brand_sms">Brand SMS (Pakistan Telecom Operators)</option>
                  <option value="twilio">Twilio Cloud Communications</option>
                  <option value="sms_country">SMS Country International Gateway</option>
                  <option value="telnyx">Telnyx Enterprise SMS</option>
                  <option value="custom_http">Custom HTTP / REST API Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Sender Mask / Branded Header ID:</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={senderMask}
                  onChange={e => setSenderMask(e.target.value)}
                  placeholder="e.g. MOTOPRO or CYBERORION"
                  className={inputCls}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Alphanumeric PTA registered mask (max 11 chars).</span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">API Key / Token:</label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="pk_live_..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">API Secret / Auth Signature (Optional):</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  placeholder="Secret key if required by provider"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Gateway HTTP Endpoint URL:</label>
                <input
                  type="url"
                  required
                  value={endpointUrl}
                  onChange={e => setEndpointUrl(e.target.value)}
                  placeholder="https://api.brandsms.pk/v2/send"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">SMS Credit Balance:</label>
                <input
                  type="number"
                  min="0"
                  value={gatewayCredits}
                  onChange={e => setGatewayCredits(Number(e.target.value))}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#1E2638] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/30"
                >
                  Save Gateway Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE WHATSAPP CAMPAIGN                           */}
      {/* ========================================================= */}
      {showNewWaCampaign && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-[#1E2638] p-5 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="font-bold text-white text-sm">Create WhatsApp Broadcast Campaign</h3>
              <button onClick={() => setShowNewWaCampaign(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchWaCampaign} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Campaign Title:</label>
                <input
                  type="text"
                  required
                  value={waCampaignTitle}
                  onChange={e => setWaCampaignTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Target Customer Segment:</label>
                <select
                  value={waTargetAudience}
                  onChange={e => setWaTargetAudience(e.target.value)}
                  className={inputCls}
                >
                  <option value="All Mechanics & Workshop Owners">Workshop Mechanics with Balance &gt; 0</option>
                  <option value="All Regular Walk-in Customers">All Regular Customers (Oil change offer)</option>
                  <option value="Wholesale Dealers">Wholesale Spare Part Buyers</option>
                  <option value="VIP Customers">VIP Gold Tier Customers</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Message Body (Supports Urdu & Placeholders):</label>
                <textarea
                  rows={4}
                  required
                  value={waMessageBody}
                  onChange={e => setWaMessageBody(e.target.value)}
                  className={`${inputCls} p-2.5 font-sans leading-relaxed`}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Placeholders: <code className="px-1 py-0.5 rounded bg-[#182030] text-rose-400">{'{customer_name}'}</code>, <code className="px-1 py-0.5 rounded bg-[#182030] text-rose-400">{'{due_amount}'}</code>
                </span>
              </div>

              {/* Direct WhatsApp Test Phone */}
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1E2638] space-y-1.5">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Instant WhatsApp Preview:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={waTestPhone}
                    onChange={e => setWaTestPhone(e.target.value)}
                    placeholder="+923001234567"
                    className="flex-1 p-1.5 border border-[#1E2638] rounded-lg bg-[#111622] text-slate-100 placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={openWhatsAppTest}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowNewWaCampaign(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-[#1E2638] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-500/25"
                >
                  Dispatch WhatsApp Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
