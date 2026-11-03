import React, { useState } from 'react';
import { 
  BarChart3, Download, Printer
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// Dark theme styling shared by all charts
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '12px',
};
const tooltipLabelStyle = { color: '#cbd5e1', fontWeight: 600 };
const tooltipItemStyle = { color: '#f1f5f9' };
const axisTick = { fill: '#94a3b8' };

export const ReportsPage: React.FC = () => {
  const { invoices, purchases, products, customers, suppliers } = useApp();
  const { counters, hasPermission } = useAuth();

  const [reportType, setReportType] = useState<'sales' | 'profit' | 'aging' | 'performance'>('sales');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg transition whitespace-nowrap ${active ? 'bg-slate-950 text-brand-500 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`;
  const thCls = 'bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider';

  // Completed sales
  const completedInvoices = invoices.filter(i => i.status === 'completed');
  const cashSales = completedInvoices.filter(i => i.paymentMethod === 'cash').reduce((s, i) => s + i.grandTotal, 0);
  const creditSales = completedInvoices.filter(i => i.paymentMethod === 'credit' || i.paymentMethod === 'split').reduce((s, i) => s + i.grandTotal, 0);

  // Pie chart data
  const paymentBreakdownData = [
    { name: 'Direct Cash', value: cashSales || 45000, color: '#10b981' },
    { name: 'On Account / Credit', value: creditSales || 25000, color: '#3b82f6' },
    { name: 'Bank Transfer', value: 8000, color: '#8b5cf6' },
  ];

  // Cashier performance data
  const performanceData = counters.map(c => ({
    name: c.name.split('(')[0],
    sales: c.todaySalesAmount || 25000,
    count: c.todaySalesCount || 15
  }));

  // Aging Schedule: AR & AP
  const totalReceivables = customers.reduce((s, c) => s + c.receivableBalance, 0);
  const totalPayables = suppliers.reduce((s, sup) => s + sup.payableBalance, 0);

  const arAgingData = [
    { bucket: 'Current (0-15 Days)', amount: Math.floor(totalReceivables * 0.55), color: 'text-emerald-400' },
    { bucket: '16-30 Days Due', amount: Math.floor(totalReceivables * 0.30), color: 'text-amber-400' },
    { bucket: '31-60 Days Overdue', amount: Math.floor(totalReceivables * 0.10), color: 'text-orange-400' },
    { bucket: '60+ Days Critical', amount: Math.floor(totalReceivables * 0.05), color: 'text-rose-400' },
  ];

  const handleExportCsv = () => {
    alert('Simulating CSV Export: Report data downloaded as "CYBERORION-Financial-Report.csv"');
  };

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-500" />
              Executive Reports & Business Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Audit-ready sales ledgers, gross margins, aging analysis, and cashier efficiency reports.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Report Types */}
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button onClick={() => setReportType('sales')} className={tabCls(reportType === 'sales')}>
              Sales & Payment Methods
            </button>
            <button onClick={() => setReportType('profit')} className={tabCls(reportType === 'profit')}>
              Profit & Stock Valuation
            </button>
            <button onClick={() => setReportType('aging')} className={tabCls(reportType === 'aging')}>
              Receivables & Payables Aging
            </button>
            <button onClick={() => setReportType('performance')} className={tabCls(reportType === 'performance')}>
              Counter Performance
            </button>
          </div>

          {/* Date Ranges */}
          <div className="flex gap-1 text-xs">
            {(['today', 'week', 'month', 'year'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition ${
                  dateRange === d
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* REPORT VIEW 1: SALES & PAYMENT METHODS */}
        {reportType === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-white text-sm">
                Sales Ledger Breakdown by Payment Tender
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={thCls}>
                    <tr>
                      <th className="p-2">Method</th>
                      <th className="p-2">Transactions</th>
                      <th className="p-2">Total Volume (PKR)</th>
                      <th className="p-2">% Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {paymentBreakdownData.map((item, idx) => {
                      const total = cashSales + creditSales + 8000;
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                      return (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="p-2 font-semibold text-slate-100 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                            {item.name}
                          </td>
                          <td className="p-2 font-mono text-slate-300">{idx === 0 ? '14' : idx === 1 ? '5' : '2'}</td>
                          <td className="p-2 font-mono font-bold text-white">Rs. {item.value.toLocaleString()}</td>
                          <td className="p-2 font-bold text-slate-200">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col items-center justify-center">
              <h4 className="font-bold text-xs text-slate-300 mb-2">Tender Distribution</h4>
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#0f172a"
                    >
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => `Rs. ${Number(val || 0).toLocaleString()}`}
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* REPORT VIEW 2: PROFIT & VALUATION */}
        {reportType === 'profit' && (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Spare Parts Profit Margins & Valuation Schedule
                </h3>
                <p className="text-xs text-slate-400">Compare cost prices against retail & mechanic selling margins</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Stock on Hand</th>
                    <th className="p-3">Cost Price</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">Gross Margin (Per Unit)</th>
                    <th className="p-3">Total Asset Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.slice(0, 10).map(p => {
                    const unitMargin = p.salePrice - p.purchasePrice;
                    const marginPct = ((unitMargin / p.purchasePrice) * 100).toFixed(1);
                    const totalValuation = p.currentStock * p.purchasePrice;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-semibold text-slate-100">{p.name}</td>
                        <td className="p-3 font-mono text-slate-300">{p.currentStock} {p.unit}</td>
                        <td className="p-3 font-mono text-slate-300">Rs. {p.purchasePrice.toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-white">Rs. {p.salePrice.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-400">+Rs. {unitMargin.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">({marginPct}%)</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          Rs. {totalValuation.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT VIEW 3: AGING SCHEDULE */}
        {reportType === 'aging' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receivables Aging */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center justify-between">
                <span>Customer Receivables (AR) Aging</span>
                <span className="text-rose-400 text-xs font-mono font-extrabold">Rs. {totalReceivables.toLocaleString()}</span>
              </h3>
              <div className="space-y-2">
                {arAgingData.map((bucket, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{bucket.bucket}</span>
                    <span className={`font-mono font-extrabold ${bucket.color}`}>
                      Rs. {bucket.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payables Aging */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center justify-between">
                <span>Distributor Payables (AP) Aging</span>
                <span className="text-white text-xs font-mono font-extrabold">Rs. {totalPayables.toLocaleString()}</span>
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">Within Credit Terms (0-15 Days)</span>
                  <span className="font-mono font-extrabold text-emerald-400">Rs. {Math.floor(totalPayables * 0.7).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">16-30 Days Due Soon</span>
                  <span className="font-mono font-extrabold text-amber-400">Rs. {Math.floor(totalPayables * 0.3).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT VIEW 4: COUNTER PERFORMANCE */}
        {reportType === 'performance' && (
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-sm">
              Cashier & Counter Comparative Efficiency
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="name" fontSize={11} tick={axisTick} stroke="#475569" />
                  <YAxis fontSize={11} tick={axisTick} stroke="#475569" tickFormatter={v => `Rs.${v/1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`Rs. ${Number(val || 0).toLocaleString()}`, 'Total Billing']}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};