import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertTriangle, Banknote, AlertCircle, Info, Loader2, TrendingUp, Package, ArrowRight, RefreshCw, Lightbulb, Quote } from 'lucide-react';
import { ReportAPI } from '../api/inventoryService';
import type { DashboardReportDTO } from '../api/types';


export const Dashboard = () => {
  const [report, setReport] = useState<DashboardReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ReportAPI.getDashboard();
        setReport(res.data);
      } catch (err: any) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in" style={{ minHeight: '400px' }}>
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted font-medium">Preparing your overview...</p>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-success">✓ Approved</span>;
      case 'Pending':
        return <span className="badge badge-warning">⟳ Pending</span>;
      case 'Rejected':
        return <span className="badge badge-error">✕ Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const stats = [
    { 
      label: 'Total Items', 
      value: report?.totalItems?.toLocaleString() || '0', 
      icon: Package, 
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      trend: 'Across all locations'
    },
    { 
      label: 'Low Stock Alerts', 
      value: report?.lowStockAlertsCount || '0', 
      icon: AlertTriangle, 
      color: 'var(--status-error-text)',
      bg: 'var(--status-error-bg)',
      trend: 'Needs attention'
    },
    { 
      label: 'Transactions Today', 
      value: report?.transactionsToday || '0', 
      icon: TrendingUp, 
      color: 'var(--status-success-text)',
      bg: 'var(--status-success-bg)',
      trend: 'Freshly updated'
    },
    { 
      label: 'Inventory Value', 
      value: formatCurrency(report?.estimatedInventoryValue || 0), 
      icon: Banknote, 
      color: 'var(--accent)',
      bg: 'var(--accent-light)',
      trend: 'Estimated total'
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted mt-1">Welcome back! Here's a snapshot of the inventory system status.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/tracking')}
          >
            Manage Stock
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-8" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--status-error-bg)', color: 'var(--status-error-text)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="card glass-card">
            <div className="flex justify-between items-start mb-5">
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: stat.bg, 
                color: stat.color, 
                borderRadius: '12px' 
              }}>
                <stat.icon size={24} />
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Real-time" />
            </div>
            <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-muted mb-4">{stat.label}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: stat.color }}>
              <Info size={12} />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Requisitions</h3>
            <button 
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              onClick={() => navigate('/transactions')}
            >
              View History <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Department</th>
                  <th>Requestor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report?.recentRequisitions && report.recentRequisitions.length > 0 ? (
                  report.recentRequisitions.slice(0, 8).map((txn) => (
                    <tr key={txn.id} className="group">
                      <td className="font-bold text-xs text-primary">{txn.transactionId}</td>
                      <td className="font-semibold">{txn.department || 'General'}</td>
                      <td className="text-muted font-medium">{txn.requestorName || 'Anonymous'}</td>
                      <td className="text-xs font-bold">{txn.date ? formatDate(txn.date) : '—'}</td>
                      <td>{getStatusBadge(txn.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem' }}>
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <ClipboardList size={48} />
                        <span className="font-bold">No recent activity recorded.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card glass-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-primary" />
                <h3 className="text-lg font-bold">System Health</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50/50 border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Status</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-muted uppercase tracking-widest">Inventory Sync</span>
                  <span className="text-primary">94%</span>
                </div>
                <div className="w-full h-2.5 bg-primary-light rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: '94%', 
                      background: 'linear-gradient(90deg, var(--primary) 0%, #a00000 100%)',
                      boxShadow: '0 0 8px rgba(128, 0, 0, 0.3)'
                    }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-muted uppercase tracking-widest">Storage Capacity</span>
                  <span className="text-accent">68%</span>
                </div>
                <div className="w-full h-2.5 bg-accent-light rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: '68%', 
                      background: 'linear-gradient(90deg, var(--accent) 0%, #b8962c 100%)',
                      boxShadow: '0 0 8px rgba(212, 175, 55, 0.3)'
                    }} 
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/50">
                    <Info size={14} className="text-primary" />
                  </div>
                  <p className="text-[11px] font-medium text-muted leading-relaxed">
                    Database <span className="text-primary font-bold">Online</span>. Last sync: <span className="font-bold">4m ago</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card glass-card overflow-hidden" style={{ 
            padding: '1.5rem', 
            background: 'var(--accent-light)', 
            border: '1px solid var(--accent)',
            position: 'relative'
          }}>
            <Quote 
              size={60} 
              className="absolute -right-2 -bottom-2 text-accent/10 rotate-12" 
              strokeWidth={1} 
            />
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/80 text-accent">
                <Lightbulb size={16} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Daily Insight</h3>
            </div>
            <p className="text-xs font-semibold text-muted leading-relaxed relative z-10">
              "Regularly audit high-turnover items in the IT Assets category to prevent stockouts during enrollment periods."
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
