import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { Bot, UploadCloud, AlertCircle, Database, Globe, RefreshCw, Send, Calendar, Radio, TrendingUp, Zap } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function Dashboard() {
  const [crawlData, setCrawlData] = useState({ maxPosts: 10 });
  const [loadingCrawl, setLoadingCrawl] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [isCrawling, setIsCrawling] = useState(false);
  const [lastCrawlTime, setLastCrawlTime] = useState(null);
  const [stats, setStats] = useState({ totalSites: 0, totalArticles: 0, todayArticles: 0, readyToPublish: 0 });
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection', color: '#58a6ff' }]);
  const calendarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = () => {
    api.get('/stats').then(res => { if (res.data.success) setStats(res.data.data); }).catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    socket.on('crawl_cycle_start', () => setIsCrawling(true));
    socket.on('crawl_cycle_end', () => { setIsCrawling(false); setLastCrawlTime(new Date().toLocaleTimeString('vi-VN')); fetchStats(); });
    return () => { clearInterval(interval); socket.off('crawl_cycle_start'); socket.off('crawl_cycle_end'); };
  }, []);

  const handleCrawl = async (e) => {
    e.preventDefault(); setLoadingCrawl(true); setMessage({ text: '', type: 'info' });
    try {
      const { data } = await api.post('/jobs/crawl-and-ai', {
        startDate: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        maxPosts: crawlData.maxPosts
      });
      setMessage({ text: data.message, type: 'success' });
      fetchStats();
    } catch (err) { setMessage({ text: 'Lỗi: ' + (err.response?.data?.message || err.message), type: 'error' }); }
    setLoadingCrawl(false);
  };

  const handleSync = async () => {
    setLoadingSync(true); setMessage({ text: '', type: 'info' });
    try {
      const { data } = await api.post('/jobs/sync-posts');
      setMessage({ text: data.message, type: 'success' });
    } catch (err) { setMessage({ text: 'Lỗi: ' + (err.response?.data?.message || err.message), type: 'error' }); }
    setLoadingSync(false);
  };

  const statCards = [
    { label: 'PBN Nodes', value: stats.totalSites, icon: Globe, color: 'var(--accent)', bg: 'var(--accent-dim)' },
    { label: 'Total Articles', value: stats.totalArticles, icon: Database, color: 'var(--purple)', bg: 'var(--purple-dim)' },
    { label: 'Ready to Publish', value: stats.readyToPublish, icon: TrendingUp, color: 'var(--green)', bg: 'var(--green-dim)' },
    { label: 'Today Crawled', value: stats.todayArticles, icon: Zap, color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Manage automated content pipelines and PBN distribution.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: isCrawling ? 'var(--green-dim)' : 'var(--bg-3)', border: `1px solid ${isCrawling ? '#1a4a2a' : 'var(--border)'}`, transition: 'all 0.3s' }}>
          <Radio size={13} color={isCrawling ? 'var(--green)' : 'var(--text-3)'} style={{ animation: isCrawling ? 'spin 1.5s linear infinite' : 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: isCrawling ? 'var(--green)' : 'var(--text-3)' }}>
            {isCrawling ? 'CRAWLING...' : lastCrawlTime ? `Last: ${lastCrawlTime}` : 'Idle'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">{label}</span>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}`} style={{ marginBottom: 24 }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Panel 1: AI Pipeline */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 10, background: 'var(--accent-dim)', borderRadius: 10 }}>
              <Bot size={20} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>AI Content Pipeline</h2>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Crawl + rewrite via LLM (4 languages)</p>
            </div>
          </div>

          <form onSubmit={handleCrawl} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group" ref={calendarRef} style={{ position: 'relative' }}>
              <label className="label">Date Range</label>
              <div
                className="input"
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar size={15} color="var(--text-3)" />
                <span style={{ color: 'var(--text)' }}>
                  {format(dateRange[0].startDate, 'MMM dd, yyyy')} → {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                </span>
              </div>
              {showCalendar && (
                <div style={{ position: 'absolute', top: 72, left: 0, zIndex: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                  <DateRange
                    editableDateInputs
                    onChange={item => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    months={1}
                    direction="horizontal"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label">Max Articles Per Run</label>
              <input type="number" className="input" min="1" max="100" value={crawlData.maxPosts} onChange={e => setCrawlData({ ...crawlData, maxPosts: e.target.value })} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loadingCrawl} style={{ justifyContent: 'center', padding: '11px', fontSize: 14 }}>
              {loadingCrawl ? <><span className="spin" style={{ width: 14, height: 14, border: '2px solid #0d1117', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Processing...</> : <><Bot size={16} /> Initialize Pipeline</>}
            </button>
          </form>
        </div>

        {/* Panel 2: Force Sync */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 10, background: 'var(--green-dim)', borderRadius: 10 }}>
              <UploadCloud size={20} color="var(--green)" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Force PBN Sync</h2>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Push all processed articles to active sites</p>
            </div>
          </div>

          <div style={{ flex: 1, padding: 16, background: 'var(--bg-3)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Scans DB for all <span style={{ color: 'var(--green)', fontWeight: 600 }}>processed</span> articles and pushes them to all <span style={{ color: 'var(--accent)', fontWeight: 600 }}>active</span> WordPress nodes matching the article language. Duplicate posts are automatically filtered.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-green"><span className="dot dot-green" /> Auto-publish active</span>
              <span className="badge badge-blue">Language-matched</span>
            </div>
          </div>

          <button onClick={handleSync} className="btn btn-secondary" disabled={loadingSync} style={{ justifyContent: 'center', padding: '11px', fontSize: 14, borderColor: 'var(--green)', color: 'var(--green)' }}>
            {loadingSync ? <><span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Syncing...</> : <><RefreshCw size={16} /> Execute Force Sync</>}
          </button>
        </div>
      </div>
    </div>
  );
}
