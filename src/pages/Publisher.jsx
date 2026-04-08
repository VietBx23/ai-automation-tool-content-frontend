import { useState, useEffect } from 'react';
import api from '../services/api';
import { Send, FileText, Globe, CheckSquare, Square, AlertCircle } from 'lucide-react';

export default function Publisher() {
  const [articles, setArticles] = useState([]);
  const [sites, setSites] = useState([]);
  
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Lấy bài viết đã xử lý hoặc đã đăng một phần
    api.get('/articles?limit=50').then(res => {
        const arr = res.data?.data || [];
        setArticles(arr.filter(a => ['processed', 'published', 'processing', 'ai_error'].includes(a.status)));
    }).catch(console.error);

    api.get('/sites').then(res => {
        const arr = res.data?.data || [];
        setSites(arr.filter(s => s.status === 'active'));
    }).catch(console.error);
  }, []);

  const toggleArticle = (id) => {
    if (selectedArticles.includes(id)) {
        setSelectedArticles(selectedArticles.filter(a => a !== id));
    } else {
        setSelectedArticles([...selectedArticles, id]);
    }
  };

  const selectAllArticles = () => {
    if (selectedArticles.length === articles.length) setSelectedArticles([]);
    else setSelectedArticles(articles.map(a => a._id || a.id));
  };

  const toggleSite = (id) => {
    if (selectedSites.includes(id)) {
        setSelectedSites(selectedSites.filter(s => s !== id));
    } else {
        setSelectedSites([...selectedSites, id]);
    }
  };

  const selectAllSites = () => {
    if(selectedSites.length === sites.length) setSelectedSites([]);
    else setSelectedSites(sites.map(s => s._id || s.id));
  };

  const publish = async () => {
    if (selectedArticles.length === 0) return alert('Vui lòng chọn ít nhất 1 Bài viết (Article)!');
    if (selectedSites.length === 0) return alert('Vui lòng đánh dấu ít nhất 1 Website vệ tinh!');
    
    setPublishing(true);
    setMessage('');
    try {
      const { data } = await api.post('/jobs/manual-publish', { 
          articleIds: selectedArticles, 
          websiteIds: selectedSites 
      });
      setMessage(data.message);
      // Xoá dấu tick sau khi bấm
      setSelectedSites([]);
      setSelectedArticles([]);
    } catch (e) { 
      setMessage('Lỗi: ' + (e.response?.data?.message || e.message)); 
    }
    setPublishing(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Manual Publisher</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '13px' }}>Push specific articles into targeted WordPress nodes intentionally.</p>

      {message && (
        <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '24px', borderLeft: '4px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', borderRadius: '6px' }}>
          <AlertCircle size={18} color="var(--accent-color)" />
          <span style={{ color: 'var(--accent-color)', fontWeight: '500', fontSize: '13px' }}>{message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '24px', alignItems: 'stretch' }}>
         
         {/* Khu Mảnh 1: Chọn bài viết */}
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', justifyContent: 'space-between' }}>
               <div style={{display:'flex', alignItems:'center', gap:'8px'}}><FileText size={18} color="var(--accent-color)" /> 1. Select Blueprint Article(s)</div>
               <button onClick={selectAllArticles} style={{ background:'transparent', border:'none', color:'var(--accent-color)', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Toggle All</button>
            </h2>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc', overflowY: 'auto', flex: 1, maxHeight: '500px' }}>
                {articles.length === 0 ? <p style={{padding:'24px', textAlign:'center', color:'var(--text-secondary)'}}>No processed articles available.</p> : null}
                {articles.map((art) => {
                    const artId = art._id || art.id;
                    const isSelected = selectedArticles.includes(artId);
                    return (
                        <label 
                            key={artId} 
                            onClick={() => toggleArticle(artId)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                padding: '16px', 
                                borderBottom: '1px solid var(--border-color)', 
                                cursor: 'pointer', 
                                background: isSelected ? 'white' : 'transparent', 
                                transition: 'background 0.2s' 
                            }}
                        >
                            {isSelected ? <CheckSquare size={18} color="var(--accent-color)"/> : <Square size={18} color="#cbd5e1"/> }
                            <div style={{ marginLeft: '12px', flex: 1 }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.4', marginBottom: '4px' }}>{art.title_ai || art.title_raw}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Slug: {art.slug || 'no-slug'}</div>
                                    {art.published_to?.length > 0 && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {art.published_to.map(site => (
                                                <span key={site} style={{ fontSize: '9px', background: '#e0e7ff', color: '#4338ca', padding: '1px 5px', borderRadius: '3px', fontWeight: '600' }}>
                                                    {site.replace('https://', '').replace(/\/$/, '')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
         </div>

         {/* Khu Mảnh 2: Chọn Website và Bắn */}
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', justifyContent: 'space-between' }}>
               <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Globe size={18} color="var(--success-color)" /> 2. Target Nodes (PBN)</div>
               <button onClick={selectAllSites} style={{ background:'transparent', border:'none', color:'var(--accent-color)', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Toggle All</button>
            </h2>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc', overflowY: 'auto', flex: 1, maxHeight: '350px', marginBottom: '16px' }}>
                {sites.length === 0 ? <p style={{padding:'24px', textAlign:'center', color:'var(--text-secondary)'}}>No active sites available.</p> : null}
                {sites.map((site) => {
                    const sId = site._id || site.id;
                    const isSiteSelected = selectedSites.includes(sId);
                    return (
                        <label key={sId} onClick={() => toggleSite(sId)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s', background: isSiteSelected ? 'white' : 'transparent' }}>
                            {isSiteSelected ? <CheckSquare size={18} color="var(--accent-color)"/> : <Square size={18} color="#cbd5e1"/> }
                            <div style={{ marginLeft: '12px', flex: 1 }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{site.site_name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{site.domain}</div>
                            </div>
                        </label>
                    );
                })}
            </div>

            <button onClick={publish} className="glass-button primary" disabled={publishing} style={{ justifyContent: 'center', padding: '16px', borderRadius: '10px', fontSize: '14px', background: 'var(--text-primary)' }}>
               {publishing ? 'Dispersing packets...' : 'DIRECT OVERRIDE PUBLISH'}
               <Send size={18} style={{marginLeft: '4px'}}/>
            </button>
         </div>

      </div>
    </div>
  );
}
