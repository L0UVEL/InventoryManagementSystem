import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { ProductAPI } from '../api/inventoryService';
import type { Product } from '../api/types';
import { useToast } from '../context/ToastContext';
import { useModals } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

export const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToast } = useToast();
  const { openModal } = useModals();
  const { user } = useAuth();
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const handleAction = async (action: string, product: Product) => {
    setMenuOpenId(null);
    switch (action) {
      case 'edit':
        openModal('ADD_PRODUCT', product);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
          try {
            await ProductAPI.delete(product.id);
            addToast('Product deleted successfully.', 'success');
            fetchData();
          } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to delete product.';
            addToast(errorMsg, 'error');
            console.error('Delete error:', err);
          }
        }
        break;
      case 'archive':
        addToast(`${product.name} has been archived successfully.`, 'success');
        break;
      default:
        addToast('Action triggered.', 'info');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ProductAPI.getAll();
      setProducts(res.data);
    } catch (err: any) {
      setError('Failed to load product catalog.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener('product-added', handleRefresh);
    return () => window.removeEventListener('product-added', handleRefresh);
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    if (!p) return false;
    const name = p.name || '';
    const sku = p.sku || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span className="badge badge-success">✓ In Stock</span>;
      case 'Low Stock':
        return <span className="badge badge-warning">⚠ Low Stock</span>;
      case 'Out of Stock':
        return <span className="badge badge-error">✕ Out of Stock</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px', gap: '0.75rem' }}>
        <Loader2 size={24} className="animate-spin" />
        <span className="text-muted">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>Product Catalog</h1>
          <p className="text-muted">Manage university merchandise, supplies, and IT assets.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={() => openModal('ADD_PRODUCT')}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--border-radius)', color: 'var(--status-error-text)', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
          <div>
            <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Search Products</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="SKU or Name..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <select
              className="input text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ backgroundColor: '#f6f4f2' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => addToast('Advanced filter panel is being initialized...', 'info')} style={{ backgroundColor: '#f6f4f2', border: 'none' }}>
              <Filter size={16} /> More Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Base Price</th>
                <th>Status</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td><input type="checkbox" /></td>
                    <td className="text-xs font-mono text-muted">{product.sku}</td>
                    <td className="font-medium text-xs">{product.name}</td>
                    <td className="text-xs text-muted">{product.category || '—'}</td>
                    <td className="text-xs font-mono" style={{ textAlign: 'right' }}>{formatCurrency(product.basePrice || 0)}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>
                      <div style={{ position: 'relative' }}>
                        {isAdmin && (
                          <button 
                            className="btn-icon" 
                            onClick={() => setMenuOpenId(menuOpenId === product.id ? null : product.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {menuOpenId === product.id && (
                          <>
                            <div 
                              style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                              onClick={() => setMenuOpenId(null)} 
                            />
                            <div className="glass-card" style={{ 
                              position: 'absolute', 
                              right: 0, 
                              bottom: filtered.length < 3 || filtered.indexOf(product) > filtered.length - 2 ? '100%' : 'auto',
                              top: filtered.length < 3 || filtered.indexOf(product) > filtered.length - 2 ? 'auto' : '100%',
                              marginTop: filtered.length < 3 || filtered.indexOf(product) > filtered.length - 2 ? '0' : '0.5rem',
                              marginBottom: filtered.length < 3 || filtered.indexOf(product) > filtered.length - 2 ? '0.5rem' : '0',
                              zIndex: 50, 
                              minWidth: '150px', 
                              padding: '0.5rem',
                              boxShadow: 'var(--shadow-lg)',
                              border: '1px solid var(--border-color)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '8px'
                            }}>
                              <button 
                                className="flex items-center w-full gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-black/5 rounded"
                                onClick={() => handleAction('edit', product)}
                              >
                                Edit Product
                              </button>
                              <button 
                                className="flex items-center w-full gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-black/5 rounded"
                                onClick={() => handleAction('delete', product)}
                                style={{ color: 'var(--status-error-text)' }}
                              >
                                Delete Product
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="text-muted">{searchTerm || selectedCategory !== 'All' ? 'No products match your filters.' : 'No products in catalog.'}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', borderBottomLeftRadius: 'var(--border-radius-lg)', borderBottomRightRadius: 'var(--border-radius-lg)' }}>
          <span className="text-xs text-muted font-medium">Showing {filtered.length} of {products.length} entries</span>
        </div>
      </div>
    </div>
  );
};

