import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { InventoryAPI, ProductAPI } from '../../api/inventoryService';
import type { Product } from '../../api/types';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';

export const StockInModal = () => {
  const { activeModal, closeModal } = useModals();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ productId: '', location: 'Main Storage', quantity: '' });

  useEffect(() => {
    if (activeModal === 'STOCK_IN') {
      ProductAPI.getAll().then(res => setProducts(res.data)).catch(() => addToast('Failed to load products.', 'error'));
    }
  }, [activeModal]);

  if (activeModal !== 'STOCK_IN') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await InventoryAPI.addStock({
        productId: parseInt(formData.productId),
        location: formData.location,
        quantity: parseInt(formData.quantity)
      });
      addToast('Stock added successfully.', 'success');
      setFormData({ productId: '', location: 'Main Storage', quantity: '' });
      closeModal();
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    } catch (err: any) {
      addToast('Failed to add stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} title="Stock In">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label className="label">Select Product</label>
          <select 
            className="input" 
            required 
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          >
            <option value="">Choose a product from catalog...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">Destination Location</label>
            <select 
              className="input" 
              required 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              <option value="Main Storage">Main Storage</option>
              <option value="IT Lab">IT Lab</option>
              <option value="Department Office">Department Office</option>
              <option value="University Bookstore">University Bookstore</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Quantity</label>
            <input 
              type="number" 
              className="input" 
              min="1" 
              required 
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Receive Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
