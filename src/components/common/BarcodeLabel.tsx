import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Product } from '../../types';
import { Barcode, Printer, X, Copy, Check, Settings2, Sliders, Layers, Eye } from 'lucide-react';

interface BarcodeLabelProps {
  product: Product;
  onClose: () => void;
}

// Individual Scannable Barcode SVG Component
const RealBarcodeSvg: React.FC<{
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}> = ({ value, width = 1.3, height = 32, displayValue = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Ensure clean alphanumeric string for CODE128
        const cleanVal = String(value).trim() || '896000000000';
        JsBarcode(svgRef.current, cleanVal, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          font: 'monospace',
          fontSize: 10,
          textMargin: 2,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch (err) {
        console.warn('Barcode generation warning:', err);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef} className="max-w-full block mx-auto" />;
};

export const BarcodeLabel: React.FC<BarcodeLabelProps> = ({ product, onClose }) => {
  const [copies, setCopies] = useState<number>(12);
  const [paperMode, setPaperMode] = useState<'sheet' | 'roll'>('sheet');
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25' | '60x40'>('50x30');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showShopName, setShowShopName] = useState<boolean>(true);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [shopName, setShopName] = useState<string>('MotoPro Auto Parts');
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const copyBarcode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dimensions based on preset
  const labelDimensions = {
    '50x30': { width: '50mm', minHeight: '30mm', barWidth: 1.3, barHeight: 30 },
    '38x25': { width: '38mm', minHeight: '25mm', barWidth: 1.0, barHeight: 22 },
    '60x40': { width: '60mm', minHeight: '40mm', barWidth: 1.5, barHeight: 38 },
  }[labelSize];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print-specific CSS injected directly */}
      <style>{`
        @media print {
          /* Hide everything in the page except the printable barcode container */
          body * {
            visibility: hidden !important;
          }
          #barcode-printable-area, #barcode-printable-area * {
            visibility: visible !important;
          }
          #barcode-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .barcode-sticker-card {
            border: 1px dashed #64748b !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .barcode-sticker-card svg {
            filter: contrast(200%) !important;
          }
          /* Thermal roll mode: break page after each label */
          .print-roll-mode .barcode-sticker-card {
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
            border: none !important;
          }
          @page {
            margin: 4mm;
            size: ${paperMode === 'roll' ? `${labelDimensions.width} ${labelDimensions.minHeight}` : 'auto'};
          }
        }
      `}</style>

      <div className="bg-[#111622] rounded-2xl shadow-2xl max-w-4xl w-full border border-[#1E2638] flex flex-col my-auto max-h-[94vh] overflow-hidden text-slate-100">
        {/* Modal Controls Header (no-print) */}
        <div className="p-4 bg-[#0B0E14] border-b border-[#1E2638] flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/10 border border-rose-600/30 flex items-center justify-center text-rose-500">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                Barcode Label Generator & Thermal Printing
              </h3>
              <p className="text-xs text-slate-400">
                {product.name} • <span className="font-mono text-rose-400 font-bold">{product.sku}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyBarcode}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C2C] border border-[#1E2638] text-xs text-slate-300 hover:text-white transition"
              title="Copy Barcode string to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="font-mono">{product.barcode}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A2234] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Toolbar (no-print) */}
        <div className="p-4 bg-[#0E131F] border-b border-[#1E2638] space-y-3 no-print text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Copies */}
            <div>
              <label className="font-semibold block mb-1 text-slate-400">Labels Count:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#1E2638] bg-[#161C2C] text-white font-bold text-center focus:outline-none focus:border-rose-500"
                />
                <div className="flex gap-1 shrink-0">
                  {[1, 6, 12, 24].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCopies(n)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${copies === n ? 'bg-rose-600 text-white' : 'bg-[#161C2C] text-slate-400 hover:bg-[#1E2638]'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Print Mode: Sheet vs Roll */}
            <div>
              <label className="font-semibold block mb-1 text-slate-400">Printer / Paper Type:</label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#161C2C] p-1 rounded-xl border border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setPaperMode('sheet')}
                  className={`py-1 rounded-lg font-bold text-[11px] transition ${paperMode === 'sheet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  A4 Sticker Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setPaperMode('roll')}
                  className={`py-1 rounded-lg font-bold text-[11px] transition ${paperMode === 'roll' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Thermal Roll
                </button>
              </div>
            </div>

            {/* Label Size Preset */}
            <div>
              <label className="font-semibold block mb-1 text-slate-400">Sticker Dimensions:</label>
              <select
                value={labelSize}
                onChange={e => setLabelSize(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#1E2638] bg-[#161C2C] text-white font-semibold focus:outline-none focus:border-rose-500"
              >
                <option value="50x30">Standard (50mm × 30mm)</option>
                <option value="38x25">Compact Roll (38mm × 25mm)</option>
                <option value="60x40">Large Tag (60mm × 40mm)</option>
              </select>
            </div>

            {/* Shop Header Name */}
            <div>
              <label className="font-semibold block mb-1 text-slate-400">Shop Header Title:</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#1E2638] bg-[#161C2C] text-white text-xs focus:outline-none focus:border-rose-500"
                placeholder="Shop branding..."
              />
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-[#1E2638]/60 text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showShopName}
                onChange={e => setShowShopName(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 bg-[#161C2C] border-slate-700"
              />
              <span>Shop Branding Header</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 bg-[#161C2C] border-slate-700"
              />
              <span className="font-bold text-amber-400">Retail Price (Rs.)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLocation}
                onChange={e => setShowLocation(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 bg-[#161C2C] border-slate-700"
              />
              <span>Rack / Bin Location</span>
            </label>
          </div>
        </div>

        {/* Printable Grid Preview (Both Browser View and Print Target) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex justify-center">
          <div
            id="barcode-printable-area"
            className={`w-full max-w-3xl ${
              paperMode === 'roll'
                ? 'print-roll-mode flex flex-col items-center gap-3'
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 p-2 bg-white rounded-xl shadow-inner'
            }`}
          >
            {Array.from({ length: copies }).map((_, index) => (
              <div
                key={index}
                className="barcode-sticker-card border border-dashed border-slate-400 p-2 text-center rounded-lg flex flex-col justify-between bg-white text-black shadow-xs mx-auto"
                style={{
                  width: labelDimensions.width,
                  minHeight: labelDimensions.minHeight,
                  boxSizing: 'border-box'
                }}
              >
                {/* Header */}
                <div>
                  {showShopName && (
                    <div className="text-[8px] font-black uppercase tracking-wider text-slate-800 leading-tight">
                      {shopName}
                    </div>
                  )}
                  <div className="text-[9.5px] font-extrabold text-black leading-snug line-clamp-2 mt-0.5">
                    {product.name}
                  </div>
                  <div className="text-[7.5px] text-slate-600 font-mono mt-0.5">
                    SKU: {product.sku} {showLocation && product.location?.rack ? `| Rack: ${product.location.rack}` : ''}
                  </div>
                </div>

                {/* Real Code 128 Barcode SVG */}
                <div className="my-1 flex flex-col items-center justify-center bg-white">
                  <RealBarcodeSvg
                    value={product.barcode}
                    width={labelDimensions.barWidth}
                    height={labelDimensions.barHeight}
                    displayValue={true}
                  />
                </div>

                {/* Price Tag */}
                {showPrice && (
                  <div className="text-[10px] font-black text-black border-t border-slate-200 pt-0.5 flex items-center justify-between">
                    <span className="text-[7.5px] text-slate-500 font-bold">MRP:</span>
                    <span className="font-extrabold">Rs. {product.salePrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Controls (no-print) */}
        <div className="p-4 bg-[#0B0E14] border-t border-[#1E2638] flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-slate-200">{copies} Labels</span>
            <span>•</span>
            <span className="capitalize">{paperMode === 'sheet' ? 'A4 Multi-Sticker Sheet' : 'Thermal Continuous Roll'}</span>
            <span>•</span>
            <span>{labelDimensions.width} × {labelDimensions.minHeight}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#161C2C] border border-[#1E2638] transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/25 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Barcode Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
