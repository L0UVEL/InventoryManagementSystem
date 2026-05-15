import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthAPI } from '../api/inventoryService';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthAPI.login({ username, password });
      login(response.data);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid username or password.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to connect to the server. Make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6f4f2',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(122, 0, 0, 0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(122, 0, 0, 0.03) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        zIndex: 1
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            backgroundColor: 'var(--primary)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            boxShadow: '0 12px 24px rgba(122, 0, 0, 0.25)',
            transform: 'rotate(-3deg)'
          }}>
            IS
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            IMS <span style={{ color: 'var(--text-main)', fontWeight: 400 }}>Portal</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '0.925rem', fontWeight: 500 }}>
            Unified Inventory Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="card glass-card" style={{ padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {error && (
              <div className="animate-pop-in" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'var(--status-error-bg)',
                borderRadius: '12px',
                color: 'var(--status-error-text)',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: '1px solid rgba(220, 38, 38, 0.1)'
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="admin / user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '14px',
                marginTop: '0.5rem',
                boxShadow: '0 8px 16px rgba(122, 0, 0, 0.15)'
              }}
            >
              {loading ? <div className="flex items-center justify-center gap-2"><div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Authenticating...</div> : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-2" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted font-medium">
            Forgot password? <span className="text-primary font-bold cursor-pointer hover:underline">Contact Support</span>
          </p>
          <p className="text-sm text-muted font-medium" style={{ marginTop: '0.5rem' }}>
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
          <div style={{ width: '40px', height: '2px', background: 'var(--border-color)', margin: '1rem auto' }} />
          <p className="text-xs text-muted italic">
            Developed for University Inventory Operations v2.4
          </p>
        </div>
      </div>
    </div>
  );
};
