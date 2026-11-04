import React, { useState } from 'react';
import { 
  History, Search, User, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  // Shared dark theme class string
  const filterCls = 'px-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  const filteredLogs = auditLogs.filter(log => {
    const matchQuery = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModule = selectedModule === 'All' || log.module === selectedModule;
    const matchSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;
    return matchQuery && matchModule && matchSeverity;
  });

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
              <History className="w-5 h-5 text-brand-500" />
              Security Audit Trail & Activity Logs
            </h1>
            <p className="text-xs text-slate-400">
              Tamper-evident chronological ledger tracking invoice voids, stock changes, price overrides, and cash movements.
            </p>
          </div>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `CYBERORION_Audit_Logs_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log (JSON)</span>
          </button>
        </div>

        {/* Filter Ribbon */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search action, cashier name, or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2 text-xs">
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className={filterCls}
            >
              <option value="All">All Modules</option>
              <option value="POS">POS Billing</option>
              <option value="Inventory">Inventory & Stock</option>
              <option value="Purchases">Purchases</option>
              <option value="Customers">Customers</option>
              <option value="Accounting">Accounting</option>
              <option value="Users">Users</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className={filterCls}
            >
              <option value="All">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Terminal</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Audit Details</th>
                  <th className="p-3 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">No audit logs match the current filters.</td>
                  </tr>
                )}
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        <span>{log.userName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.userRole} • {log.counterName.split('(')[0]}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{log.module}</td>
                    <td className="p-3 font-bold text-white">{log.action}</td>
                    <td className="p-3 text-slate-300 font-sans max-w-md">{log.details}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        log.severity === 'critical' ? 'bg-rose-950 text-rose-400' :
                        log.severity === 'warning' ? 'bg-amber-950 text-amber-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};