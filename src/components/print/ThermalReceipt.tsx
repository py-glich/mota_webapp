import React, { useState } from 'react';
import { SalesInvoice } from '../../types';
import { Printer, Download, Globe, X, FileText, Edit2, Check } from 'lucide-react';

interface ThermalReceiptProps {
  invoice: SalesInvoice;
  onClose: () => void;
  onPrintA4?: () => void;
  onUpdateGreeting?: (newGreeting: string) => void;
  onUpdateFooterNote?: (newNote: string) => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, onClose, onPrintA4, onUpdateGreeting, onUpdateFooterNote }) => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [language, setLanguage] = useState<'english' | 'urdu'>('urdu');
  const [greeting, setGreeting] = useState<string>(invoice.greeting || '');
  const [isEditingGreeting, setIsEditingGreeting] = useState<boolean>(false);
  const [footerNote, setFooterNote] = useState<string>(
    invoice.urduNote || 'خریداری کا شکریہ! برقی سامان کی واپسی یا تبدیلی نہیں ہوگی۔ سامان 3 دن کے اندر بل کے ساتھ تبدیل کیا جا سکتا ہے۔'
  );
  const [isEditingFooter, setIsEditingFooter] = useState<boolean>(false);

  const saveFooterNote = () => {
    setIsEditingFooter(false);
    if (onUpdateFooterNote) {
      onUpdateFooterNote(footerNote);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const saveGreeting = () => {
    setIsEditingGreeting(false);
    if (onUpdateGreeting) {
      onUpdateGreeting(greeting);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col my-auto max-h-[92vh]">
        {/* Modal Controls Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Thermal Receipt Preview</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size selector */}
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-1 rounded-md font-semibold transition ${paperWidth === '80mm' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-1 rounded-md font-semibold transition ${paperWidth === '58mm' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                58mm
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(l => l === 'english' ? 'urdu' : 'english')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 text-xs font-bold hover:bg-orange-200 transition"
              title="Toggle Urdu / English receipt"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'english' ? 'اردو' : 'ENG'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 dark:bg-slate-950 flex justify-center">
          <div
            id="printable-receipt"
            className={`bg-white text-black p-4 font-mono shadow-md border border-slate-300 transition-all ${
              paperWidth === '80mm' ? 'w-[78mm] text-[11px]' : 'w-[56mm] text-[9.5px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="font-extrabold text-sm tracking-tighter uppercase">CYBERORION MOTORS</h2>
              <p className="text-[10px] leading-tight font-sans">GENUINE MOTORCYCLE PARTS & SERVICE</p>
              <p className="text-[9px] text-gray-700 font-sans mt-0.5">Main Auto Market, Circular Road, Lahore</p>
              <p className="text-[9px] text-gray-700 font-sans">Helpline: +92 300 1234567 | NTN: 881920-1</p>
            </div>

            {/* Metadata */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="font-bold">Inv: #{invoice.invoiceNumber}</span>
                <span>Date: {invoice.createdAt.split(' ')[0]}</span>
              </div>

              {/* Optional Custom Greeting Message */}
              {(greeting || isEditingGreeting) ? (
                <div className="py-1 px-1.5 my-1 bg-slate-50 border border-dotted border-slate-300 rounded text-center">
                  {isEditingGreeting ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={greeting}
                        onChange={e => setGreeting(e.target.value)}
                        placeholder="Enter custom note/greeting..."
                        className="w-full text-[10px] font-bold text-center px-1 py-0.5 border border-rose-400 rounded bg-white text-black focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveGreeting}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition shrink-0"
                        title="Save Greeting"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <span className="flex-1 font-bold italic text-slate-800 text-[10px] tracking-tight">
                        {greeting}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingGreeting(true)}
                        className="no-print p-0.5 text-slate-400 hover:text-rose-600 transition"
                        title="Edit Message"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-print flex justify-end my-0.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingGreeting(true)}
                    className="text-[9px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition"
                    title="Add custom greeting or note to receipt"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>+ Add Note / Greeting</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between">
                <span>Terminal: {invoice.counterName.split(' ')[0]}</span>
                <span>Time: {invoice.createdAt.split(' ')[1] || '10:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier: {invoice.cashierName}</span>
                <span>Pay: {invoice.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-t border-dotted border-gray-400 pt-1 mt-1 font-bold">
                <span>Customer:</span>
                <span className="truncate max-w-[140px]">{invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold border-b border-dotted border-black pb-1 mb-1 text-[9px] uppercase">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>

              <div className="space-y-1.5">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold truncate">
                      {language === 'urdu' && item.product.urduName ? (
                        <span className="urdu-font text-xs font-bold">{item.product.urduName}</span>
                      ) : (
                        item.product.name
                      )}
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>{item.quantity} {item.product.unit} @ {item.unitPrice}</span>
                      <span className="font-bold text-black">{item.total.toLocaleString()}</span>
                    </div>
                    {item.discountAmount > 0 && (
                      <div className="text-[8.5px] text-gray-500 text-right">
                        Disc: -Rs. {item.discountAmount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Special Discount:</span>
                  <span>-Rs. {invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Loyalty Points Redeemed:</span>
                  <span>-Rs. {invoice.pointsDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>Rs. {invoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-800">
                <span>Cash Tendered:</span>
                <span>Rs. {invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change Due:</span>
                <span>Rs. {invoice.changeDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Split Details if applicable */}
            {invoice.paymentMethod === 'split' && invoice.splitDetails && (
              <div className="py-1 border-b border-dashed border-black text-[9px] text-gray-700">
                <div className="flex justify-between">
                  <span>Cash Paid:</span>
                  <span>Rs. {invoice.splitDetails.cashAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-black">
                  <span>Added to Customer Ledger:</span>
                  <span>Rs. {invoice.splitDetails.creditAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Barcode & Footer Notice */}
            <div className="text-center pt-3 space-y-2">
              {/* Barcode representation */}
              <div className="inline-block px-3 py-1 border border-black text-[9px] tracking-widest font-mono font-bold">
                * {invoice.invoiceNumber} *
              </div>

              {/* Bilingual Notice / Editable Footer */}
              <div className="pt-1">
                {isEditingFooter ? (
                  <div className="space-y-1 bg-slate-50 border border-rose-400 p-1.5 rounded-lg">
                    <textarea
                      value={footerNote}
                      onChange={e => setFooterNote(e.target.value)}
                      rows={2}
                      className="w-full text-[10px] font-sans p-1 border border-slate-300 rounded bg-white text-black focus:outline-none"
                      placeholder="Enter footer terms or thank-you note..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingFooter(false)}
                        className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] rounded font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveFooterNote}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] rounded font-bold flex items-center gap-0.5"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    {language === 'urdu' ? (
                      <div className="urdu-font text-[10px] leading-relaxed text-gray-800 font-medium px-2">
                        {footerNote}
                      </div>
                    ) : (
                      <div className="text-[8.5px] leading-tight text-gray-600 font-sans px-2">
                        {footerNote}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingFooter(true)}
                      className="no-print mt-1 inline-flex items-center gap-1 text-[9px] text-slate-400 hover:text-rose-600 px-2 py-0.5 rounded border border-transparent hover:border-slate-200 transition"
                      title="Edit Footer Note / Policy"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Edit Notice / نوٹ تبدیل کریں</span>
                    </button>
                  </div>
                )}
              </div>

              <p className="text-[8px] text-gray-500 font-sans">Powered by Cyberorion Motorcycle ERP</p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Press Print or Ctrl+P</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
            {onPrintA4 && (
              <button
                onClick={onPrintA4}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-500/25 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>A4 Invoice</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md shadow-brand-500/25 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
