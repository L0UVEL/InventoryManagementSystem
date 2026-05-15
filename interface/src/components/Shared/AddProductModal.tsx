import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductAPI } from '../../api/inventoryService';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import type { Product } from '../../api/types';

export const AddProductModal = () => {
  const { activeModal, modalData, closeModal } = useModals();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!modalData;
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    basePrice: '',
    lowStockThreshold: '10'
  });

  useEffect(() => {
    if (activeModal === 'ADD_PRODUCT' && modalData) {
      const product = modalData as Product;
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        basePrice: (product.basePrice || 0).toString(),
        lowStockThreshold: (product.lowStockThreshold || 10).toString()
      });
    } else if (activeModal === 'ADD_PRODUCT' && !modalData) {
      setFormData({ sku: '', name: '', category: '', basePrice: '', lowStockThreshold: '10' });
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'ADD_PRODUCT') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        basePrice: parseFloat(formData.basePrice),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        status: isEditing ? (modalData as Product).status : 'In Stock'
      };

      if (isEditing) {
        await ProductAPI.update((modalData as Product).id, payload);
        addToast('Product updated successfully.', 'success');
      } else {
        await ProductAPI.create(payload);
        addToast('Product added successfully to catalog.', 'success');
      }
      
      setFormData({ sku: '', name: '', category: '', basePrice: '', lowStockThreshold: '10' });
      closeModal();
      window.dispatchEvent(new CustomEvent('product-added'));
    } catch (err: any) {
      addToast(`Failed to ${isEditing ? 'update' : 'add'} product. Please check your inputs.`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title={isEditing ? "Edit Product" : "Add New Product"}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">SKU / Code</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. PUP-IT-001"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Category</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Electronics"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Product Name</label>
          <input
            type="text"
            className="input"
            placeholder="Enter full product name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">Base Price (PHP)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0.00"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Low Stock Alert Level</label>
            <input
              type="number"
              className="input"
              required
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Product')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
