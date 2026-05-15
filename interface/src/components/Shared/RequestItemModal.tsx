import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { TransactionAPI } from '../../api/inventoryService';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../api/types';

export const RequestItemModal = () => {
  const { activeModal, modalData, closeModal } = useModals();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    quantity: '1',
    department: '',
    location: 'Main Storage'
  });

  const product = modalData as Product;

  useEffect(() => {
    if (activeModal === 'REQUEST_ITEM') {
      setFormData({ quantity: '1', department: '', location: 'Main Storage' });
    }
  }, [activeModal]);

  if (activeModal !== 'REQUEST_ITEM' || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: 'Internal Req.',
        requestorName: user?.fullName || user?.username || 'Unknown User',
        department: formData.department,
        items: [{
          productId: product.id,
          quantity: parseInt(formData.quantity),
          location: formData.location
        }]
      };

      await TransactionAPI.create(payload);
      addToast(`Request for ${product.name} has been submitted successfully.`, 'success');
      
      closeModal();
      // Optional: trigger a refresh of the product list if status might change
      window.dispatchEvent(new CustomEvent('product-added')); 
    } catch (err: any) {
      addToast(`Failed to submit request. Please ensure sufficient stock exists.`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Request Item"
    >
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
           <ShoppingCart size={24} style={{ margin: 'auto' }} />
        </div>
        <div>
          <h4 className="font-bold">{product.name}</h4>
          <p className="text-xs text-muted">{product.category} • SKU: {product.sku}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">Quantity Requested</label>
            <input
              type="number"
              min="1"
              className="input"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Department</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. IT Department"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Deduct From Location</label>
          <select 
            className="input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          >
            <option value="Main Storage">Main Storage</option>
            <option value="IT Lab">IT Lab</option>
            <option value="Office Supply Room">Office Supply Room</option>
          </select>
          <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
            Specify which inventory location this item should be taken from.
          </p>
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
