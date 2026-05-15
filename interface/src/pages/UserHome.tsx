import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { ProductAPI } from '../api/inventoryService';
import type { Product } from '../api/types';
import { useToast } from '../context/ToastContext';
import { useModals } from '../context/ModalContext';

export const UserHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToast } = useToast();
  const { openModal } = useModals();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ProductAPI.getAll();
      setProducts(res.data);
    } catch (err: any) {
      setError('Failed to load product list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('product-added', fetchData);
    return () => window.removeEventListener('product-added', fetchData);
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
        return <span className="badge badge-success">Available</span>;
      case 'Low Stock':
        return <span className="badge badge-warning">Limited</span>;
      case 'Out of Stock':
        return <span className="badge badge-error">Unavailable</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const handleRequest = (product: Product) => {
    openModal('REQUEST_ITEM', product);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px', gap: '0.75rem' }}>
        <Loader2 size={24} className="animate-spin" />
        <span className="text-muted">Loading available items...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>Available Items</h1>
        <p className="text-muted">View and request available university supplies and equipment.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--border-radius)', color: 'var(--status-error-text)', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search items..."
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
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

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium text-sm">{product.name}</td>
                    <td className="text-xs text-muted">{product.category || '—'}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>
                      <button 
                        className="btn btn-primary text-xs py-1" 
                        disabled={product.status === 'Out of Stock'}
                        onClick={() => handleRequest(product)}
                        style={{ padding: '4px 12px' }}
                      >
                        Request
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="text-muted">No items found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
