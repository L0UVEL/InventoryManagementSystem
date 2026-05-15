import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, Search, Package, Loader2, AlertCircle, MoreVertical } from 'lucide-react';
import { InventoryAPI } from '../api/inventoryService';
import type { Inventory } from '../api/types';
import { useModals } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

export const InventoryTracking = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const { openModal } = useModals();
  const { addToast } = useToast();

  const handleAction = (action: string, itemName: string) => {
    switch (action) {
      case 'details':
        addToast(`Loading full stock history for ${itemName}...`, 'info');
        break;
      case 'audit':
        addToast(`Stock audit initiated for ${itemName}.`, 'success');
        break;
      default:
        addToast('Action triggered.', 'info');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes] = await Promise.all([
        InventoryAPI.getAll()
      ]);
      setInventory(invRes.data);
    } catch (err: any) {
      setError('Failed to load inventory data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener('inventory-updated', handleRefresh);
    return () => window.removeEventListener('inventory-updated', handleRefresh);
  }, []);

  const groupedByProduct = inventory.reduce((acc, inv) => {
    if (!inv || !inv.product) return acc;
    const key = inv.product.id;
    if (!acc[key]) {
      acc[key] = { product: inv.product, locations: {}, totalQty: 0 };
    }
    acc[key].locations[inv.location] = (acc[key].locations[inv.location] || 0) + inv.quantity;
    acc[key].totalQty += inv.quantity;
    return acc;
  }, {} as Record<number, { product: any; locations: Record<string, number>; totalQty: number }>);

  const groupedList = Object.values(groupedByProduct);

  const allLocations = [...new Set(inventory.map((i) => i.location))];
  const locationsForFilter = ['All', ...allLocations];

  const filtered = groupedList.filter((item) => {
    const name = item.product.name || '';
    const sku = item.product.sku || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = selectedLocation === 'All' || item.locations[selectedLocation] !== undefined;
    
    let status = 'Safe';
    if (item.totalQty === 0) status = 'Out of Stock';
    else if (item.product.lowStockThreshold && item.totalQty <= item.product.lowStockThreshold) status = 'Low';
    
    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const getStatusBadge = (totalQty: number, threshold: number | null) => {
    if (totalQty === 0) return <span className="badge badge-error">✕ Out of Stock</span>;
    if (threshold && totalQty <= threshold) return <span className="badge badge-warning">⚠ Low</span>;
    return <span className="badge badge-success">✓ Safe</span>;
  };

  const totalTracked = groupedList.length;
  const lowStockCount = groupedList.filter((g) => g.product.lowStockThreshold && g.totalQty > 0 && g.totalQty <= g.product.lowStockThreshold).length;
  const outOfStockCount = groupedList.filter((g) => g.totalQty === 0).length;

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px', gap: '0.75rem' }}>
        <Loader2 size={24} className="animate-spin" />
        <span className="text-muted">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>Inventory Tracking</h1>
          <p className="text-muted">Manage stock levels across all locations.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => openModal('TRANSFER')}>
            <ArrowLeftRight size={16} /> Transfer
          </button>
          <button className="btn btn-primary" onClick={() => openModal('STOCK_IN')}>
            <Plus size={16} /> Stock In
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--border-radius)', color: 'var(--status-error-text)', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem' }}>Total Items Tracked</div>
          <div className="text-3xl font-bold">{totalTracked.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem' }}>Low Stock Alerts</div>
          <div className="text-3xl font-bold" style={{ color: '#854d0e' }}>{lowStockCount}</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem' }}>Out of Stock</div>
          <div className="text-3xl font-bold" style={{ color: 'var(--status-error-text)' }}>{outOfStockCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', width: '300px' }}>
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
          <div className="flex gap-3">
            <select 
              className="input text-sm" 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ width: '160px', backgroundColor: '#f6f4f2', border: 'none' }}
            >
              {locationsForFilter.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>
            <select 
              className="input text-sm" 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '140px', backgroundColor: '#f6f4f2', border: 'none' }}
            >
              <option value="All">All Status</option>
              <option value="Safe">Safe</option>
              <option value="Low">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Item Name</th>
                <th>SKU / ID</th>
                {allLocations.map((loc) => (
                  <th key={loc} style={{ textAlign: 'right' }}>{loc}</th>
                ))}
                <th style={{ textAlign: 'right' }}>Total Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.product.id}>
                    <td>
                      <div style={{ padding: '4px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', display: 'inline-flex' }}>
                        <Package size={16} color="var(--text-muted)" />
                      </div>
                    </td>
                    <td className="font-medium text-xs">{item.product.name}</td>
                    <td className="text-muted font-mono text-xs">{item.product.sku}</td>
                    {allLocations.map((loc) => (
                      <td key={loc} style={{ textAlign: 'right' }}>{item.locations[loc] || 0}</td>
                    ))}
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: item.totalQty === 0 ? 'var(--status-error-text)' : undefined }}>
                      {item.totalQty}
                    </td>
                    <td>{getStatusBadge(item.totalQty, item.product.lowStockThreshold)}</td>
                    <td><button className="btn-icon" onClick={() => handleAction('details', item.product.name)} title="View Details"><MoreVertical size={16} /></button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4 + allLocations.length + 2} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="text-muted">{searchTerm ? 'No items match your search.' : 'No inventory data available.'}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', borderBottomLeftRadius: 'var(--border-radius-lg)', borderBottomRightRadius: 'var(--border-radius-lg)' }}>
          <span className="text-xs text-muted font-medium">Showing {filtered.length} of {groupedList.length} entries</span>
        </div>
      </div>
    </div>
  );
};
