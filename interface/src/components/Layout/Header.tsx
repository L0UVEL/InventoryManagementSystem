import { Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';

export const Header = () => {
  const { user } = useAuth();
  const { openModal } = useModals();
  const { addToast } = useToast();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      if (query.trim()) {
        addToast(`Searching for "${query}" across all modules...`, 'info');
      }
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <header className="header glass sticky top-0 z-30 flex items-center justify-between px-8" style={{ height: '80px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '360px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search products, orders, or suppliers..." 
            className="input" 
            onKeyDown={handleSearch}
            style={{ 
              paddingLeft: '2.75rem', 
              background: 'rgba(0, 0, 0, 0.03)', 
              border: '1px solid transparent',
              borderRadius: '14px',
              fontSize: '0.9rem'
            }} 
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={() => openModal('ADD_PRODUCT')}
            style={{ borderRadius: '12px', padding: '0.625rem 1.25rem' }}
          >
            Add Product
          </button>
        )}
        
        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

        <div className="flex items-center gap-1">
          <button 
            className="btn-icon" 
            onClick={() => addToast('No new notifications.', 'info')}
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid white' }}></span>
          </button>
          
          <button 
            className="btn-icon"
            onClick={() => addToast('Settings module is currently under maintenance.', 'warning')}
          >
            <Settings size={20} />
          </button>
        </div>

        <div style={{ marginLeft: '0.5rem', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
            {user?.username?.substring(0, 1).toUpperCase() || 'A'}
          </div>
          <div style={{ lineHeight: 1.2, paddingRight: '0.25rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user?.username || 'Admin'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.role?.replace('ROLE_', '') || 'USER'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
