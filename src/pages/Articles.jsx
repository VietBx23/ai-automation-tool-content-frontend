import { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, Eye } from 'lucide-react';
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

  const d = (dateStr) => {
     if(!dateStr) return 'N/A';
     const dt = new Date(dateStr);
     return dt.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px' }}>Knowledge Base</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px'}}>Inventory of raw and AI-rewritten articles.</p>
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
              <th style={{ width: '150px' }}>Original Date</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="5" style={{padding: '32px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading schema...</td></tr>
            ) : data.items.map(art => {
              const artId = art._id || art.id;
              return (
                <tr key={artId} onClick={() => openArticle(art)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
                    {String(artId).slice(-6)}
                  </td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.4' }}>{art.title_ai || art.title_raw}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>/{art.slug}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{d(art.post_date)}</td>
                <td style={{ textAlign: 'center' }}>
                  {art.status === 'processed' ? (
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: 'var(--success-bg)', color: 'var(--success-color)' }}>
                      PROCESSED
                    </span>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      PENDING
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="glass-button" 
                    style={{ padding: '6px', minWidth: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); openArticle(art); }}
                  >
                    <Eye size={14} />
                  </button>
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
