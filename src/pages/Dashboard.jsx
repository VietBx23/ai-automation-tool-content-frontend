import { useState } from 'react';
import api from '../services/api';
import { Bot, UploadCloud, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [crawlData, setCrawlData] = useState({ startDate: '', endDate: '', maxPosts: 10 });
  const [loadingCrawl, setLoadingCrawl] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [message, setMessage] = useState('');

  const handleCrawl = async (e) => {
    e.preventDefault();
    setLoadingCrawl(true); setMessage('');
    try {
      const { data } = await api.post('/jobs/crawl-and-ai', crawlData);
      setMessage(data.message);
    } catch (err) { setMessage('Lỗi Cào dữ liệu: ' + (err.response?.data?.message || err.message)); }
    setLoadingCrawl(false);
  };

  const handleSync = async () => {
    setLoadingSync(true); setMessage('');
    try {
      const { data } = await api.post('/jobs/sync-posts');
      setMessage(data.message);
    } catch (err) { setMessage('Lỗi Đồng bộ: ' + (err.response?.data?.message || err.message)); }
    setLoadingSync(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Terminal Điều Khiển</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>Quản lý đa luồng tự động dành cho kho báo chí điện tử.</p>
      
      {message && (
        <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '32px', borderLeft: '4px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '12px', background: '#eff6ff', borderRadius: '8px' }}>
          <AlertCircle size={20} color="var(--accent-color)" />
          <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Panel 1: AI Crawler */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '14px', color: 'var(--accent-color)' }}>
              <Bot size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>1. Sáng Tạo Bằng AI Tự Động</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Rút trích các tin mới nhất qua bộ lọc LLM</p>
            </div>
          </div>

          <form onSubmit={handleCrawl} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Dữ Liệu Từ Góc Ngày</label>
                <input type="date" className="glass-input" required value={crawlData.startDate} onChange={e => setCrawlData({...crawlData, startDate: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Quét Đến Ngày Kết Thúc</label>
                <input type="date" className="glass-input" required value={crawlData.endDate} onChange={e => setCrawlData({...crawlData, endDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Nạp Tối Đa (Max Items/Lượt)</label>
              <input type="number" className="glass-input" min="1" max="100" value={crawlData.maxPosts} onChange={e => setCrawlData({...crawlData, maxPosts: e.target.value})} />
            </div>
            
            <button className="glass-button primary" type="submit" disabled={loadingCrawl} style={{ marginTop: '12px', justifyContent: 'center', padding: '14px', fontSize: '15px', borderRadius: '10px' }}>
              {loadingCrawl ? 'Đang giao việc cho Bot...' : 'KẾT NỐI MÁY CHỦ BẮT ĐẦU CHẠY'}
            </button>
          </form>
        </div>

        {/* Panel 2: Sync WP */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '14px', background: 'var(--text-primary)', color: 'white', borderRadius: '14px' }}>
              <UploadCloud size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>2. Phân Tán Trên PBN</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Xuất bản chùm lên các site WordPress</p>
            </div>
          </div>

          <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Bấm nút kích hoạt, máy trạm sẽ lập tức rà soát toàn bộ hàng vắng trong hệ dữ liệu và phát tán tất cả hàng <strong style={{color:'var(--success-color)'}}>Processed (Thành Công)</strong> tới toàn bộ website đang trong trạng thái cắm cờ <strong style={{color:'var(--accent-color)'}}>Active</strong>!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', fontStyle: 'italic' }}>
              * Bộ nén sẽ tự động phân loại, tải ảnh thẳng vào Content-Type của API WordPress và đồng bộ ngày xuất bản GMT chuẩn xác.
            </p>
          </div>

          <button onClick={handleSync} className="glass-button" disabled={loadingSync} style={{ marginTop: '24px', justifyContent: 'center', padding: '14px', background: 'var(--text-primary)', color: 'white', fontSize: '15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {loadingSync ? 'Hệ thống đang phát trực tiếp...' : 'THỰC THI PHÁT TÁN TỨC THỜI'}
          </button>
        </div>

      </div>
    </div>
  );
}
