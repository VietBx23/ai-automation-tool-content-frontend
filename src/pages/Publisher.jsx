import { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { Send, FileText, Globe, CheckSquare, Square, AlertCircle, Zap } from 'lucide-react';

export default function Publisher() {
  const [articles, setArticles] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/articles?limit=100').then(res => {
      setArticles((res.data?.data || []).filter(a => ['processed', 'published', 'ai_error'].includes(a.status)));
    }).catch(console.error);
    api.get('/sites').then(res => {
      setSites((res.data?.data || []).filter(s => s.status === 'active'));
    }).catch(console.error);

    socket.on('article_processed', (a) => {
      setArticles(prev => prev.find(x => (x._id || x.id) === (a._id || a.id)) ? prev : [a, ...prev]);
      setToast(`⚡ New: ${a.title_ai || a.title_raw}`);
      setTimeout(() => setToast(null), 4000);
    });
    return () => socket.off('article_processed');
  }, []);

  const toggleArticle = id => setSelectedArticles(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSite = id => setSelectedSites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllArticles = () => setSelectedArticles(p => p.length === articles.length ? [] : articles.map(a => a._id || a.id));
  const toggleAllSites = () => setSelectedSites(p => p.length === sites.length ? [] : sites.map(s => s._id || s.id));

  const publish = async () => {
    if (!selectedArticles.length) return alert('Chọn ít nhất 1 bài viết!');
    if (!selectedSites.length) return alert('Chọn ít nhất 1 website!');
    setPublishing(true); setMessage({ text: '', type: 'info' });
    try {
      const { data } = await api.post('/jobs/manual-publish', { articleIds: selectedArticles, websiteIds: selectedSites });
      setMessage({ text: data.message, type: 'success' });
      setSelectedArticles([]); setSelectedSites([]);
    } catch (e) { setMessage({ text: 'Lỗi: ' + (e.response?.data?.message || e.message), type: 'error' }); }
    setPublishing(false);
  };

  const LANG_COLORS = { English: '#58a6ff', Hindi: '#f97316', Bengali: '#a78bfa', Urdu: '#34d399' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manual Publisher</h1>
        <p className="page-subtitle">Push specific articles to targeted WordPress nodes.</p>
      </div>

      {toast && (
        <div className="toast">
          <Zap size={15} color="var(--green)" />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toast}</span>
        </div>
      )}

      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: 20 }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Articles */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} color="var(--accent)" /> Select Articles
              <span className="badge badge-gray">{selectedArticles.length} selected</span>
            </h2>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={toggleAllArticles}>
              {selectedArticles.length === articles.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', maxHeight: 480, overflowY: 'auto' }}>
            {articles.length === 0
              ? <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)' }}>No articles available.</p>
              : articles.map(art => {
                const id = art._id || art.id;
                const sel = selectedArticles.includes(id);
                const lc = LANG_COLORS[art.language] || 'var(--text-2)';
                return (
                  <div key={id} className={`check-item${sel ? ' selected' : ''}`} onClick={() => toggleArticle(id)}>
                    {sel ? <CheckSquare size={16} color="var(--accent)" style={{ flexShrink: 0 }} /> : <Square size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {art.title_ai || art.title_raw}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: lc, background: lc + '18', padding: '1px 6px', borderRadius: 10 }}>{art.language}</span>
                        {art.published_to?.map(s => (
                          <span key={s} className="badge badge-blue" style={{ fontSize: 9 }}>{s.replace('https://', '').split('/')[0]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Sites + Publish */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={16} color="var(--green)" /> Target Sites
              </h2>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={toggleAllSites}>
                {selectedSites.length === sites.length ? 'Deselect' : 'All'}
              </button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
              {sites.length === 0
                ? <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>No active sites.</p>
                : sites.map(site => {
                  const id = site._id || site.id;
                  const sel = selectedSites.includes(id);
                  return (
                    <div key={id} className={`check-item${sel ? ' selected' : ''}`} onClick={() => toggleSite(id)}>
                      {sel ? <CheckSquare size={15} color="var(--accent)" style={{ flexShrink: 0 }} /> : <Square size={15} color="var(--text-3)" style={{ flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, marginBottom: 2 }}>{site.site_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.domain}</div>
                        <span className="badge badge-blue" style={{ fontSize: 9, marginTop: 4 }}>{site.language}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <button className="btn btn-primary" onClick={publish} disabled={publishing} style={{ justifyContent: 'center', padding: '13px', fontSize: 14, width: '100%' }}>
            {publishing
              ? <><span className="spin" style={{ width: 14, height: 14, border: '2px solid #0d1117', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Publishing...</>
              : <><Send size={16} /> Publish ({selectedArticles.length} × {selectedSites.length})</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
