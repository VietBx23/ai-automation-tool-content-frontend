import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, PlusCircle, Globe, CheckCircle, XCircle } from 'lucide-react';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active' });

  const fetchData = async () => {
    try { const { data } = await api.get('/sites'); setSites(data.data); } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchData() }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Thực sự xoá vĩnh viễn dữ liệu Web này khỏi mạng lưới?")) return;
    try { await api.delete(`/sites/${id}`); fetchData(); } catch (error) { alert("Lỗi xoá máy chủ con"); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sites', formData);
      setFormData({ site_name: '', domain: '', wp_user: '', app_password: '', status: 'active' });
      fetchData();
    } catch (error) { alert("Lỗi tích hợp site"); }
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Quản Trị Mạng Màng Nhện</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>Đồng bộ tài khoản kết xuất REST API từ các sub-domain WordPress.</p>


      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Form Add Site */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            <PlusCircle size={20} color="var(--accent-color)" /> Tích Hợp Thêm Website 
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div>
               <label style={{fontSize:'13px', fontWeight:'700', marginBottom:'8px', display:'block'}}>Tên Hiển Thị (Nickname)</label>
               <input type="text" placeholder="VD: Báo Công Nghệ TV" className="glass-input" required value={formData.site_name} onChange={e=>setFormData({...formData, site_name: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'13px', fontWeight:'700', marginBottom:'8px', display:'block'}}>Đường Dẫn Mạng (URL)</label>
               <input type="url" placeholder="VD: https://baocongnghe.com" className="glass-input" required value={formData.domain} onChange={e=>setFormData({...formData, domain: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'13px', fontWeight:'700', marginBottom:'8px', display:'block'}}>Cấp Độ Quản Trị Username</label>
               <input type="text" placeholder="Gõ Admin username" className="glass-input" required value={formData.wp_user} onChange={e=>setFormData({...formData, wp_user: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'13px', fontWeight:'700', marginBottom:'8px', display:'block'}}>Chuỗi Chìa Khóa Ứng Dụng</label>
               <input type="text" placeholder="Application Password" className="glass-input" required value={formData.app_password} onChange={e=>setFormData({...formData, app_password: e.target.value})} />
             </div>
             <div>
               <label style={{fontSize:'13px', fontWeight:'700', marginBottom:'8px', display:'block'}}>Công Tắc Máy Chủ</label>
               <select className="glass-input" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                 <option value="active">Bật Đèn Xanh (Sẵn sàng tải bài)</option>
                 <option value="inactive">Đóng Cửa Đèn Đỏ (Stop tải)</option>
               </select>
             </div>
             <button className="glass-button primary" type="submit" style={{ justifyContent: 'center', marginTop: '12px', padding: '14px', borderRadius: '10px' }}>Thêm Vào Mạng Lưới</button>
          </form>
        </div>

        {/* List Sites */}
        <div>
           {loading ? <p style={{color: 'var(--text-secondary)', fontWeight: '500'}}>Đang quét hệ thống vệ tinh...</p> : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
               {sites.length === 0 ? <div className="glass-panel" style={{padding:'40px', textAlign:'center', color:'var(--text-secondary)'}}>Trống trơn. Bạn hãy trỏ tên miền WordPress về đây để AI phục vụ.</div> : null}
               {sites.map(site => (
                 <div key={site.id} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: site.status==='active' ? 'var(--accent-color)' : 'var(--text-secondary)' }}></div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                       <div style={{ padding: '16px', background: site.status==='active' ? '#eff6ff' : '#f3f4f6', borderRadius: '16px' }}>
                          <Globe size={28} color={site.status==='active' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                             <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{site.site_name}</h3>
                          </div>
                          <a href={site.domain} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--accent-color)', textDecoration: 'none', display: 'block', marginBottom: '16px', fontWeight: '500' }}>{site.domain}</a>
                          
                          <div style={{ background: '#f9fafb', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                             <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>User: <span style={{color: 'var(--text-primary)'}}>{site.wp_user}</span></p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             {site.status === 'active' 
                               ? <span style={{display: 'flex', alignItems: 'center', gap:'6px', fontSize:'13px', color:'var(--success-color)', fontWeight:'600'}}><CheckCircle size={16}/> Đang đấu nối</span>
                               : <span style={{display: 'flex', alignItems: 'center', gap:'6px', fontSize:'13px', color:'var(--text-secondary)', fontWeight:'600'}}><XCircle size={16}/> Gián đoạn</span>
                             }
                             <button className="glass-button danger" onClick={() => handleDelete(site.id)} style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px' }}>
                               <Trash2 size={14} /> Gỡ
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
