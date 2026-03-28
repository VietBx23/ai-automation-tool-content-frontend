import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
