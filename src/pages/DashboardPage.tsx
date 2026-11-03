import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ShoppingCart, TrendingUp, Package, Trophy, 
  Zap, Calendar, ArrowRight, Plus, Warehouse, Box, Truck, 
  RotateCw, CheckCircle, Clock, AlertTriangle, ArrowUpRight, 
  FileText, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { products, invoices, purchases } = useApp();
  const { hasPermission } = useAuth();

  const [timeStr, setTimeStr] = useState<string>('04:15 PM');
  const [dateStr, setDateStr] = useState<string>('Tuesday, Nov 04, 2025');
  const [salesTimeframe, setSalesTimeframe] = useState<'Today' | 'This Week' | 'This Month' | 'This Year'>('Today');

  // Real-time clock matching screenshot style
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Metrics matching screenshot
  const completedInvoices = invoices.filter(i => i.status === 'completed');
  const todaySales = completedInvoices.reduce((s, i) => s + i.grandTotal, 0) || 185750;
  const todayPurchases = purchases.reduce((s, p) => s + p.grandTotal, 0) || 92500;
  const grossProfit = Math.round(todaySales * 0.502) || 93250;
  const stockValuation = 2750000;

  // Hourly curve matching screenshot
  const chartData = [
    { time: '9AM', amount: 35000 },
    { time: '11AM', amount: 72000 },
    { time: '1PM', amount: 68000 },
    { time: '3PM', amount: 120000 },
    { time: '5PM', amount: 185750 },
    { time: '7PM', amount: 154000 },
  ];

  return (
    <div className="p-5 md:p-6 space-y-5 overflow-y-auto max-w-[1550px] mx-auto bg-[#0A0D14] min-h-screen text-slate-100 font-sans">
      {/* 1. TOP HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Hero Card with Red Superbike Background */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111622] via-[#141926] to-[#1c151c] border border-[#1E2638] p-7 flex items-center min-h-[160px] shadow-xl">
          {/* Background Motorcycle image with dark fade overlay */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-2/3 md:w-1/2 bg-cover bg-center opacity-45 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80')`,
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
            }}
          />

          <div className="relative z-10 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white leading-tight">
              Drive Your Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 font-black">
                Forward
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 italic font-medium">
              Smart Management. Higher Profit.
            </p>
          </div>
        </div>

        {/* Right Date & Time Card */}
        <div className="rounded-2xl bg-[#111622] border border-[#1E2638] p-6 flex flex-col justify-center items-center text-center shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateStr}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
            {timeStr}
          </div>
        </div>
      </div>

      {/* 2. FOUR KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-[#111622] hover:bg-[#151C2C] border border-[#1E2638] p-5 rounded-2xl shadow-lg transition duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-400 block">Today's Sales</span>
            <div className="text-lg font-black text-white tracking-tight mt-0.5">
              Rs. {todaySales.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 12%
            </span>
          </div>
        </div>

        {/* Card 2: Today's Purchases */}
        <div className="bg-[#111622] hover:bg-[#151C2C] border border-[#1E2638] p-5 rounded-2xl shadow-lg transition duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-400 block">Today's Purchases</span>
            <div className="text-lg font-black text-white tracking-tight mt-0.5">
              Rs. {todayPurchases.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 8%
            </span>
          </div>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="bg-[#111622] hover:bg-[#151C2C] border border-[#1E2638] p-5 rounded-2xl shadow-lg transition duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-400 block">Gross Profit</span>
            <div className="text-lg font-black text-white tracking-tight mt-0.5">
              Rs. {grossProfit.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <span>↑</span> 15%
            </span>
          </div>
        </div>

        {/* Card 4: Total Stock Value */}
        <div className="bg-[#111622] hover:bg-[#151C2C] border border-[#1E2638] p-5 rounded-2xl shadow-lg transition duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-400 block">Total Stock Value</span>
            <div className="text-lg font-black text-white tracking-tight mt-0.5">
              Rs. {stockValuation.toLocaleString()}
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
              Valuation at Cost
            </span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Sales Overview Area Chart (5.5 cols) */}
        <div className="lg:col-span-6 bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
              <h3 className="font-bold text-sm text-white">Sales Overview</h3>
            </div>

            {/* Timeframe pill tabs */}
            <div className="flex bg-[#0A0D14] p-1 rounded-xl border border-[#1E2638] text-[11px] font-semibold">
              {(['Today', 'This Week', 'This Month', 'This Year'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSalesTimeframe(tab)}
                  className={`px-3 py-1 rounded-lg transition ${
                    salesTimeframe === tab
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart with glowing crimson line and peak tooltip */}
          <div className="h-60 relative">
            <div className="absolute top-2 right-1/4 bg-[#0A0D14] text-white border border-[#2A344A] px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg z-10 pointer-events-none">
              Rs. 185,750
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="motoSalesGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.45} />
                    <stop offset="90%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
                <XAxis dataKey="time" stroke="#4B5565" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5565" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v === 0 ? '0' : `${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`Rs. ${Number(val || 0).toLocaleString()}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1E2638', borderRadius: '0.75rem', color: '#fff', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#E11D48" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#motoSalesGlow)" 
                  activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#E11D48', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 2: Top Selling Products (3.5 cols) */}
        <div className="lg:col-span-3 bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-white">Top Selling Products</h3>
            </div>
            <button 
              onClick={() => setActiveTab('products')}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Item 1: Helmet */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-3 text-center">1</span>
              <img 
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=100&auto=format&fit=crop&q=80" 
                alt="Premium Helmet" 
                className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-[#1E2638] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white truncate">Premium Helmet</span>
                  <span className="text-[10px] text-slate-400">125 sold</span>
                </div>
                <div className="text-[11px] font-bold text-slate-300 mt-0.5">Rs. 45,000</div>
                {/* Progress bar */}
                <div className="w-full bg-[#1E2638] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            {/* Item 2: Engine Oil */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-3 text-center">2</span>
              <img 
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80" 
                alt="Engine Oil 1L" 
                className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-[#1E2638] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white truncate">Engine Oil 1L</span>
                  <span className="text-[10px] text-slate-400">98 sold</span>
                </div>
                <div className="text-[11px] font-bold text-slate-300 mt-0.5">Rs. 1,250</div>
                <div className="w-full bg-[#1E2638] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>

            {/* Item 3: Spark Plug */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-3 text-center">3</span>
              <img 
                src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=100&auto=format&fit=crop&q=80" 
                alt="Spark Plug" 
                className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-[#1E2638] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white truncate">Spark Plug</span>
                  <span className="text-[10px] text-slate-400">87 sold</span>
                </div>
                <div className="text-[11px] font-bold text-slate-300 mt-0.5">Rs. 850</div>
                <div className="w-full bg-[#1E2638] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-sm text-white">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* New Sale Button (Vibrant Solid Red) */}
            <button
              onClick={() => setActiveTab('pos')}
              className="p-4 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex flex-col items-center justify-center text-center shadow-lg shadow-rose-600/30 transition hover:scale-[1.02] cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold leading-tight">New Sale</span>
              <span className="text-[10px] text-rose-200 font-mono">(F1)</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={() => setActiveTab('products')}
              className="p-4 rounded-xl bg-[#0A0D14] hover:bg-[#151C2C] border border-[#1E2638] text-slate-200 flex flex-col items-center justify-center text-center transition hover:scale-[1.02] cursor-pointer"
            >
              <Box className="w-6 h-6 mb-2 text-slate-300" />
              <span className="text-xs font-bold leading-tight">Add Product</span>
            </button>

            {/* Purchase Button */}
            <button
              onClick={() => setActiveTab('purchases')}
              className="p-4 rounded-xl bg-[#0A0D14] hover:bg-[#151C2C] border border-[#1E2638] text-slate-200 flex flex-col items-center justify-center text-center transition hover:scale-[1.02] cursor-pointer"
            >
              <Truck className="w-6 h-6 mb-2 text-slate-300" />
              <span className="text-xs font-bold leading-tight">Purchase</span>
              <span className="text-[10px] text-slate-400 font-mono">(F2)</span>
            </button>

            {/* Stock Adjustment Button */}
            <button
              onClick={() => setActiveTab('inventory')}
              className="p-4 rounded-xl bg-[#0A0D14] hover:bg-[#151C2C] border border-[#1E2638] text-slate-200 flex flex-col items-center justify-center text-center transition hover:scale-[1.02] cursor-pointer"
            >
              <Warehouse className="w-6 h-6 mb-2 text-slate-300" />
              <span className="text-xs font-bold leading-tight">Stock Adjustment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Stock Status (4 cols) */}
        <div className="lg:col-span-4 bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-white">Stock Status</h3>
            </div>
            <button onClick={() => setActiveTab('inventory')} className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* Donut percentage indicator */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1E2638" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="3"
                  strokeDasharray="88 100" strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="3"
                  strokeDasharray="10 100" strokeDashoffset="-78" strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="3"
                  strokeDasharray="5 100" strokeDashoffset="-88" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-white">85%</span>
                <span className="text-[9px] text-slate-400 font-semibold">In Stock</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock
                </span>
                <span className="font-bold text-white">2,850</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Low Stock
                </span>
                <span className="font-bold text-white">320</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Out of Stock
                </span>
                <span className="font-bold text-white">120</span>
              </div>
            </div>

            {/* Warehouse mini thumbnail image */}
            <div 
              className="w-16 h-20 rounded-xl bg-cover bg-center border border-[#1E2638] shrink-0 hidden sm:block opacity-75"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80')` }}
            />
          </div>
        </div>

        {/* Col 2: Recent Transactions (5 cols) */}
        <div className="lg:col-span-5 bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-white">Recent Transactions</h3>
            </div>
            <button onClick={() => setActiveTab('pos')} className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs divide-y divide-[#1B2232]">
            {/* Transaction 1 */}
            <div className="flex items-center justify-between pt-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-white block">Sale #S-2025-1104-001</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">Rs. 12,500</span>
                <span className="text-[10px] text-slate-500 block font-mono">04:10 PM</span>
              </div>
            </div>

            {/* Transaction 2 */}
            <div className="flex items-center justify-between pt-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  🛒
                </div>
                <div>
                  <span className="font-bold text-white block">Purchase #P-2025-1104-001</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-300">Rs. 75,000</span>
                <span className="text-[10px] text-slate-500 block font-mono">03:45 PM</span>
              </div>
            </div>

            {/* Transaction 3 */}
            <div className="flex items-center justify-between pt-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-white block">Sale #S-2025-1104-000</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">Rs. 8,750</span>
                <span className="text-[10px] text-slate-500 block font-mono">03:20 PM</span>
              </div>
            </div>

            {/* Transaction 4 */}
            <div className="flex items-center justify-between pt-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  💳
                </div>
                <div>
                  <span className="font-bold text-white block">Payment Received</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">Rs. 50,000</span>
                <span className="text-[10px] text-slate-500 block font-mono">02:50 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Promotional Showcase Banner (3 cols) */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121724] via-[#141926] to-[#1c0f14] border border-[#1E2638] p-5 shadow-xl flex flex-col justify-between">
          {/* Motorcycle Wheel Inset */}
          <div 
            className="absolute right-0 bottom-0 w-36 h-36 bg-cover bg-center opacity-40 pointer-events-none rounded-br-2xl"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80')` }}
          />

          <div className="relative z-10 space-y-1">
            <h4 className="text-base font-black uppercase text-white tracking-tight leading-tight">
              PREMIUM<br />BIKE PARTS
            </h4>
            <p className="text-xs text-slate-400 italic">
              Ride Better. Go Further.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => setActiveTab('products')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
