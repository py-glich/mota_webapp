import React, { useState } from 'react';
import { Product } from '../../types';
import { Barcode, Printer, X, Copy, Check } from 'lucide-react';

interface BarcodeLabelProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeLabel: React.FC<BarcodeLabelProps> = ({ product, onClose }) => {
  const [copies, setCopies] = useState<number>(12);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const copyBarcode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Barcode Label Generator & Sheet Printing
              </h3>
              <p className="text-xs text-slate-500">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium text-slate-700 dark:text-slate-300">Labels to Print:</label>
              <input
                type="number"
                min="1"
                max="48"
                value={copies}
                onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-center"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Include Retail Price (Rs.)</span>
            </label>
          </div>

          <button
            onClick={copyBarcode}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-brand-600"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Barcode: {product.barcode}</span>
          </button>
        </div>

        {/* Printable Grid Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 dark:bg-slate-950 flex justify-center">
          <div className="bg-white p-4 shadow-md rounded border border-slate-300 max-w-xl w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: copies }).map((_, index) => (
              <div
                key={index}
                className="border border-dashed border-slate-400 p-2 text-center rounded flex flex-col justify-between bg-white text-black"
                style={{ height: '110px' }}
              >
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-tight truncate">CYBERORION MOTORS</div>
                  <div className="text-[10px] font-bold leading-tight line-clamp-1">{product.name}</div>
                  <div className="text-[8px] text-gray-500 font-mono">SKU: {product.sku} | Loc: {product.location.rack}</div>
                </div>

                {/* Simulated Barcode lines */}
                <div className="my-1 flex flex-col items-center">
                  <div className="h-7 w-full flex items-center justify-center gap-[1.5px] px-1 bg-white">
                    {product.barcode.split('').map((char, i) => {
                      const num = parseInt(char, 10) || 1;
                      const width = (num % 3) + 1;
                      return (
                        <span
                          key={i}
                          className="bg-black inline-block h-full"
                          style={{ width: `${width}px` }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest">{product.barcode}</span>
                </div>

                {showPrice && (
                  <div className="text-[10px] font-extrabold text-black">
                    Rs. {product.salePrice.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Standard 38mm x 25mm Label Size</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md shadow-brand-500/25 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
