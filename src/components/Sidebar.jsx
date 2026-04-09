import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Globe, FileText, Bot, LogOut } from 'lucide-react';

const menu = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'PBN Sites', path: '/sites', icon: Globe },
  { title: 'AI Articles', path: '/articles', icon: FileText },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={18} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              AI Control<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {user?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map(({ title, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {title}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--bg-3)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.username || 'admin'}</div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%' }}>
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
