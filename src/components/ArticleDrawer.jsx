import { X, Calendar, Tag, Image as ImageIcon, ExternalLink, Hash } from 'lucide-react';

const LANG_COLORS = { English: '#58a6ff', Hindi: '#f97316', Bengali: '#a78bfa', Urdu: '#34d399' };

export default function ArticleDrawer({ article, isOpen, onClose }) {
  if (!article && isOpen) return null;

  const lc = LANG_COLORS[article?.language] || 'var(--text-2)';

  return (
    <div className={`drawer-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Article Preview</h2>
            <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Tag size={11} /> {article?._id?.slice(-8)}
              {article?.language && (
                <span style={{ color: lc, background: lc + '18', padding: '1px 7px', borderRadius: 10, fontWeight: 700, fontSize: 10 }}>
                  {article.language}
                </span>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {article && (
            <>
              {/* Title & Meta */}
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: 16 }}>
                  {article.title_ai || article.title_raw}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Focus Keyword</div>
                    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{article.focus_keyword || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Post Date</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(article.post_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Meta Description</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>{article.meta_description || '—'}</div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Slug</div>
                  <code style={{ fontSize: 12, color: 'var(--green)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>/{article.slug}</code>
                </div>

                {article.keywords?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {article.keywords.map(k => (
                        <span key={k} className="badge badge-gray" style={{ fontSize: 10 }}><Hash size={9} />{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.featured_image && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ImageIcon size={11} /> Featured Image
                  </div>
                  <img src={article.featured_image} alt="Featured" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
                </div>
              )}

              {/* AI Content */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={11} /> AI Generated Content
                  <span className="badge badge-green" style={{ fontSize: 9, marginLeft: 'auto', textTransform: 'none' }}>HTML Rendered</span>
                </div>
                <div
                  className="article-content card"
                  style={{ padding: 20, fontSize: 14 }}
                  dangerouslySetInnerHTML={{ __html: article.content_ai || '<p style="color:var(--text-3)">No AI content generated yet.</p>' }}
                />
              </div>

              {/* Raw Content */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Original Source</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', maxHeight: 180, overflowY: 'auto', padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px dashed var(--border)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {article.content_raw || '—'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
