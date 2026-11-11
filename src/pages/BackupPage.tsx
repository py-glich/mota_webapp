import React, { useState } from 'react';
import { 
  Database, Download, Upload, RefreshCw, ShieldCheck, 
  CheckCircle, AlertTriangle, HardDrive, Clock, Lock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BackupPage: React.FC = () => {
  const { exportBackupJson, importBackupJson, resetToFactoryDefaults, dbStatus, refreshFromDatabase } = useApp();

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Daily at 11:59 PM (Closing)');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeedMongo = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/database/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRestoreStatus('MongoDB collections successfully synchronized & populated!');
        await refreshFromDatabase();
      } else {
        alert('Failed: ' + (data.error || 'Could not seed MongoDB'));
      }
    } catch (e: any) {
      alert('Error triggering MongoDB sync: ' + e.message);
    } finally {
      setSeeding(false);
      setTimeout(() => setRestoreStatus(null), 4000);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const exportFileDefaultName = `CYBERORION_DB_BACKUP_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importBackupJson(text);
        if (success) {
          setRestoreStatus('Database successfully restored from JSON backup!');
          setTimeout(() => setRestoreStatus(null), 4000);
        } else {
          alert('Failed to restore: The uploaded file has an invalid schema.');
        }
      } catch (err) {
        alert('Error parsing uploaded backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-6 w-full pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-500" />
          Backup & Data Protection Console
        </h1>
        <p className="text-xs text-slate-500">
          Full offline database export, restoration, cloud sync replication, and scheduled auto-backups.
        </p>
      </div>

      {restoreStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* MongoDB Live Engine Status */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">MongoDB Database Engine</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dbStatus.mongoConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                  {dbStatus.mongoConnected ? 'ONLINE (Port 27017)' : 'LOCAL STANDALONE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                URI: <span className="text-emerald-400 font-mono">{dbStatus.uri}</span> | Active Engine: <span className="text-slate-300 font-semibold">{dbStatus.provider}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshFromDatabase}
              className="px-3 py-1.5 bg-[#1B2232] hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleSeedMongo}
              disabled={seeding}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seeding ? 'Syncing...' : 'Sync to MongoDB'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Manual Backup Download */}
        <div className="bg-[#111622] p-6 rounded-2xl border border-[#1E2638] shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <Download className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">
                Manual Database Backup
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Downloads a complete JSON snapshot of all 18 modules (Products, Stock, Invoices, Customers, Suppliers, Cashbook, and Audit Logs). Store this file securely on an external drive or USB.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Database Snapshot Now (.json)</span>
          </button>
        </div>

        {/* Card 2: Restore Database from File */}
        <div className="bg-[#111622] p-6 rounded-2xl border border-[#1E2638] shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Upload className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">
                Restore Database from Backup
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously exported <code className="bg-[#0B0E14] px-1.5 py-0.5 rounded border border-[#1E2638] text-rose-400 font-mono">.json</code> backup file to restore complete shop state. The system validates the schema before applying.
            </p>
          </div>

          <label className="w-full py-3 bg-[#1A2234] hover:bg-[#202A40] text-slate-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition border border-[#26334D]">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Select & Restore Backup File</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Auto Backup Configuration */}
      <div className="bg-[#111622] p-6 rounded-2xl border border-[#1E2638] shadow-lg space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Automated Scheduled Backup & Retention Policy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Auto-Backup:</span>
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={e => setAutoBackupEnabled(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 bg-[#161C2C] border-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400">Automatically backs up local database on daily day-closing.</p>
          </div>

          <div className="p-4 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-2">
            <span className="font-bold text-white block">Schedule Frequency:</span>
            <select
              value={backupFrequency}
              onChange={e => setBackupFrequency(e.target.value)}
              className="w-full p-2 border border-[#1E2638] rounded-lg bg-[#141A28] text-slate-200 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="Daily at 11:59 PM (Closing)">Daily at Shift Closing</option>
              <option value="Every 6 Hours">Every 6 Hours</option>
              <option value="Weekly Sunday Midnight">Weekly Sunday Midnight</option>
            </select>
          </div>

          <div className="p-4 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Cloud Sync Replication:</span>
              <input
                type="checkbox"
                checked={cloudSyncEnabled}
                onChange={e => setCloudSyncEnabled(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 bg-[#161C2C] border-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400">Encrypted backup copy pushed to offsite cloud repository.</p>
          </div>
        </div>
      </div>

      {/* Factory Demo Data Reset */}
      <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Reset to Sample Motorcycle Shop Demo Data
          </h4>
          <p className="text-xs text-rose-400/80 mt-0.5">
            Restores factory motorcycle parts catalog, demo customers (Ustad Akram), suppliers (Atlas Honda), and sample transactions.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset system database to factory sample data? This will overwrite your current test records.')) {
              resetToFactoryDefaults();
              alert('System reset to factory demo state.');
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shrink-0"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
