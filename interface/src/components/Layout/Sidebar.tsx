import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, RefreshCw, ShoppingCart, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, adminOnly: true },
    { name: 'Home', path: '/', icon: <LayoutDashboard size={20} />, userOnly: true },
    { name: 'Product Catalog', path: '/catalog', icon: <Package size={20} />, adminOnly: true },
    { name: 'Inventory Tracking', path: '/tracking', icon: <RefreshCw size={20} />, adminOnly: true },
    { name: 'Sales/Requisitions', path: '/transactions', icon: <ShoppingCart size={20} />, adminOnly: true },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, adminOnly: true },
  ];

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly && isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass border-r h-screen flex flex-col fixed left-0 top-0 z-40" style={{ width: '280px' }}>
      <div style={{ padding: '2.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          background: 'var(--primary)', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          boxShadow: '0 8px 16px rgba(128, 0, 0, 0.2)',
          transform: 'rotate(-4deg)'
        }}>
          <Package size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>IMS</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest" style={{ fontSize: '10px', marginTop: '4px' }}>Inventory System</p>
        </div>
      </div>

      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.875rem 1rem', 
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
          >
            {item.icon}
            <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 0.75rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ 
          margin: '0 0.5rem 1rem 0.5rem',
          padding: '1rem',
          background: 'var(--primary-light)',
          borderRadius: '16px',
          border: '1px solid rgba(128, 0, 0, 0.1)'
        }}>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>Current User</p>
          <div className="flex items-center gap-3">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Admin'}</p>
              <p className="text-xs text-muted">{isAdmin ? 'Administrator' : 'Standard User'}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="nav-item" 
          style={{ 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '12px'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: 600 }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};
