import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Globe, FileText } from 'lucide-react';

export default function Sidebar() {
  const menuRoles = [
    { title: 'BẢNG CHUYỂN MẠCH', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'TÀI NGUYÊN WEB', path: '/sites', icon: <Globe size={20} /> },
    { title: 'KHO BIÊN TẬP AI', path: '/articles', icon: <FileText size={20} /> },
  ];

  return (
    <aside className="glass-panel" style={{ width: '280px', height: '100%', display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 0', border: 'none', borderRight: '1px solid var(--border-color)', borderRadius: 0, boxShadow: 'none' }}>
      
      <div style={{ padding: '0 24px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          AI Control<span style={{ color: 'var(--accent-color)' }}>.</span>
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '4px' }}>System Administration</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
        {menuRoles.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              background: isActive ? '#eff6ff' : 'transparent',
              transition: 'var(--transition)',
              fontWeight: isActive ? '700' : '600',
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
