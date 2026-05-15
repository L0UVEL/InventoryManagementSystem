import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { InventoryAPI } from '../../api/inventoryService';
import type { Inventory } from '../../api/types';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';

export const TransferModal = () => {
  const { activeModal, closeModal } = useModals();
  const { addToast } = useToast();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ productId: '', fromLocation: '', toLocation: '', quantity: '' });

  useEffect(() => {
    if (activeModal === 'TRANSFER') {
      InventoryAPI.getAll().then(res => setInventory(res.data)).catch(() => addToast('Failed to load inventory.', 'error'));
    }
  }, [activeModal]);

  if (activeModal !== 'TRANSFER') return null;

  // Group inventory for product selection
  const groupedProducts = inventory.reduce((acc, inv) => {
    const key = inv.product.id;
    if (!acc[key]) acc[key] = { product: inv.product, totalQty: 0, locations: [] as any[] };
    acc[key].totalQty += inv.quantity;
    acc[key].locations.push(inv);
    return acc;
  }, {} as any);

  const productList = Object.values(groupedProducts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await InventoryAPI.transferStock({
        productId: parseInt(formData.productId),
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        quantity: parseInt(formData.quantity)
      });
      addToast('Inventory transferred successfully.', 'success');
      setFormData({ productId: '', fromLocation: '', toLocation: '', quantity: '' });
      closeModal();
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to transfer stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProd = groupedProducts[formData.productId];

  return (
    <Modal isOpen={true} onClose={closeModal} title="Inventory Transfer">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label className="label">Select Product to Transfer</label>
          <select 
            className="input" 
            required 
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value, fromLocation: '', quantity: '' })}
          >
            <option value="">Choose a product...</option>
            {productList.filter((p: any) => p.totalQty > 0).map((p: any) => (
              <option key={p.product.id} value={p.product.id}>{p.product.name} (Available: {p.totalQty})</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">From Location</label>
            <select 
              className="input" 
              required 
              value={formData.fromLocation}
              onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
              disabled={!formData.productId}
            >
              <option value="">Select source...</option>
              {selectedProd?.locations.filter((l: any) => l.quantity > 0).map((l: any) => (
                <option key={l.location} value={l.location}>{l.location} ({l.quantity} avail)</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">To Location</label>
            <select 
              className="input" 
              required 
              value={formData.toLocation}
              onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
            >
              <option value="">Select destination...</option>
              <option value="Main Storage">Main Storage</option>
              <option value="IT Lab">IT Lab</option>
              <option value="Department Office">Department Office</option>
              <option value="University Bookstore">University Bookstore</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Quantity to Transfer</label>
          <input 
            type="number" 
            className="input" 
            min="1" 
            required 
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            disabled={!formData.fromLocation}
            placeholder="Enter quantity..."
          />
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !formData.toLocation}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Transfer Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
