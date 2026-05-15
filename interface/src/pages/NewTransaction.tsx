import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, X, Plus, CreditCard, Loader2 } from 'lucide-react';
import { ProductAPI, TransactionAPI } from '../api/inventoryService';
import type { Product, Transaction, TransactionItemDTO } from '../api/types';

import { useToast } from '../context/ToastContext';

interface CartItem { product: Product; quantity: number; }

export const NewTransaction = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [txnType, setTxnType] = useState('Cash Sale');
  const [requestorName, setRequestorName] = useState('');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([ProductAPI.getAll(), TransactionAPI.getRecent()]);
        setProducts(pRes.data);
        setRecentTxns(tRes.data);
      } catch { /* handled by empty states */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filtered = products.filter(p => {
    if (!p) return false;
    const name = p.name || '';
    const sku = p.sku || '';
    return (name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            sku.toLowerCase().includes(searchTerm.toLowerCase())) && 
            p.status !== 'Out of Stock';
  });

  const addToCart = (p: Product) => {
    const ex = cart.find(c => c.product.id === p.id);
    if (ex) setCart(cart.map(c => c.product.id === p.id ? { ...c, quantity: c.quantity + 1 } : c));
    else setCart([...cart, { product: p, quantity: 1 }]);
  };

  const updateQty = (id: number, d: number) => setCart(cart.map(c => c.product.id === id ? { ...c, quantity: Math.max(1, c.quantity + d) } : c));
  const removeItem = (id: number) => setCart(cart.filter(c => c.product.id !== id));
  const subtotal = cart.reduce((s, c) => s + c.product.basePrice * c.quantity, 0);
  const fmt = (v: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v);
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleSubmit = async () => {
    if (!cart.length) { addToast('Add at least one item.', 'error'); return; }
    if (!requestorName.trim()) { addToast('Requestor name is required.', 'error'); return; }
    setSubmitting(true);
    try {
      const items: TransactionItemDTO[] = cart.map(c => ({ productId: c.product.id, quantity: c.quantity, location: 'Main Storage' }));
      await TransactionAPI.create({ type: txnType, requestorName: requestorName.trim(), department: department.trim(), items });
      addToast('Transaction completed successfully!', 'success');
      setCart([]); setRequestorName(''); setDepartment('');
      const res = await TransactionAPI.getRecent(); setRecentTxns(res.data);
    } catch (e: any) {
      addToast(e.response?.data?.message || 'Failed to process transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center" style={{ minHeight: '400px', gap: '0.75rem' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /><span className="text-muted">Loading...</span></div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>New Transaction</h1>
          <p className="text-muted">Process sales and student requisitions with ease.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => { setCart([]); addToast('Cart cleared.', 'info'); }}>
            <X size={16} /> Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-8">
          {/* Product Selection */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
              <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px' }}>
                <Search size={20} color="var(--primary)" />
              </div>
              <h2 className="text-xl font-bold">Catalog Search</h2>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by SKU or Product Name..." 
                className="input" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ paddingLeft: '2.75rem', fontSize: '1rem' }} 
              />
            </div>

            {searchTerm && (
              <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                  <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.slice(0, 5).map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="font-semibold text-xs">{p.name}</div>
                          <div className="text-xs text-muted font-mono">{p.sku}</div>
                        </td>
                        <td className="text-xs font-mono font-bold" style={{ textAlign: 'right' }}>{fmt(p.basePrice || 0)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn-icon" 
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '32px', height: '32px' }} 
                            onClick={() => { addToCart(p); addToast(`${p.name} added to cart.`, 'success'); }}
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                          <span className="text-muted">No matching products available.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
              <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px' }}>
                <ShoppingCart size={20} color="var(--primary)" />
              </div>
              <h2 className="text-xl font-bold">Items in Cart ({cart.reduce((s, c) => s + c.quantity, 0)})</h2>
            </div>

            <div className="table-container" style={{ borderRadius: '12px' }}>
              <table style={{ margin: 0 }}>
                <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <tr>
                    <th>Item Details</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? cart.map(c => (
                    <tr key={c.product.id}>
                      <td>
                        <div className="font-bold text-xs">{c.product.name}</div>
                        <div className="text-xs text-muted">{fmt(c.product.basePrice)} / unit</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-1">
                          <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => updateQty(c.product.id, -1)}>-</button>
                          <span className="text-sm font-bold font-mono" style={{ minWidth: '30px' }}>{c.quantity}</span>
                          <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => updateQty(c.product.id, 1)}>+</button>
                        </div>
                      </td>
                      <td className="text-sm font-bold font-mono" style={{ textAlign: 'right' }}>{fmt(c.product.basePrice * c.quantity)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-icon" style={{ color: 'var(--status-error-text)' }} onClick={() => removeItem(c.product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                        <ShoppingCart size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <div className="text-muted">Your cart is empty. Search for products to begin.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Customer/Requestor Info */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Transaction Details</h2>
            <div className="flex flex-col gap-5">
              <div className="form-group">
                <label className="label">Transaction Type</label>
                <select className="input" value={txnType} onChange={e => setTxnType(e.target.value)}>
                  <option>Cash Sale</option>
                  <option>Internal Requisition</option>
                  <option>Student Grant</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Requestor Name *</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Juan Dela Cruz" 
                  value={requestorName} 
                  onChange={e => setRequestorName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="label">Department / Course</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. BSIT / College of Engineering" 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="glass-card" style={{ padding: '2rem', background: 'var(--primary)', color: 'white' }}>
            <h2 className="text-xl font-bold" style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>Order Summary</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span style={{ opacity: 0.8 }}>Items Total</span>
                <span className="font-mono font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ opacity: 0.8 }}>Tax / Service Fee</span>
                <span className="font-mono font-medium">{fmt(0)}</span>
              </div>
              <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed rgba(255,255,255,0.3)' }}>
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-3xl font-bold">{fmt(subtotal)}</span>
              </div>
            </div>
            
            <button 
              className="btn w-full" 
              style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'white', color: 'var(--primary)', fontSize: '1.125rem', border: 'none' }}
              onClick={handleSubmit} 
              disabled={submitting || !cart.length}
            >
              {submitting ? <Loader2 size={24} className="animate-spin" /> : <><CreditCard size={20} /> Process Transaction</>}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Recent Transactions</h2>
        <div className="table-container"><table><thead><tr><th>Time</th><th>Txn ID</th><th>Requestor</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>{recentTxns.length > 0 ? recentTxns.map(t => <tr key={t.id}><td className="text-xs font-mono text-muted">{t.date ? fmtTime(t.date) : '—'}</td><td className="text-xs font-mono font-bold" style={{ color: 'var(--primary)' }}>{t.transactionId}</td><td className="text-xs">{t.requestorName || '—'}</td><td className="text-xs">{t.type}</td><td className="text-xs font-mono" style={{ textAlign: 'right' }}>{fmt(t.totalAmount)}</td></tr>) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}><span className="text-muted">No transactions yet.</span></td></tr>}</tbody></table></div>
      </div>
    </div>
  );
};
