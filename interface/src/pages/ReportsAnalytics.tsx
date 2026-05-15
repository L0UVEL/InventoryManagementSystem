import { useState, useEffect } from 'react';
import { ChevronDown, MoreVertical, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TransactionAPI, InventoryAPI } from '../api/inventoryService';
import type { Transaction, Inventory } from '../api/types';
import { useToast } from '../context/ToastContext';

export const ReportsAnalytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('All Time');
  const { addToast } = useToast();


  const handleAction = (action: string) => {
    switch (action) {
      case 'analyze':
        addToast('Analyzing data trends for the selected period...', 'info');
        break;
      case 'filter':
        addToast('Opening advanced transaction filters...', 'info');
        break;
      case 'settings':
        addToast('Opening component settings...', 'info');
        break;
      default:
        addToast('Action triggered.', 'info');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txnRes, invRes] = await Promise.all([
          TransactionAPI.getAll(),
          InventoryAPI.getAll(),
        ]);
        setTransactions(txnRes.data);
        setInventory(invRes.data);
      } catch (err) {
        setError('Failed to load reports data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter transactions based on timeRange
  const filteredTransactions = transactions.filter(t => {
    if (!t.date || timeRange === 'All Time') return true;
    const d = new Date(t.date);
    const now = new Date();
    if (timeRange === 'Today') {
      return d.toDateString() === now.toDateString();
    }
    if (timeRange === 'This Week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= oneWeekAgo;
    }
    return true;
  });

  // Compute metrics from real data
  const totalSales = filteredTransactions.reduce((s, t) => s + (t.totalAmount || 0), 0);
  const totalRestocked = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStockItems = [...new Set(inventory.map(i => i.product.id))].filter(pid => {
    const prod = inventory.find(i => i.product.id === pid)?.product;
    const totalQty = inventory.filter(i => i.product.id === pid).reduce((s, i) => s + i.quantity, 0);
    return prod && prod.lowStockThreshold && totalQty <= prod.lowStockThreshold && totalQty > 0;
  }).length;

  // Build category distribution from inventory
  const categoryMap: Record<string, number> = {};
  inventory.forEach(i => {
    const cat = i.product.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + i.quantity;
  });
  const categoryColors = ['#7a0000', '#854d0e', '#fca5a5', '#166534', '#1e40af', '#6b21a8'];
  const pieData = Object.entries(categoryMap).map(([name, value], idx) => ({
    name, value, color: categoryColors[idx % categoryColors.length],
  }));
  const totalUnits = pieData.reduce((s, d) => s + d.value, 0);

  // Weekly sales aggregation (simplified — groups by week number)
  const weeklySales: Record<string, number> = {};
  filteredTransactions.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    const weekNum = Math.min(Math.ceil(d.getDate() / 7), 5);
    const key = `W${weekNum}`;
    weeklySales[key] = (weeklySales[key] || 0) + (t.totalAmount || 0);
  });
  
  const salesData = ['W1', 'W2', 'W3', 'W4', 'W5'].map(week => ({
    name: week,
    value: weeklySales[week] || 0
  }));

  const fmt = (v: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v);
  const fmtDate = (d: string) => new Date(d).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px', gap: '0.75rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span className="text-muted">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>Reports & Analytics</h1>
          <p className="text-muted">Overview of inventory movement and sales performance.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="input text-sm" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: '160px', backgroundColor: '#f6f4f2', border: 'none' }}
          >
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </div>
      </div>


      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--border-radius)', color: 'var(--status-error-text)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sales</div>
          <div className="text-3xl font-bold">{fmt(totalSales)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Items in Stock</div>
          <div className="text-3xl font-bold">{totalRestocked.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Alerts</div>
          <div className="text-3xl font-bold" style={{ color: 'var(--status-error-text)' }}>{lowStockItems}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h2 className="text-xl font-bold">Sales Trend</h2>
            <button className="btn-icon" onClick={() => handleAction('analyze')}><MoreVertical size={20} /></button>
          </div>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: 'var(--shadow-lg)',
                    padding: '12px'
                  }} 
                  formatter={(value: number) => [fmt(value), 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h2 className="text-xl font-bold">Movement by Category</h2>
            <button className="btn-icon" onClick={() => handleAction('analyze')}><MoreVertical size={20} /></button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div className="text-xl font-bold">{totalUnits > 1000 ? `${(totalUnits / 1000).toFixed(1)}k` : totalUnits}</div>
              <div className="text-xs text-muted">Total Units</div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" cornerRadius={4}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4" style={{ marginTop: 'auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-xs font-medium">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold">Detailed Transaction Logs</h2>
          <button className="btn-icon" onClick={() => handleAction('filter')}><SlidersHorizontal size={20} /></button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Requestor</th>
                <th style={{ textAlign: 'right' }}>Amount (₱)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td className="text-xs font-mono text-muted">{t.date ? fmtDate(t.date) : '—'}</td>
                  <td className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{t.transactionId}</td>
                  <td><span className="badge" style={{ backgroundColor: t.type === 'Cash Sale' ? 'var(--primary)' : 'var(--status-warning-bg)', color: t.type === 'Cash Sale' ? 'white' : 'var(--status-warning-text)' }}>{t.type}</span></td>
                  <td className="text-xs">{t.requestorName || '—'}</td>
                  <td className="text-xs font-mono" style={{ textAlign: 'right' }}>{t.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge ${t.status === 'Approved' ? 'badge-success' : t.status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>{t.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><span className="text-muted">No transaction data available for this range.</span></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
