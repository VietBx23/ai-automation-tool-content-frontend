import { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Eye, ExternalLink, AlertCircle, CheckCircle, RefreshCw, Send, Search, Filter } from 'lucide-react';
import ArticleDrawer from '../components/ArticleDrawer';

const STATUS_MAP = {
  published: { label: 'Published', cls: 'badge-blue', icon: Send },
  processed:  { label: 'AI Ready',  cls: 'badge-green', icon: CheckCircle },
  processing: { label: 'Processing', cls: 'badge-yellow', icon: RefreshCw },
  ai_error:   { label: 'AI Error',  cls: 'badge-red', icon: AlertCircle },
};

const LANG_COLORS = { English: '#58a6ff', Hindi: '#f97316', Bengali: '#a78bfa', Urdu: '#34d399' };

export default function Articles() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles?limit=200');
      setData({ total: res.data.total, items: res.data.data });
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchArticles(); }, []);

  const handleRetryAI = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Thử lại AI cho bài viết này?')) return;
    try { await api.post(`/articles/${id}/retry-ai`); fetchArticles(); }
    catch (err) { alert('Lỗi: ' + (err.response?.data?.error || err.message)); }
  };

  const filtered = data.items.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || (a.title_ai || a.title_raw || '').toLowerCase().includes(q);
    const matchLang = !filterLang || a.language === filterLang;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchLang && matchStatus;
  });

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">AI Articles</h1>
          <p className="page-subtitle">All crawled and AI-processed articles across 4 languages.</p>
        </div>
        <span className="badge badge-gray" style={{ fontSize: 13, padding: '6px 14px' }}>
          <Database size={13} /> {data.total} records
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 140 }} value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">All Languages</option>
          {['English', 'Hindi', 'Bengali', 'Urdu'].map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn btn-ghost btn-icon" onClick={fetchArticles} title="Refresh"><RefreshCw size={15} /></button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Title & Metadata</th>
              <th style={{ width: 110 }}>Date</th>
              <th style={{ width: 100, textAlign: 'center' }}>Language</th>
              <th style={{ width: 110, textAlign: 'center' }}>Status</th>
              <th style={{ width: 160 }}>Published To</th>
              <th style={{ width: 70, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>No articles found.</td></tr>
            ) : filtered.map((art, idx) => {
              const id = art._id || art.id;
              const s = STATUS_MAP[art.status] || { label: 'Pending', cls: 'badge-gray', icon: Filter };
              const Icon = s.icon;
              const langColor = LANG_COLORS[art.language] || 'var(--text-2)';
              return (
                <tr key={id} onClick={() => { setSelectedArticle(art); setIsDrawerOpen(true); }} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'monospace' }}>{String(id).slice(-5)}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4, fontSize: 13 }}>
                      {art.title_ai || art.title_raw}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>/{art.slug || 'no-slug'}</span>
                      {art.focus_keyword && <span style={{ fontSize: 10, color: 'var(--yellow)', background: 'var(--yellow-dim)', padding: '1px 6px', borderRadius: 4 }}>{art.focus_keyword}</span>}
                      {art.source_url && (
                        <a href={art.source_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)' }}>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{fmtDate(art.post_date)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: langColor, background: langColor + '18', padding: '3px 8px', borderRadius: 20 }}>
                      {art.language || 'EN'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${s.cls}`}>
                      <Icon size={10} className={art.status === 'processing' ? 'spin' : ''} />
                      {s.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {art.published_to?.length > 0
                        ? art.published_to.map(site => (
                          <span key={site} className="badge badge-gray" style={{ fontSize: 9 }}>
                            {site.replace('https://', '').replace(/\/$/, '').split('/')[0]}
                          </span>
                        ))
                        : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>
                      }
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon" onClick={e => { e.stopPropagation(); setSelectedArticle(art); setIsDrawerOpen(true); }} title="Preview">
                        <Eye size={14} />
                      </button>
                      {art.status === 'ai_error' && (
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--accent)' }} onClick={e => handleRetryAI(e, id)} title="Retry AI">
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
