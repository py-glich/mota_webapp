import React, { useState } from 'react';
import { 
  FileText, Plus, Search, MessageCircle, 
  Trash2, X, Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Quotation, CartItem } from '../types';
import { ActiveTab } from '../components/layout/Sidebar';

interface QuotationsPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

/* ─── Inline A4 Quotation Print Component ─── */
interface QuotationA4Props {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationA4Print: React.FC<QuotationA4Props> = ({ quotation, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #a4-quotation-printable, #a4-quotation-printable * { visibility: visible; }
          #a4-quotation-printable {
            position: fixed;
            top: 0; left: 0;
            width: 210mm;
            min-height: 297mm;
            margin: 0; padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Dark overlay */}
      <div className="no-print fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
        {/* Controls bar */}
        <div className="no-print w-full max-w-[220mm] mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-400" />
            <span className="text-white font-bold text-sm">A4 Quotation Preview — #{quotation.quoteNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition"
            >
              <Printer className="w-4 h-4" />
              Print A4 Quotation
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* A4 Paper */}
        <div
          id="a4-quotation-printable"
          className="bg-white text-black shadow-2xl"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '15mm',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: '1.4',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '10px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20pt', fontWeight: 900, margin: 0, letterSpacing: '1px', textTransform: 'uppercase', color: '#111' }}>
              MotoPro Motorcycle Shop
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '10pt', color: '#444' }}>Genuine Motorcycle Parts &amp; Accessories</p>
            <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>Main Auto Market, Circular Road, Lahore, Pakistan</p>
            <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>Phone: +92 300 1234567 &nbsp;|&nbsp; NTN: 881920-1</p>
          </div>

          {/* Quotation title + meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '14pt', fontWeight: 800, margin: 0, color: '#111', textTransform: 'uppercase' }}>
                Customer Quotation / Estimate
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '9pt', color: '#888' }}>This is not a sales invoice — no stock has been deducted.</p>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px 14px', fontSize: '9pt', minWidth: '160px', background: '#fafafa' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px', whiteSpace: 'nowrap' }}>Quote No:</td>
                    <td style={{ fontWeight: 700, color: '#111' }}>{quotation.quoteNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px' }}>Date:</td>
                    <td style={{ fontWeight: 600 }}>{quotation.createdAt?.split('T')[0] || quotation.createdAt?.split(' ')[0] || '—'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px' }}>Valid Until:</td>
                    <td style={{ fontWeight: 600, color: '#dc2626' }}>{quotation.validUntil}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px' }}>Status:</td>
                    <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{quotation.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer + Bike */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', background: '#fafafa' }}>
              <p style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#777' }}>Prepared For</p>
              <p style={{ margin: '0', fontWeight: 700, fontSize: '11pt', color: '#111' }}>{quotation.customerName}</p>
              {quotation.customerPhone && (
                <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#555' }}>Phone: {quotation.customerPhone}</p>
              )}
            </div>
            {quotation.bikeModel && (
              <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', background: '#fafafa' }}>
                <p style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#777' }}>Motorcycle Model</p>
                <p style={{ margin: '0', fontWeight: 700, fontSize: '11pt', color: '#111' }}>{quotation.bikeModel}</p>
              </div>
            )}
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '8.5pt', textTransform: 'uppercase', width: '36px' }}>Sr#</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '8.5pt', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '8.5pt', textTransform: 'uppercase', width: '55px' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '8.5pt', textTransform: 'uppercase', width: '100px' }}>Unit Price</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '8.5pt', textTransform: 'uppercase', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '7px 10px', color: '#777' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                    <span style={{ display: 'block', fontSize: '8pt', color: '#888' }}>SKU: {item.product.sku}</span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600 }}>{item.quantity} {item.product.unit}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>Rs. {item.unitPrice.toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>Rs. {item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '9.5pt', minWidth: '220px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 12px 4px 0', color: '#555', textAlign: 'right' }}>Subtotal:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right', minWidth: '110px' }}>Rs. {quotation.subtotal.toLocaleString()}</td>
                </tr>
                {quotation.discountAmount > 0 && (
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#dc2626', textAlign: 'right' }}>Discount:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600, color: '#dc2626', textAlign: 'right' }}>– Rs. {quotation.discountAmount.toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ padding: '0', borderTop: '2px solid #1a1a1a' }} />
                </tr>
                <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                  <td style={{ padding: '8px 12px 8px 10px', fontWeight: 800, fontSize: '11pt', textAlign: 'right', textTransform: 'uppercase' }}>Estimated Total:</td>
                  <td style={{ padding: '8px 10px 8px 0', fontWeight: 900, fontSize: '12pt', textAlign: 'right' }}>Rs. {quotation.grandTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '9pt', color: '#555', background: '#f8fafc' }}>
              <span style={{ fontWeight: 600 }}>Notes: </span>{quotation.notes}
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '12px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '10pt', color: '#111' }}>
              Thank you for your interest!
            </p>
            <p style={{ margin: '0 0 6px', fontSize: '8.5pt', color: '#555' }}>
              This quotation is valid until <strong>{quotation.validUntil}</strong>. Prices are subject to change. Contact us to confirm availability.
            </p>
            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '11pt', color: '#111', direction: 'rtl', fontFamily: "'Noto Nastaliq Urdu', serif" }}>
              آپ کی دلچسپی کا شکریہ!
            </p>
            <p style={{ margin: '0', fontSize: '9pt', color: '#555', direction: 'rtl', fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: '1.8' }}>
              یہ کوٹیشن {quotation.validUntil} تک قابل قبول ہے۔ تصدیق کے لیے ہم سے رابطہ کریں۔
            </p>
            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />
            <p style={{ margin: '0', fontSize: '7.5pt', color: '#aaa' }}>
              Powered by Cyberorion Motorcycle ERP &nbsp;•&nbsp; {quotation.quoteNumber}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const QuotationsPage: React.FC<QuotationsPageProps> = ({ setActiveTab }) => {
  const { quotations, addQuotation, updateQuotationStatus, products, customers, completeSalesInvoice } = useApp();
  const { currentCounter, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [a4Quote, setA4Quote] = useState<Quotation | null>(null);

  // Shared dark theme class string
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';
  const smallInputCls = 'p-1.5 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[1]?.id || 'CUST-002');
  const [bikeModel, setBikeModel] = useState('Honda CG125 (Special Edition)');
  const [validDays, setValidDays] = useState(7);
  const [quoteItems, setQuoteItems] = useState<CartItem[]>([]);
  const [tempProductId, setTempProductId] = useState(products[0]?.id || '');
  const [tempQty, setTempQty] = useState(1);
  const [notes, setNotes] = useState('Prices valid for 7 days. Labor & tuning charges included.');

  const addItem = () => {
    const prod = products.find(p => p.id === tempProductId);
    if (!prod) return;

    const lineTotal = tempQty * prod.salePrice;
    setQuoteItems(prev => [
      ...prev,
      {
        product: prod,
        quantity: tempQty,
        unitPrice: prod.salePrice,
        discountPercent: 0,
        discountAmount: 0,
        total: lineTotal
      }
    ]);
  };

  const removeItem = (idx: number) => {
    setQuoteItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = quoteItems.reduce((s, i) => s + i.total, 0);

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      alert('Please add at least one motorcycle part to the quotation.');
      return;
    }

    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validDays);

    addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      bikeModel,
      validUntil: expiryDate.toISOString().split('T')[0],
      items: quoteItems,
      subtotal,
      discountAmount: 0,
      grandTotal: subtotal,
      status: 'sent',
      notes
    });

    setShowCreateModal(false);
    setQuoteItems([]);
    alert('Quotation generated without altering inventory stock.');
  };

  const shareWhatsApp = (q: Quotation) => {
    const partsList = q.items.map(i => `• ${i.product.name} (${i.quantity} ${i.product.unit}) - Rs. ${i.total}`).join('\n');
    const msg = encodeURIComponent(
      `سلام ${q.customerName} صاحب!\nCYBERORION MOTORCYCLE SHOP کی طرف سے کوٹیشن:\n\nبائیک: ${q.bikeModel || 'General'}\nکوٹیشن نمبر: ${q.quoteNumber}\n\nتفصیل:\n${partsList}\n\nکل تخمینہ رقم: Rs. ${q.grandTotal.toLocaleString()}\nتاریخ میعاد: ${q.validUntil}\nشکریہ! رابطہ: 0300-1234567`
    );
    window.open(`https://wa.me/${q.customerPhone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  const convertToInvoice = (q: Quotation) => {
    if (confirm(`Convert Quotation ${q.quoteNumber} into an active POS Sales Invoice? Stock will be deducted immediately.`)) {
      completeSalesInvoice({
        counterId: currentCounter.id,
        counterName: currentCounter.name,
        cashierId: currentUser.id,
        cashierName: currentUser.name,
        customerId: q.customerId,
        customerName: q.customerName,
        customerPhone: q.customerPhone,
        items: q.items,
        subtotal: q.subtotal,
        taxAmount: 0,
        discountAmount: q.discountAmount,
        pointsDiscountAmount: 0,
        pointsRedeemed: 0,
        grandTotal: q.grandTotal,
        paidAmount: q.grandTotal,
        changeDue: 0,
        paymentMethod: 'cash',
        status: 'completed',
        urduNote: `Converted from Estimate ${q.quoteNumber}`
      });

      updateQuotationStatus(q.id, 'converted');
      alert(`Quotation ${q.quoteNumber} successfully converted to completed Sales Invoice!`);
      setActiveTab('pos');
    }
  };

  const filteredQuotes = quotations.filter(q => 
    q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto pb-28"
      style={{ colorScheme: 'dark' }}
    >
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              Estimates & Customer Quotations
            </h1>
            <p className="text-xs text-slate-400">
              Create parts estimates without deducting stock, share directly via WhatsApp, and convert into POS sales invoices.
            </p>
          </div>

          <button
            onClick={() => {
              setQuoteItems([]);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation / Estimate</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search quotation # or customer name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Quote #</th>
                  <th className="p-3">Customer & Bike</th>
                  <th className="p-3">Validity</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Estimated Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredQuotes.map(q => (
                  <tr key={q.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-white">
                      {q.quoteNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{q.customerName}</div>
                      <div className="text-[10px] text-brand-500">{q.bikeModel}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      Valid till: {q.validUntil}
                    </td>
                    <td className="p-3 text-slate-300">{q.items.length} parts</td>
                    <td className="p-3 font-mono font-bold text-sm text-white">
                      Rs. {q.grandTotal.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.status === 'converted' ? 'bg-emerald-950 text-emerald-400' :
                        q.status === 'approved' ? 'bg-blue-950 text-blue-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {/* A4 Print */}
                      <button
                        onClick={() => setA4Quote(q)}
                        className="p-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 transition"
                        title="Print A4 Quotation"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Share to WhatsApp */}
                      <button
                        onClick={() => shareWhatsApp(q)}
                        className="p-1.5 rounded-lg bg-green-950 hover:bg-green-900 text-green-400 transition"
                        title="Share via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Convert to Sales Invoice */}
                      {q.status !== 'converted' && (
                        <button
                          onClick={() => convertToInvoice(q)}
                          className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] transition shadow-xs"
                        >
                          Convert to Invoice →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Create Customer Quotation / Repair Estimate
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Customer:</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className={inputCls}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Motorcycle Model:</label>
                  <input
                    type="text"
                    value={bikeModel}
                    onChange={e => setBikeModel(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Add item */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Add Part Line:</span>
                <div className="flex gap-2">
                  <select
                    value={tempProductId}
                    onChange={e => setTempProductId(e.target.value)}
                    className={`flex-1 ${smallInputCls}`}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - Rs. {p.salePrice}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={tempQty}
                    onChange={e => setTempQty(parseInt(e.target.value) || 1)}
                    className={`w-16 ${smallInputCls} font-bold text-center`}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800">
                {quoteItems.length === 0 && (
                  <div className="p-4 text-center text-slate-400">No parts added yet.</div>
                )}
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="p-2 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-100">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.quantity} pcs @ Rs. {item.unitPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Rs. {item.total.toLocaleString()}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-300 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-base pt-2">
                <span className="text-slate-200">Estimated Total:</span>
                <span className="text-brand-500">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 QUOTATION PRINT MODAL */}
      {a4Quote && (
        <QuotationA4Print quotation={a4Quote} onClose={() => setA4Quote(null)} />
      )}
    </div>
  );
};