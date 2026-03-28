import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Globe, FileText, Send } from 'lucide-react';

export default function Sidebar() {
  const menuRoles = [
    { title: 'DASHBOARD', path: '/', icon: <LayoutDashboard size={18} /> },
    { title: 'PUBLISHER', path: '/publisher', icon: <Send size={18} /> },
    { title: 'PBN SITES', path: '/sites', icon: <Globe size={18} /> },
    { title: 'AI ARTICLES', path: '/articles', icon: <FileText size={18} /> },
  ];

  return (
    <aside className="glass-panel" style={{ width: '240px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 0', border: 'none', borderRight: '1px solid var(--border-color)', borderRadius: 0, boxShadow: 'none' }}>
      
      <div style={{ padding: '0 20px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          AI Control<span style={{ color: 'var(--accent-color)' }}>.</span>
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Admin</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
        {menuRoles.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              background: isActive ? '#eff6ff' : 'transparent',
              transition: 'var(--transition)',
              fontWeight: isActive ? '600' : '500',
              fontSize: '13px'
            })}
          >
            <span style={{ color: 'inherit' }}>{item.icon}</span>
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
