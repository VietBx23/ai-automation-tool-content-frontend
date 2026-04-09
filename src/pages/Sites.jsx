import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, PlusCircle, Globe, CheckCircle, XCircle } from 'lucide-react';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active', language: 'English' });

  const fetchData = async () => {
    try { const { data } = await api.get('/sites'); setSites(data.data); } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchData() }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this site and its logs?")) return;
    try { await api.delete(`/sites/${id}`); fetchData(); } catch (error) { alert("Delete failed"); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sites', formData);
      setFormData({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active', language: 'English' });
      fetchData();
    } catch (error) { alert("Add site failed"); }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>PBN Network Management</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>Configure WordPress REST API endpoints for satellite distribution.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Form Add Site */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
            <PlusCircle size={18} color="var(--accent-color)" /> Add New Site 
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>Identifier / Title</label>
               <input type="text" placeholder="e.g. Daily Tech Hub" className="glass-input" required value={formData.site_name} onChange={e=>setFormData({...formData, site_name: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>Root Domain (URL)</label>
               <input type="url" placeholder="https://example.com" className="glass-input" required value={formData.domain} onChange={e=>setFormData({...formData, domain: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>Admin Username</label>
               <input type="text" placeholder="WP admin user" className="glass-input" required value={formData.wp_user} onChange={e=>setFormData({...formData, wp_user: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>App Password</label>
               <input type="text" placeholder="xxxxxxxxxxxx" className="glass-input" required value={formData.app_password} onChange={e=>setFormData({...formData, app_password: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>System Status</label>
               <select className="glass-input" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                 <option value="active">Active (Receives posts)</option>
                 <option value="inactive">Inactive (Suspended)</option>
               </select>
             </div>
             <div>
               <label style={{fontSize:'12px', fontWeight:'600', marginBottom:'6px', display:'block'}}>Language</label>
               <input type="text" placeholder="e.g. English, Vietnamese" className="glass-input" required value={formData.language} onChange={e=>setFormData({...formData, language: e.target.value})} />
             </div>
             <button className="glass-button primary" type="submit" style={{ justifyContent: 'center', marginTop: '8px' }}>Register Node</button>
          </form>
        </div>

        {/* List Sites */}
        <div>
           {loading ? <p style={{color: 'var(--text-secondary)', fontSize: '13px'}}>Scanning nodes...</p> : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
               {sites.length === 0 ? <div className="glass-panel" style={{padding:'32px', textAlign:'center', color:'var(--text-secondary)', fontSize:'13px'}}>No satellite nodes configured.</div> : null}
               {sites.map(site => (
                 <div key={site._id} className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: site.status==='active' ? 'var(--accent-color)' : 'var(--border-color)' }}></div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                       <div style={{ padding: '12px', background: site.status==='active' ? '#eff6ff' : '#f8fafc', borderRadius: '10px' }}>
                          <Globe size={20} color={site.status==='active' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{site.site_name}</h3>
                          <a href={site.domain} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginBottom: '12px' }}>{site.domain}</a>
                          <div style={{ marginBottom: '12px' }}>
                             <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                               {site.language || 'English'}
                             </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                             {site.status === 'active' 
                               ? <span style={{display: 'flex', alignItems: 'center', gap:'4px', fontSize:'11px', color:'var(--success-color)', fontWeight:'600', textTransform: 'uppercase'}}><CheckCircle size={12}/> Online</span>
                               : <span style={{display: 'flex', alignItems: 'center', gap:'4px', fontSize:'11px', color:'var(--text-secondary)', fontWeight:'600', textTransform: 'uppercase'}}><XCircle size={12}/> Offline</span>
                             }
                             <button className="glass-button danger" onClick={() => handleDelete(site._id)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                               <Trash2 size={14} /> Remove
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
