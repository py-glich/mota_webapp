import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Barcode, Trash2, Plus, Minus, CreditCard, Banknote, 
  RotateCcw, Printer, CheckCircle, AlertCircle, User, Sparkles, 
  ShoppingBag, ShieldAlert, ArrowRight, X, Clock, Eye, Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Product, CartItem, Customer, PaymentMethod, SalesInvoice } from '../types';
import { ThermalReceipt } from '../components/print/ThermalReceipt';
import { A4Invoice } from '../components/print/A4Invoice';
import { getProductDisplayImage } from '../utils/imageUtils';

export const PosPage: React.FC = () => {
  const { products, customers, completeSalesInvoice, invoices, voidSalesInvoice } = useApp();
  const { currentCounter, currentUser, hasPermission } = useAuth();

  // POS State
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [billDiscountAmount, setBillDiscountAmount] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedCash, setTenderedCash] = useState<string>('');
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCredit, setSplitCredit] = useState<number>(0);
  
  // Modals & Popups
  const [activeReceipt, setActiveReceipt] = useState<SalesInvoice | null>(null);
  const [a4Receipt, setA4Receipt] = useState<SalesInvoice | null>(null);
  const [showRecentInvoices, setShowRecentInvoices] = useState<boolean>(false);
  const [voidModalInvoice, setVoidModalInvoice] = useState<SalesInvoice | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected Customer details
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Motorcycle model quick filters
  const motoModels = ['All', 'Honda CD70', 'Honda CG125', 'Yamaha YBR125', 'Suzuki GS150', 'Universal'];

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Clear current cart?')) {
          setCart([]);
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMethod('cash');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Handle Barcode enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(p => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      alert(`Product with barcode or SKU "${barcodeInput}" not found.`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      alert(`"${product.name}" is currently Out of Stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          alert(`Cannot add more than available stock (${product.currentStock} ${product.unit}).`);
          return prev;
        }
        return prev.map(item => {
          if (item.product.id === product.id) {
            const newQty = item.quantity + 1;
            const lineSub = newQty * item.unitPrice;
            const lineDisc = (lineSub * item.discountPercent) / 100;
            return {
              ...item,
              quantity: newQty,
              discountAmount: lineDisc,
              total: lineSub - lineDisc
            };
          }
          return item;
        });
      }

      // Determine initial price based on customer group
      let initialPrice = product.salePrice;
      if (selectedCustomer.group === 'Mechanic') initialPrice = product.mechanicPrice;
      if (selectedCustomer.group === 'Wholesale') initialPrice = product.wholesalePrice;

      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: initialPrice,
        discountPercent: 0,
        discountAmount: 0,
        total: initialPrice
      };
      return [...prev, newItem];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null as any;
        if (newQty > item.product.currentStock) {
          alert(`Maximum stock available is ${item.product.currentStock}.`);
          return item;
        }
        const lineSub = newQty * item.unitPrice;
        const lineDisc = (lineSub * item.discountPercent) / 100;
        return {
          ...item,
          quantity: newQty,
          discountAmount: lineDisc,
          total: lineSub - lineDisc
        };
      }
      return item;
    }).filter(Boolean));
  };

  const updateCartUnitPrice = (productId: string, newPrice: number) => {
    if (!hasPermission('canOverridePrice')) {
      alert('Security: You do not have permission to modify unit selling prices.');
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const lineSub = item.quantity * newPrice;
        const lineDisc = (lineSub * item.discountPercent) / 100;
        return {
          ...item,
          unitPrice: newPrice,
          discountAmount: lineDisc,
          total: lineSub - lineDisc
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const itemsDiscountTotal = cart.reduce((sum, item) => sum + item.discountAmount, 0);
  
  // Points calculation: 1 pt = Rs. 1
  const maxRedeemable = Math.min(selectedCustomer.loyaltyPoints || 0, cartSubtotal - billDiscountAmount);
  const pointsDiscount = Math.min(pointsToRedeem, maxRedeemable);

  const grandTotal = Math.max(0, cartSubtotal - itemsDiscountTotal - billDiscountAmount - pointsDiscount);
  
  const parsedTendered = parseFloat(tenderedCash) || 0;
  const changeDue = Math.max(0, parsedTendered - grandTotal);

  // Auto-fill split amounts when grandTotal changes or mode selected
  useEffect(() => {
    if (paymentMethod === 'split') {
      const half = Math.floor(grandTotal / 2);
      setSplitCash(half);
      setSplitCredit(grandTotal - half);
    }
  }, [paymentMethod, grandTotal]);

  // Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add products before checkout.');
      return;
    }

    // Check discount permission
    const totalDiscount = itemsDiscountTotal + billDiscountAmount;
    const discountPct = cartSubtotal > 0 ? (totalDiscount / cartSubtotal) * 100 : 0;
    if (discountPct > currentUser.permissions.maxDiscountPercent) {
      alert(`Permission Denied: Total discount of ${discountPct.toFixed(1)}% exceeds your authorized limit of ${currentUser.permissions.maxDiscountPercent}%. Manager authorization required.`);
      return;
    }

    // Check customer credit limit if credit payment
    if (paymentMethod === 'credit' || (paymentMethod === 'split' && splitCredit > 0)) {
      if (selectedCustomer.id === 'CUST-001') {
        alert('Walk-in Cash Customer cannot purchase on credit. Please register or select an account customer.');
        return;
      }
      const newBalance = selectedCustomer.receivableBalance + (paymentMethod === 'credit' ? grandTotal : splitCredit);
      if (newBalance > selectedCustomer.creditLimit) {
        if (!confirm(`Warning: Customer credit limit of Rs. ${selectedCustomer.creditLimit.toLocaleString()} will be exceeded. New balance will be Rs. ${newBalance.toLocaleString()}. Proceed anyway?`)) {
          return;
        }
      }
    }

    // Complete transaction
    const completedInv = completeSalesInvoice({
      counterId: currentCounter.id,
      counterName: currentCounter.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      items: cart,
      subtotal: cartSubtotal,
      taxAmount: 0,
      discountAmount: itemsDiscountTotal + billDiscountAmount,
      pointsDiscountAmount: pointsDiscount,
      pointsRedeemed: pointsToRedeem,
      grandTotal,
      paidAmount: paymentMethod === 'cash' ? (parsedTendered || grandTotal) : grandTotal,
      changeDue: paymentMethod === 'cash' ? changeDue : 0,
      paymentMethod,
      splitDetails: paymentMethod === 'split' ? {
        cashAmount: splitCash,
        bankAmount: 0,
        creditAmount: splitCredit
      } : undefined,
      status: 'completed',
      urduNote: 'خریداری کا شکریہ! برقی سامان کی واپسی نہیں ہوگی۔'
    });

    // Reset POS cart
    setCart([]);
    setBillDiscountAmount(0);
    setPointsToRedeem(0);
    setTenderedCash('');
    setActiveReceipt(completedInv);
  };

  // Filter Catalog
  const filteredProducts = products.filter(p => {
    if (p.isArchived) return false;
    const matchQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchModel = selectedModel === 'All' || p.compatibleModels.includes(selectedModel) || p.compatibleModels.includes('Universal');
    const matchCategory = selectedCategory === 'All' || p.categoryId === selectedCategory;

    return matchQuery && matchModel && matchCategory;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0A0D14] text-slate-100">
      {/* MOBILE RESPONSIVE TAB SWITCHER (Visible on screens < lg) */}
      <div className="lg:hidden flex bg-[#0B0E14] border-b border-[#1E2638] p-1.5 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'catalog'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Parts Catalog ({filteredProducts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
            mobileTab === 'cart'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart & Bill</span>
          {cart.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-white text-rose-600 rounded-full text-[10px] font-black">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT: Product Catalog & Search (60% on desktop, full on mobile when catalog active) */}
        <div className={`flex-1 flex flex-col border-r border-[#1E2638] overflow-hidden ${mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Barcode & Search Controls */}
          <div className="p-3 bg-[#111622] border-b border-[#1E2638] space-y-2.5">
            <div className="flex items-center gap-2">
              {/* Barcode Fast Scan Input */}
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan Barcode or Type SKU (F1)..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </form>

              {/* Keyword Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search part name or model (F2)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Recent Invoices button */}
              <button
                onClick={() => setShowRecentInvoices(true)}
                className="px-3 py-2 bg-[#1A2234] hover:bg-[#202A40] rounded-xl text-xs font-semibold text-slate-200 border border-[#26334D] flex items-center gap-1.5 transition"
                title="Recent Invoices & Void"
              >
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Recent Bills</span>
              </button>
            </div>

            {/* Model Chips Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Model:</span>
              {motoModels.map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition text-xs ${
                    selectedModel === model
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-[#0B0E14] border border-[#1E2638] text-slate-400 hover:text-white'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 content-start pb-28">
            {filteredProducts.map((product, index) => {
              const inCart = cart.find(i => i.product.id === product.id);
              const isOutOfStock = product.currentStock <= 0;
              const isLowStock = product.currentStock <= product.minStockAlert;

              return (
                <div
                  key={`${product.id}-${index}`}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`relative bg-[#111622] border rounded-xl p-3 flex flex-col justify-between transition-all select-none shadow-lg group ${
                    isOutOfStock 
                      ? 'opacity-40 border-[#1E2638] cursor-not-allowed' 
                      : 'border-[#1E2638] hover:border-rose-500/60 hover:shadow-rose-600/10 cursor-pointer'
                  }`}
                >
                  {/* Stock badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isOutOfStock 
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40' 
                        : isLowStock 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40' 
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.currentStock} ${product.unit}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {product.location.rack}
                    </span>
                  </div>

                  {/* Guaranteed Product Visual */}
                  <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                    <img
                      src={getProductDisplayImage(product.imageUrl, product.categoryId, product.name)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.onerror = null;
                        el.src = getProductDisplayImage('', product.categoryId, product.name);
                      }}
                    />
                  </div>

                  {/* Product Name */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs text-white line-clamp-2 group-hover:text-rose-400 transition">
                      {product.name}
                    </h4>
                    {product.urduName && (
                      <p className="urdu-font text-[11px] text-slate-400 mt-0.5 truncate">
                        {product.urduName}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>
                  </div>

                  {/* Price and Cart indicator */}
                  <div className="mt-2 pt-2 border-t border-[#1E2638] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-white">
                        Rs. {product.salePrice.toLocaleString()}
                      </span>
                      {selectedCustomer.group === 'Mechanic' && (
                        <span className="block text-[9px] text-rose-400 font-bold">
                          Mech: Rs. {product.mechanicPrice}
                        </span>
                      )}
                    </div>

                    {inCart && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Bottom Quick-Cart Trigger (When browsing catalog on phone) */}
          {cart.length > 0 && (
            <div className="lg:hidden p-3 bg-[#0B0E14] border-t border-[#1E2638] sticky bottom-0 z-20">
              <button
                type="button"
                onClick={() => setMobileTab('cart')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{cart.length} Parts in Cart</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: POS Bill & Fast Checkout Cart (40% on desktop, full on mobile when cart active) */}
        <div className={`w-full lg:w-[440px] xl:w-[480px] bg-[#111622] flex flex-col min-h-full lg:h-full shadow-2xl z-10 border-t lg:border-t-0 border-[#1E2638] overflow-y-auto lg:overflow-visible pb-24 lg:pb-0 ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Customer Selector & Counter Banner */}
          <div className="p-3 bg-[#0E131E] border-b border-[#1E2638] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                Customer:
              </span>
              <span className="text-[11px] font-semibold text-rose-400">
                Terminal: {currentCounter.name.split('(')[0]}
              </span>
            </div>

            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs text-white font-medium focus:border-rose-500 focus:outline-none transition"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.group}) {c.receivableBalance > 0 ? ` - Due: Rs. ${c.receivableBalance.toLocaleString()}` : ''}
                </option>
              ))}
            </select>

            {/* Customer stats pill */}
            {selectedCustomer.id !== 'CUST-001' && (
              <div className="flex items-center justify-between text-[11px] bg-[#0B0E14] px-2.5 py-1.5 rounded-xl border border-[#1E2638]">
                <span className="text-slate-400">
                  Ledger Due: <strong className="text-rose-500 font-bold">Rs. {selectedCustomer.receivableBalance.toLocaleString()}</strong> / Max: {selectedCustomer.creditLimit.toLocaleString()}
                </span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {selectedCustomer.loyaltyPoints} Pts ({selectedCustomer.loyaltyTier})
                </span>
              </div>
            )}
          </div>

          {/* Cart Item Rows */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#1A2234]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                <ShoppingBag className="w-12 h-12 mb-2 stroke-1 text-slate-700" />
                <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Scan barcode, type SKU, or click items from the parts catalog to add to bill.
                </p>
                {/* On mobile, button to switch back to catalog */}
                <button
                  type="button"
                  onClick={() => setMobileTab('catalog')}
                  className="lg:hidden mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Browse Parts Catalog</span>
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white truncate">{item.product.name}</h5>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>Rate: Rs.</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        disabled={!hasPermission('canOverridePrice')}
                        onChange={e => updateCartUnitPrice(item.product.id, parseFloat(e.target.value) || 0)}
                        className="w-16 px-1 py-0.5 text-center font-bold bg-[#0B0E14] border border-[#1E2638] rounded text-white disabled:opacity-80 focus:border-rose-500 focus:outline-none"
                      />
                      <span>x {item.quantity}</span>
                    </div>
                  </div>

                  {/* Qty Steppers */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => updateCartQty(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-[#161C2C] hover:bg-slate-700 text-slate-200 flex items-center justify-center transition border border-[#20293D]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.product.id, 1)}
                      className="w-6 h-6 rounded bg-[#161C2C] hover:bg-slate-700 text-slate-200 flex items-center justify-center transition border border-[#20293D]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right">
                    <span className="block font-bold text-white">
                      Rs. {item.total.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-500 mt-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary & Payment Box */}
          <div className="p-3 bg-[#0B0E14] border-t border-[#1E2638] space-y-2.5">
            {/* Subtotal, Discount, Points */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>

              {/* Invoice Level Discount */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bill Discount (Rs.):</span>
                <input
                  type="number"
                  min="0"
                  value={billDiscountAmount || ''}
                  placeholder="0"
                  onChange={e => setBillDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-20 px-1.5 py-0.5 text-right font-bold text-rose-500 bg-[#111622] border border-[#1E2638] rounded text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Loyalty Points Redemption */}
              {selectedCustomer.loyaltyPoints > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Redeem Points (Max {maxRedeemable}):
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={maxRedeemable}
                    value={pointsToRedeem || ''}
                    placeholder="0"
                    onChange={e => setPointsToRedeem(Math.min(maxRedeemable, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 px-1.5 py-0.5 text-right font-bold text-amber-400 bg-[#111622] border border-[#1E2638] rounded text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1.5 border-t border-[#1E2638]">
                <span className="uppercase tracking-wide">Grand Total:</span>
                <span className="text-base text-rose-500 font-mono">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMethod === 'cash' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25' 
                    : 'bg-[#111622] text-slate-300 border-[#1E2638] hover:text-white'
                }`}
              >
                Cash (F8)
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMethod === 'credit' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25' 
                    : 'bg-[#111622] text-slate-300 border-[#1E2638] hover:text-white'
                }`}
              >
                On Credit
              </button>
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMethod === 'bank' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25' 
                    : 'bg-[#111622] text-slate-300 border-[#1E2638] hover:text-white'
                }`}
              >
                Bank / Card
              </button>
              <button
                onClick={() => setPaymentMethod('split')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMethod === 'split' 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/25' 
                    : 'bg-[#111622] text-slate-300 border-[#1E2638] hover:text-white'
                }`}
              >
                Split
              </button>
            </div>

            {/* Cash Tendered & Change Row */}
            {paymentMethod === 'cash' && (
              <div className="bg-[#111622] p-2.5 rounded-xl border border-[#1E2638] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Cash Received:</span>
                  <input
                    type="number"
                    placeholder={`Rs. ${grandTotal}`}
                    value={tenderedCash}
                    onChange={e => setTenderedCash(e.target.value)}
                    className="w-28 px-2 py-1 text-right font-extrabold text-sm bg-[#0B0E14] border border-[#1E2638] rounded-lg text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex gap-1 justify-end flex-wrap">
                  {[500, 1000, 2000, 5000].map(val => (
                    <button
                      key={val}
                      onClick={() => setTenderedCash(String(val))}
                      className="px-2 py-0.5 rounded bg-[#161C2C] hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold border border-[#20293D]"
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    onClick={() => setTenderedCash(String(grandTotal))}
                    className="px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 text-[10px] font-bold border border-rose-800/40"
                  >
                    Exact
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1E2638] font-bold">
                  <span className="text-slate-400">Change Due:</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    Rs. {changeDue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Split Payment inputs */}
            {paymentMethod === 'split' && (
              <div className="bg-[#111622] p-2.5 rounded-xl border border-[#1E2638] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Cash Now:</span>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={e => {
                      const c = parseFloat(e.target.value) || 0;
                      setSplitCash(c);
                      setSplitCredit(Math.max(0, grandTotal - c));
                    }}
                    className="w-24 px-1.5 py-0.5 text-right font-bold border border-[#1E2638] rounded bg-[#0B0E14] text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-blue-400 font-bold">
                  <span>On Customer Ledger:</span>
                  <span className="font-mono">Rs. {splitCredit.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  if (cart.length > 0 && confirm('Clear current cart?')) setCart([]);
                }}
                disabled={cart.length === 0}
                className="px-3 py-3 rounded-xl border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#161C2C] transition disabled:opacity-40"
                title="Clear Cart (F4)"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm tracking-wide transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Complete Sale & Print Bill (Rs. {grandTotal.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT INVOICES & VOID MODAL */}
      {showRecentInvoices && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111622] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#1E2638] flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-[#1E2638] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white text-sm">Recent POS Invoices</h3>
              </div>
              <button onClick={() => setShowRecentInvoices(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px] border-b border-[#1E2638]">
                    <tr>
                      <th className="p-2">Invoice #</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Counter</th>
                      <th className="p-2">Items</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2234]">
                    {invoices.slice(0, 15).map(inv => (
                      <tr key={inv.id} className="hover:bg-[#161C2C]/60 transition">
                        <td className="p-2 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="p-2 text-slate-200">{inv.customerName}</td>
                        <td className="p-2 text-[10px] text-slate-400">{inv.counterName.split(' ')[0]}</td>
                        <td className="p-2 text-[10px] text-slate-400">{inv.items.length} lines</td>
                        <td className="p-2 font-bold text-white font-mono">Rs. {inv.grandTotal.toLocaleString()}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'completed' ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' :
                            inv.status === 'voided' ? 'bg-rose-950/70 text-rose-400 border border-rose-800/40' :
                            'bg-amber-950/70 text-amber-400 border border-amber-800/40'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-2 text-right space-x-1">
                          <button
                            onClick={() => {
                              setActiveReceipt(inv);
                              setShowRecentInvoices(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#161C2C] hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition border border-[#20293D]"
                            title="Reprint Bill"
                          >
                            <Printer className="w-3 h-3 inline mr-1 text-rose-400" />
                            Reprint
                          </button>
                          <button
                            onClick={() => {
                              setA4Receipt(inv);
                              setShowRecentInvoices(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 text-[10px] font-semibold transition border border-indigo-800/40"
                            title="Print A4 Invoice"
                          >
                            A4
                          </button>
                          {inv.status === 'completed' && (
                            <button
                              onClick={() => setVoidModalInvoice(inv)}
                              className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 text-[10px] font-semibold border border-rose-800/40 transition"
                              title="Void / Cancel Invoice"
                            >
                              Void
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
        </div>
      )}

      {/* VOID CONFIRMATION MODAL */}
      {voidModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#111622] rounded-2xl shadow-2xl max-w-md w-full border border-[#1E2638] p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">
                Void Sales Invoice {voidModalInvoice.invoiceNumber}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Voiding this invoice will automatically <strong className="text-white">reinstate product stock</strong> into inventory, reverse cash drawer totals, and log a critical audit record.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Cancellation (Required):
              </label>
              <textarea
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g., Wrong parts scanned by cashier, customer changed mind..."
                className="w-full p-2 border border-[#1E2638] rounded-xl text-xs bg-[#0B0E14] text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setVoidModalInvoice(null); setVoidReason(''); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#161C2C] transition"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  if (!voidReason.trim()) {
                    alert('Please specify the reason for voiding this invoice.');
                    return;
                  }
                  const res = voidSalesInvoice(voidModalInvoice.id, voidReason);
                  alert(res.message);
                  setVoidModalInvoice(null);
                  setVoidReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30"
              >
                Confirm & Void Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT PREVIEW MODAL */}
      {activeReceipt && (
        <ThermalReceipt
          invoice={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onPrintA4={() => {
            setA4Receipt(activeReceipt);
            setActiveReceipt(null);
          }}
        />
      )}

      {/* A4 INVOICE PRINT MODAL */}
      {a4Receipt && (
        <A4Invoice invoice={a4Receipt} onClose={() => setA4Receipt(null)} />
      )}
    </div>
  );
};
