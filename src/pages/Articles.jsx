import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Articles() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles?limit=100');
      setData({ total: res.data.total, items: res.data.data });
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { fetchArticles() }, []);

  const d = (dateStr) => {
     if(!dateStr) return 'N/A';
     const dt = new Date(dateStr);
     return dt.toLocaleDateString('vi-VN') + ' \u2022 ' + dt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Kho Ký Sự LLM</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '15px'}}>Lịch sử các văn bản tin tức được AI biên dịch trong hệ thống.</p>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: 'var(--accent-color)' }}>
          Dung lượng nạp: {data.total} tin báo
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', padding: '0', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Mã Thẻ</th>
              <th>Tiêu đề Nội Dung Đã Chuẩn Hoá (SEO Optimized)</th>
              <th style={{ width: '200px' }}>Xuất Bản Khởi Thuỷ</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Kiểm định AI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="4" style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize:'15px', fontWeight:'500'}}>Vui lòng đợi vài giây để giải phóng bản đồ dữ liệu...</td></tr>
            ) : data.items.map(art => (
              <tr key={art.id}>
                <td style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '700', textAlign: 'center' }}>#{art.id}</td>
                <td>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px', lineHeight: '1.4' }}>{art.title_ai || art.title_raw}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: '#f3f4f6', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>/{art.slug}</div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{d(art.post_date)}</td>
                <td style={{ textAlign: 'center' }}>
                  {art.status === 'processed' ? (
                    <span style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', background: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                      ĐÃ QUA LỌC
                    </span>
                  ) : (
                    <span style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', background: '#f3f4f6', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      CHƯA XONG
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
