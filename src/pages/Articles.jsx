import { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Eye, ExternalLink, AlertCircle, CheckCircle, RefreshCw, Send } from 'lucide-react';
import ArticleDrawer from '../components/ArticleDrawer';

export default function Articles() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles?limit=100');
      setData({ total: res.data.total, items: res.data.data });
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchArticles() }, []);

  const openArticle = (art) => {
    setSelectedArticle(art);
    setIsDrawerOpen(true);
  };

  const handleRetryAI = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bắt đầu xử lý lại AI cho bài viết này?")) return;
    try {
        await api.post(`/articles/${id}/retry-ai`);
        fetchArticles();
    } catch (err) {
        alert("Lỗi khi thử lại: " + (err.response?.data?.error || err.message));
    }
  };

  const d = (dateStr) => {
     if(!dateStr) return 'N/A';
     const dt = new Date(dateStr);
     return dt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }

  const renderStatus = (status) => {
    switch (status) {
      case 'published':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#e0e7ff', color: '#4338ca' }}>
            <Send size={10} /> PUBLISHED
          </span>
        );
      case 'processed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'var(--success-bg)', color: 'var(--success-color)' }}>
            <CheckCircle size={10} /> AI READY
          </span>
        );
      case 'processing':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#fef3c7', color: '#92400e' }}>
            <RefreshCw size={10} className="spin" /> PROCESSING
          </span>
        );
      case 'ai_error':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#b91c1c' }}>
            <AlertCircle size={10} /> AI ERROR
          </span>
        );
      default:
        return (
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            PENDING
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px' }}>Knowledge Base</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px'}}>Inventory of raw and AI-rewritten articles from ESPN & API.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>
          <Database size={14} color="var(--accent-color)" />
          Total Records: {data.total}
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', padding: '0' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>ID</th>
              <th>AI Optimized Title & Metadata</th>
              <th style={{ width: '130px' }}>Date</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Category</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '180px' }}>Published To</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="7" style={{padding: '32px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading schema...</td></tr>
            ) : data.items.map(art => {
              const artId = art._id || art.id;
              return (
                <tr key={artId} onClick={() => openArticle(art)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
                    {String(artId).slice(-6)}
                  </td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.4' }}>
                    {art.title_ai || art.title_raw} 
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {art.language || 'English'}
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace', opacity: 0.7 }}>/{art.slug || 'no-slug'}</div>
                    {art.source_url && (
                        <a href={art.source_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center' }}>
                            <ExternalLink size={10} />
                        </a>
                    )}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{d(art.post_date)}</td>
                <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {art.category || 'General'}
                    </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {renderStatus(art.status)}
                </td>
                <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {art.published_to?.length > 0 ? art.published_to.map(site => (
                            <span key={site} style={{ fontSize: '9px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                {site.replace('https://', '').replace(/\/$/, '')}
                            </span>
                        )) : <span style={{ fontSize: '10px', color: '#cbd5e1' }}>Not published</span>}
                    </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="glass-button" 
                        style={{ padding: '6px', minWidth: 'auto' }}
                        onClick={(e) => { e.stopPropagation(); openArticle(art); }}
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>
                      
                      {art.status === 'ai_error' && (
                          <button 
                            className="glass-button" 
                            style={{ padding: '6px', minWidth: 'auto', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                            onClick={(e) => handleRetryAI(e, artId)}
                            title="Thử lại AI"
                          >
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

      <ArticleDrawer 
        article={selectedArticle} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
