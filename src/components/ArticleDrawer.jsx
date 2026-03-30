import React from 'react';
import { X, ExternalLink, Calendar, Tag, Image as ImageIcon } from 'lucide-react';

export default function ArticleDrawer({ article, isOpen, onClose }) {
  if (!article && isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Article Preview
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Tag size={12} /> ID: {article?._id?.slice(-6)}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {article && (
            <>
              <div className="meta-box">
                <div className="meta-label">AI Optimized Title</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.4' }}>
                  {article.title_ai || article.title_raw}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div className="meta-label">Focus Keyword</div>
                    <div className="meta-value" style={{ fontWeight: '600', color: 'var(--accent-color)' }}>
                      {article.focus_keyword || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">Post Date</div>
                    <div className="meta-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(article.post_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="meta-label">Meta Description</div>
                <div className="meta-value" style={{ fontStyle: 'italic', lineHeight: '1.5' }}>
                  {article.meta_description || 'No description generated.'}
                </div>

                <div className="meta-label">Slug</div>
                <div className="meta-value" style={{ fontFamily: 'monospace', background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                  /{article.slug}
                </div>
              </div>

              {article.featured_image && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={12} /> Featured Image
                  </div>
                  <img 
                    src={article.featured_image} 
                    alt="Featured" 
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '8px' }} 
                  />
                </div>
              )}

              <div className="meta-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={12} /> Article Content (AI Generated)
                <span style={{ marginLeft: 'auto', fontWeight: 'normal', textTransform: 'none', background: 'var(--success-bg)', color: 'var(--success-color)', padding: '2px 8px', borderRadius: '100px', fontSize: '10px' }}>
                  HTML Rendered
                </span>
              </div>
              
              <div 
                className="article-content glass-panel" 
                style={{ padding: '20px', fontSize: '14px' }}
                dangerouslySetInnerHTML={{ __html: article.content_ai || '<p style="color: grey">No AI content generated yet.</p>' }} 
              />

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <div className="meta-label">Original Raw Content</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxHeight: '200px', overflowY: 'auto', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', whiteSpace: 'pre-wrap' }}>
                  {article.content_raw}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
