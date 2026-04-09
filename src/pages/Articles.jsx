import { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Eye, ExternalLink, AlertCircle, CheckCircle, RefreshCw, Send, Search, Filter, Trash2, Clock } from 'lucide-react';
import ArticleDrawer from '../components/ArticleDrawer';

const STATUS_MAP = {
  published:  { label: 'Published',  cls: 'badge-blue',   icon: Send },
  processed:  { label: 'AI Ready',   cls: 'badge-green',  icon: CheckCircle },
  processing: { label: 'Processing', cls: 'badge-yellow', icon: RefreshCw },
  ai_error:   { label: 'AI Error',   cls: 'badge-red',    icon: AlertCircle },
};

const LANG_COLORS = {
  English: { color: '#58a6ff', bg: 'rgba(88,166,255,0.12)' },
  Hindi:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  Bengali: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  Urdu:    { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
};

export default function Articles() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xóa bài viết này khỏi database?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/articles/${id}`);
      setData(prev => ({ total: prev.total - 1, items: prev.items.filter(a => (a._id || a.id) !== id) }));
    } catch (err) { alert('Xóa thất bại: ' + (err.response?.data?.message || err.message)); }
    setDeletingId(null);
  };

  const filtered = data.items.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || (a.title_ai || a.title_raw || '').toLowerCase().includes(q);
    const matchLang = !filterLang || a.language === filterLang;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchLang && matchStatus;
  });

  const fmtDate = d => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fmtDateTime = d => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Đếm theo status
  const counts = data.items.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">AI Articles</h1>
          <p className="page-subtitle">All crawled and AI-processed articles across 4 languages.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-gray" style={{ fontSize: 12, padding: '5px 12px' }}>
            <Database size={12} /> {data.total} total
          </span>
        </div>
      </div>

      {/* Status summary pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_MAP).map(([k, v]) => counts[k] ? (
          <span key={k} className={`badge ${v.cls}`} style={{ fontSize: 12, padding: '4px 12px', cursor: 'pointer', opacity: filterStatus === k ? 1 : 0.7 }} onClick={() => setFilterStatus(filterStatus === k ? '' : k)}>
            <v.icon size={11} /> {v.label} · {counts[k]}
          </span>
        ) : null)}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 145 }} value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">All Languages</option>
          {['English', 'Hindi', 'Bengali', 'Urdu'].map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn btn-ghost btn-icon" onClick={fetchArticles} title="Refresh" style={{ flexShrink: 0 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 46 }}>#</th>
              <th>Title & SEO</th>
              <th style={{ width: 105 }}>Post Date</th>
              <th style={{ width: 130 }}>Published At</th>
              <th style={{ width: 95, textAlign: 'center' }}>Lang</th>
              <th style={{ width: 115, textAlign: 'center' }}>Status</th>
              <th style={{ width: 170 }}>Published To</th>
              <th style={{ width: 80, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
                <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                Loading articles...
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
                No articles found.
              </td></tr>
            ) : filtered.map(art => {
              const id = art._id || art.id;
              const s = STATUS_MAP[art.status] || { label: 'Pending', cls: 'badge-gray', icon: Filter };
              const Icon = s.icon;
              const lc = LANG_COLORS[art.language] || { color: 'var(--text-2)', bg: 'var(--bg-3)' };
              const isDeleting = deletingId === id;

              return (
                <tr key={id} onClick={() => { setSelectedArticle(art); setIsDrawerOpen(true); }} style={{ cursor: 'pointer', opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                  
                  {/* ID */}
                  <td style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {String(id).slice(-5)}
                  </td>

                  {/* Title */}
                  <td style={{ maxWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, fontSize: 13, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {art.title_ai || art.title_raw}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        /{art.slug || 'no-slug'}
                      </span>
                      {art.focus_keyword && (
                        <span style={{ fontSize: 10, color: 'var(--yellow)', background: 'var(--yellow-dim)', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          🔑 {art.focus_keyword}
                        </span>
                      )}
                      {art.source_url && (
                        <a href={art.source_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)', flexShrink: 0 }}>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Post Date */}
                  <td style={{ color: 'var(--text-2)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmtDate(art.post_date)}
                  </td>

                  {/* Published At */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {art.status === 'published' && art.published_at ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--green)', fontSize: 11 }}>
                        <Clock size={11} />
                        {fmtDateTime(art.published_at)}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: 11 }}>—</span>
                    )}
                  </td>

                  {/* Language */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: lc.color, background: lc.bg, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {art.language || 'EN'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${s.cls}`}>
                      <Icon size={10} className={art.status === 'processing' ? 'spin' : ''} />
                      {s.label}
                    </span>
                  </td>

                  {/* Published To */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {art.published_to?.length > 0
                        ? art.published_to.map(site => (
                          <span key={site} className="badge badge-gray" style={{ fontSize: 9 }}>
                            {site.replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]}
                          </span>
                        ))
                        : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>
                      }
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={e => { e.stopPropagation(); setSelectedArticle(art); setIsDrawerOpen(true); }}
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>

                      {art.status === 'ai_error' && (
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ color: 'var(--accent)' }}
                          onClick={e => handleRetryAI(e, id)}
                          title="Retry AI"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}

                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ color: 'var(--red)' }}
                        onClick={e => handleDelete(e, id)}
                        title="Xóa bài viết"
                        disabled={isDeleting}
                      >
                        {isDeleting ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Showing {filtered.length} of {data.total} articles
            </span>
            {(search || filterLang || filterStatus) && (
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => { setSearch(''); setFilterLang(''); setFilterStatus(''); }}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
