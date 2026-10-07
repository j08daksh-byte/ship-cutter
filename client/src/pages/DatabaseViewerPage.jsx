import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Database,
  Server,
  RefreshCw,
  FileJson,
  Copy,
  Table,
  Check
} from 'lucide-react';

export default function DatabaseViewerPage() {
  const [dbStatus, setDbStatus] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ships');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [copied, setCopied] = useState(false);

  const fetchDbInfo = async () => {
    try {
      const [status, data] = await Promise.all([
        api.getDatabaseStatus(),
        api.inspectDatabase(),
      ]);
      setDbStatus(status);
      setDbData(data);
    } catch (err) {
      console.error('Failed to inspect database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const handleCopyJson = () => {
    if (!dbData) return;
    navigator.clipboard.writeText(JSON.stringify(dbData.collections[activeTab], null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading && !dbStatus) return <LoadingSpinner text="Querying database schemas and collection indexes..." />;

  const collections = dbData?.collections || {};
  const currentItems = collections[activeTab] || [];

  const tabList = [
    { id: 'ships', label: 'Ships' },
    { id: 'parts', label: 'Cut Parts' },
    { id: 'operations', label: 'Operations' },
    { id: 'materials', label: 'Materials' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'feasibility', label: 'Feasibility' },
    { id: 'photos', label: 'Photos' },
    { id: 'blogs', label: 'Blog Posts' },
    { id: 'contacts', label: 'Inquiries' },
  ];

  const totalRecords = Object.values(dbStatus?.collections || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-xl font-bold text-white">Database Status & Collection Data Explorer</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time inspection of your MongoDB connection, collections, document schemas, and saved operational records.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchDbInfo();
          }}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Refresh Database Snapshot</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="card-surface p-5 border border-dark-border bg-dark-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              dbStatus?.status === 'online'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`badge font-mono text-[10px] uppercase ${
                  dbStatus?.status === 'online'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {dbStatus?.status === 'online' ? 'MONGODB CONNECTED' : 'SEED DATA ENGINE READY'}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                HOST: {dbStatus?.host}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Database: <span className="font-mono text-cyan-300">{dbStatus?.dbName}</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 font-mono truncate max-w-xl">
              Configured URI: {dbStatus?.configuredUri}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">TOTAL STORED RECORDS</span>
          <span className="text-2xl font-bold font-mono text-white">{totalRecords}</span>
          <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
            across {tabList.length} collections
          </span>
        </div>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="card-surface p-3 border border-dark-border bg-dark-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {tabList.map((tab) => {
            const count = dbStatus?.collections?.[tab.id] ?? currentItems.length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-800 text-white border border-neutral-600 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/60 text-cyan-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-dark-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === 'json' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={handleCopyJson}
            title="Copy Collection JSON"
            className="p-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white border border-dark-border"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Data Viewer Content */}
      <div className="card-surface border border-dark-border bg-dark-card rounded-xl overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto max-h-[500px]">
            {currentItems.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-neutral-500">
                No documents found in this collection.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 font-mono text-[11px] text-neutral-400 uppercase sticky top-0 border-b border-dark-border">
                  <tr>
                    {Object.keys(currentItems[0] || {}).map((key) => (
                      <th key={key} className="py-3 px-4 whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border font-mono text-[11px]">
                  {currentItems.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-neutral-900/40 transition-colors">
                      {Object.entries(item).map(([k, v]) => (
                        <td key={k} className="py-3 px-4 max-w-xs truncate text-neutral-300">
                          {typeof v === 'object' && v !== null
                            ? JSON.stringify(v)
                            : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="p-4 bg-black max-h-[500px] overflow-auto">
            <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
              {JSON.stringify(currentItems, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Production Deployment & Cloud DB Guide Box */}
      <div className="card-surface p-5 border border-dark-border bg-neutral-950 text-xs space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
          <Database className="w-4 h-4" />
          <span>PRODUCTION MONGODB ATLAS CLOUD DEPLOYMENT GUIDE</span>
        </div>
        <p className="text-neutral-300 leading-relaxed">
          To connect a 100% free cloud MongoDB Atlas database for your live production deployment:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-neutral-400 font-mono text-[11px]">
          <li>Create a free account at <strong className="text-white">mongodb.com/cloud/atlas</strong> and click "Create Cluster" (M0 Free).</li>
          <li>Under Database Access, create a database user and password.</li>
          <li>Under Network Access, add IP <code className="text-white bg-neutral-900 px-1 py-0.5 rounded">0.0.0.0/0</code> (Allow Access from Anywhere).</li>
          <li>Click "Connect" → "Drivers" and copy the connection string:</li>
        </ol>
        <div className="p-2.5 rounded bg-black border border-neutral-800 text-[11px] font-mono text-cyan-300">
          MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/ship_cutting_robot?retryWrites=true&w=majority
        </div>
        <p className="text-neutral-500 text-[10px] font-mono">
          Add this MONGODB_URI variable in your Render / Railway environment settings when deploying the backend.
        </p>
      </div>
    </div>
  );
}


