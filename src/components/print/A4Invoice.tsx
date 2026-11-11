import React, { useState } from 'react';
import { SalesInvoice } from '../../types';
import { Printer, X, Edit2, Check } from 'lucide-react';

interface A4InvoiceProps {
  invoice: SalesInvoice;
  onClose: () => void;
  onUpdateGreeting?: (newGreeting: string) => void;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({ invoice, onClose, onUpdateGreeting }) => {
  const [greeting, setGreeting] = useState<string>(invoice.greeting || 'خوش آمدید / Welcome to MotoPro');
  const [isEditingGreeting, setIsEditingGreeting] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const saveGreeting = () => {
    setIsEditingGreeting(false);
    if (onUpdateGreeting) {
      onUpdateGreeting(greeting);
    }
  };

  const taxRate = 0.17;
  // Use invoice's own taxAmount if present, else derive
  const taxAmount = invoice.taxAmount || 0;

  return (
    <>
      {/* Print-specific global styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body * { visibility: hidden; }
          #a4-invoice-printable, #a4-invoice-printable * { visibility: visible; }
          #a4-invoice-printable {
            position: fixed;
            top: 0;
            left: 0;
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Dark modal overlay */}
      <div className="no-print fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
        {/* Modal controls bar */}
        <div className="no-print w-full max-w-[220mm] mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-400" />
            <span className="text-white font-bold text-sm">A4 Invoice Preview</span>
            <span className="text-xs text-slate-400 ml-2">— #{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition"
            >
              <Printer className="w-4 h-4" />
              Print A4 Invoice
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
          id="a4-invoice-printable"
          className="bg-white text-black shadow-2xl"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '15mm 15mm 15mm 15mm',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: '1.4',
            boxSizing: 'border-box',
          }}
        >
          {/* ===== SHOP HEADER ===== */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '10px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20pt', fontWeight: 900, margin: 0, letterSpacing: '1px', textTransform: 'uppercase', color: '#111' }}>
              MotoPro Motorcycle Shop
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '10pt', color: '#444' }}>
              Genuine Motorcycle Parts &amp; Accessories
            </p>
            <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>
              Main Auto Market, Circular Road, Lahore, Pakistan
            </p>
            <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>
              Phone: +92 300 1234567 &nbsp;|&nbsp; NTN: 881920-1 &nbsp;|&nbsp; GST Reg: 12-00-1234-567-89
            </p>
          </div>

          {/* ===== INVOICE TITLE + META ===== */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            {/* Left: Invoice title */}
            <div>
              <h2 style={{ fontSize: '14pt', fontWeight: 800, margin: 0, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sales Invoice
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '9pt', color: '#555' }}>
                Original Copy — Retain for your records
              </p>
            </div>

            {/* Right: Invoice details box */}
            <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px 14px', fontSize: '9pt', minWidth: '160px', background: '#fafafa' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px', whiteSpace: 'nowrap' }}>Invoice No:</td>
                    <td style={{ fontWeight: 700, color: '#111' }}>{invoice.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ padding: '4px 0 6px' }}>
                      <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '4px', padding: '3px 6px', fontSize: '8.5pt' }}>
                        {isEditingGreeting ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={greeting}
                              onChange={e => setGreeting(e.target.value)}
                              style={{ width: '100%', fontSize: '8pt', padding: '2px 4px', border: '1px solid #16a34a', borderRadius: '3px' }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={saveGreeting}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}
                              title="Save Greeting"
                            >
                              <Check style={{ width: '10px', height: '10px' }} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontStyle: 'italic', color: '#166534' }}>
                              ✨ {greeting}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEditingGreeting(true)}
                              className="no-print"
                              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '0 2px' }}
                              title="Edit Greeting"
                            >
                              <Edit2 style={{ width: '10px', height: '10px' }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px' }}>Date:</td>
                    <td style={{ fontWeight: 600 }}>{invoice.createdAt.split(' ')[0] || invoice.createdAt.split('T')[0]}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '3px' }}>Counter:</td>
                    <td>{invoice.counterName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px' }}>Cashier:</td>
                    <td>{invoice.cashierName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== CUSTOMER INFO BOX ===== */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', background: '#fafafa' }}>
              <p style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#777', letterSpacing: '0.5px' }}>
                Bill To
              </p>
              <p style={{ margin: '0', fontWeight: 700, fontSize: '11pt', color: '#111' }}>{invoice.customerName}</p>
              {invoice.customerPhone && (
                <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#555' }}>Phone: {invoice.customerPhone}</p>
              )}
            </div>
            <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', background: '#fafafa' }}>
              <p style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', color: '#777', letterSpacing: '0.5px' }}>
                Payment Info
              </p>
              <p style={{ margin: '0', fontWeight: 700, fontSize: '10pt', color: '#111', textTransform: 'capitalize' }}>
                Method: {invoice.paymentMethod}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#555' }}>
                Status: <span style={{ fontWeight: 700, color: invoice.status === 'completed' ? '#16a34a' : '#dc2626', textTransform: 'capitalize' }}>{invoice.status}</span>
              </p>
            </div>
          </div>

          {/* ===== ITEMS TABLE ===== */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px', width: '36px' }}>Sr#</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px', width: '55px' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px', width: '90px' }}>Unit Price</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px', width: '90px' }}>Disc%</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.4px', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr
                  key={idx}
                  style={{ background: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}
                >
                  <td style={{ padding: '7px 10px', color: '#777', textAlign: 'left', fontSize: '9pt' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ fontWeight: 600, color: '#111' }}>{item.product.name}</span>
                    <span style={{ display: 'block', fontSize: '8pt', color: '#888', marginTop: '1px' }}>
                      SKU: {item.product.sku}
                      {item.product.compatibleModels && item.product.compatibleModels.length > 0 && (
                        <> &nbsp;|&nbsp; Fits: {item.product.compatibleModels.slice(0, 2).join(', ')}</>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity} {item.product.unit}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                    Rs. {item.unitPrice.toLocaleString()}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: item.discountPercent > 0 ? '#dc2626' : '#aaa' }}>
                    {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#111' }}>
                    Rs. {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== TOTALS SECTION ===== */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '9.5pt', minWidth: '220px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 12px 4px 0', color: '#555', textAlign: 'right' }}>Subtotal:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right', minWidth: '110px' }}>
                    Rs. {invoice.subtotal.toLocaleString()}
                  </td>
                </tr>
                {invoice.discountAmount > 0 && (
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#dc2626', textAlign: 'right' }}>Discount:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600, color: '#dc2626', textAlign: 'right' }}>
                      – Rs. {invoice.discountAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
                {invoice.pointsDiscountAmount > 0 && (
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#7c3aed', textAlign: 'right' }}>Loyalty Pts Discount:</td>
                    <td style={{ padding: '4px 0', fontWeight: 600, color: '#7c3aed', textAlign: 'right' }}>
                      – Rs. {invoice.pointsDiscountAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
                {taxAmount > 0 && (
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#555', textAlign: 'right' }}>GST (17%):</td>
                    <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right' }}>
                      Rs. {taxAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={2}
                    style={{ padding: '0', borderTop: '2px solid #1a1a1a', paddingTop: '0' }}
                  />
                </tr>
                <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                  <td style={{ padding: '8px 12px 8px 10px', fontWeight: 800, fontSize: '11pt', textAlign: 'right', textTransform: 'uppercase' }}>
                    Grand Total:
                  </td>
                  <td style={{ padding: '8px 10px 8px 0', fontWeight: 900, fontSize: '12pt', textAlign: 'right' }}>
                    Rs. {invoice.grandTotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 12px 4px 0', color: '#555', textAlign: 'right', fontSize: '9pt' }}>Cash Tendered:</td>
                  <td style={{ padding: '5px 0 4px', fontWeight: 600, textAlign: 'right', fontSize: '9pt' }}>
                    Rs. {invoice.paidAmount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 12px 4px 0', color: '#555', textAlign: 'right', fontSize: '9pt' }}>Change Due:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right', fontSize: '9pt' }}>
                    Rs. {invoice.changeDue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SPLIT PAYMENT DETAILS ===== */}
          {invoice.paymentMethod === 'split' && invoice.splitDetails && (
            <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '9pt', background: '#fffbeb' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#92400e' }}>Split Payment Details:</p>
              <p style={{ margin: '2px 0' }}>Cash Paid: Rs. {invoice.splitDetails.cashAmount.toLocaleString()}</p>
              <p style={{ margin: '2px 0', fontWeight: 700 }}>Added to Customer Ledger (Credit): Rs. {invoice.splitDetails.creditAmount.toLocaleString()}</p>
            </div>
          )}

          {/* ===== NOTES ===== */}
          {invoice.urduNote && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '9pt', color: '#555', background: '#f8fafc' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Notes: </span>{invoice.urduNote}
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div
            style={{
              borderTop: '2px solid #1a1a1a',
              paddingTop: '12px',
              marginTop: 'auto',
              textAlign: 'center',
            }}
          >
            {/* English footer */}
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '10pt', color: '#111' }}>
              Thank you for your business!
            </p>
            <p style={{ margin: '0 0 6px', fontSize: '8.5pt', color: '#555' }}>
              Electrical components &amp; consumables are <strong>non-returnable</strong>. All other items may be exchanged within <strong>3 days</strong> with original invoice. Warranty claims subject to manufacturer inspection.
            </p>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />

            {/* Urdu footer */}
            <p
              style={{
                margin: '0 0 4px',
                fontWeight: 700,
                fontSize: '11pt',
                color: '#111',
                direction: 'rtl',
                fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
              }}
            >
              خریداری کا شکریہ!
            </p>
            <p
              style={{
                margin: '0',
                fontSize: '9.5pt',
                color: '#555',
                direction: 'rtl',
                fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                lineHeight: '1.8',
              }}
            >
              برقی اجزاء اور قابل استعمال سامان واپس نہیں ہوگا۔ دیگر اشیاء اصل بل کے ساتھ ۳ دن کے اندر تبدیل کی جا سکتی ہیں۔
            </p>

            <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />

            <p style={{ margin: '0', fontSize: '7.5pt', color: '#aaa' }}>
              Powered by Cyberorion Motorcycle ERP &nbsp;•&nbsp; {invoice.invoiceNumber} &nbsp;•&nbsp; {invoice.createdAt.split(' ')[0] || invoice.createdAt.split('T')[0]}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
