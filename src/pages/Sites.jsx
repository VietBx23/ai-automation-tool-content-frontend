import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, PlusCircle, Globe, CheckCircle, XCircle, Server } from 'lucide-react';

const LANGS = ['English', 'Hindi', 'Bengali', 'Urdu'];

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active', language: 'English' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try { const { data } = await api.get('/sites'); setSites(data.data); } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa site này và toàn bộ log liên quan?')) return;
    try { await api.delete(`/sites/${id}`); fetchData(); } catch { alert('Xóa thất bại'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/sites', form);
      setForm({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active', language: 'English' });
      fetchData();
    } catch { alert('Thêm site thất bại'); }
    setSaving(false);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">PBN Network</h1>
        <p className="page-subtitle">Configure WordPress REST API endpoints for satellite distribution.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Add Form */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={16} color="var(--accent)" /> Add New Node
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'site_name', label: 'Site Name', placeholder: 'Daily Cricket Hub', type: 'text' },
              { key: 'domain', label: 'Domain URL', placeholder: 'https://example.com', type: 'url' },
              { key: 'wp_user', label: 'WP Username', placeholder: 'admin', type: 'text' },
              { key: 'app_password', label: 'App Password', placeholder: 'xxxx xxxx xxxx', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="form-group">
                <label className="label">{label}</label>
                <input type={type} className="input" placeholder={placeholder} required value={form[key]} onChange={e => f(key, e.target.value)} />
              </div>
            ))}

            <div className="form-group">
              <label className="label">Language</label>
              <select className="select" value={form.language} onChange={e => f('language', e.target.value)}>
                {LANGS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => f('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ justifyContent: 'center', marginTop: 4 }}>
              {saving ? 'Saving...' : <><PlusCircle size={15} /> Register Node</>}
            </button>
          </form>
        </div>

        {/* Sites Grid */}
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading nodes...</p>
          ) : sites.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <Server size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No satellite nodes configured yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {sites.map(site => (
                <div key={site._id} className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: site.status === 'active' ? 'var(--accent)' : 'var(--border)' }} />

                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: site.status === 'active' ? 'var(--accent-dim)' : 'var(--bg-3)', borderRadius: 10, flexShrink: 0 }}>
                      <Globe size={18} color={site.status === 'active' ? 'var(--accent)' : 'var(--text-3)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{site.site_name}</h3>
                      <a href={site.domain} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', display: 'block', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.domain}
                      </a>

                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{site.language || 'English'}</span>
                        {site.status === 'active'
                          ? <span className="badge badge-green" style={{ fontSize: 10 }}><CheckCircle size={9} /> Online</span>
                          : <span className="badge badge-gray" style={{ fontSize: 10 }}><XCircle size={9} /> Offline</span>
                        }
                      </div>

                      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(site._id)}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
