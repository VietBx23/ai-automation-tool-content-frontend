import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { Bot, UploadCloud, AlertCircle, Database, Globe, RefreshCw, Send, Calendar, Radio } from 'lucide-react';

import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function Dashboard() {
  const [crawlData, setCrawlData] = useState({ maxPosts: 10 });
  const [loadingCrawl, setLoadingCrawl] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [message, setMessage] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [lastCrawlTime, setLastCrawlTime] = useState(null);
  
  const [stats, setStats] = useState({ totalSites: 0, totalArticles: 0, todayArticles: 0, readyToPublish: 0 });

  // Date Range Picker State
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
      color: 'var(--accent-color)'
    }
  ]);
  const calendarRef = useRef(null);

  // Đóng calendar khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStats = () => {
    api.get('/stats').then(res => {
       if(res.data.success) setStats(res.data.data);
    }).catch(err => console.error("API error", err));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Giảm xuống 30s vì giờ có socket

    // Lắng nghe sự kiện Socket.io
    socket.on('crawl_cycle_start', () => {
      setIsCrawling(true);
    });
    socket.on('crawl_cycle_end', (data) => {
      setIsCrawling(false);
      setLastCrawlTime(new Date().toLocaleTimeString('vi-VN'));
      fetchStats(); // Tự động cập nhật stats sau mỗi chu kỳ
    });

    return () => {
      clearInterval(interval);
      socket.off('crawl_cycle_start');
      socket.off('crawl_cycle_end');
    };
  }, []);


  const handleCrawl = async (e) => {
    e.preventDefault();
    setLoadingCrawl(true); setMessage('');
    try {
      const payload = {
        startDate: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        endDate: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        maxPosts: crawlData.maxPosts
      };

      const { data } = await api.post('/jobs/crawl-and-ai', payload);
      setMessage(data.message);
      fetchStats();
    } catch (err) { setMessage('Crawl Error: ' + (err.response?.data?.message || err.message)); }
    setLoadingCrawl(false);
  };

  const handleSync = async () => {
    setLoadingSync(true); setMessage('');
    try {
      const { data } = await api.post('/jobs/sync-posts');
      setMessage(data.message);
    } catch (err) { setMessage('Sync Error: ' + (err.response?.data?.message || err.message)); }
    setLoadingSync(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Command Center</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: isCrawling ? '#dcfce7' : '#f1f5f9', border: `1px solid ${isCrawling ? '#86efac' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
          <Radio size={14} color={isCrawling ? '#16a34a' : '#94a3b8'} style={{ animation: isCrawling ? 'spin 1.5s linear infinite' : 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: isCrawling ? '#16a34a' : '#94a3b8' }}>
            {isCrawling ? 'CRAWLING...' : lastCrawlTime ? `Last: ${lastCrawlTime}` : 'Idle'}
          </span>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '13px' }}>Manage automated content pipelines and PBN distribution.</p>
      
      {/* Thống kê Metrics */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Nodes Connected</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Globe size={24} color="var(--accent-color)" />
               <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.totalSites}</span>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Database Volume</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Database size={24} color="#6366f1" />
               <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.totalArticles}</span>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>LLM Processed</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <RefreshCw size={24} color="var(--success-color)" />
               <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.readyToPublish}</span>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Today Incoming</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Send size={24} color="#f59e0b" />
               <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.todayArticles}</span>
            </div>
         </div>
      </div>

      {message && (
        <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '24px', borderLeft: '4px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', borderRadius: '6px' }}>
          <AlertCircle size={18} color="var(--accent-color)" />
          <span style={{ color: 'var(--accent-color)', fontWeight: '500', fontSize: '13px' }}>{message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Panel 1: AI Crawler */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', color: 'var(--accent-color)' }}>
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>1. Auto AI Content Pipeline</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Fetch and rewrite raw articles via LLM</p>
            </div>
          </div>

          <form onSubmit={handleCrawl} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Custom Date Range Component */}
            <div style={{ position: 'relative' }} ref={calendarRef}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Data Extraction Range</label>
              
              <div 
                className="glass-input" 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', cursor: 'pointer', padding: '12px 16px' }}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                </span>
              </div>

              {showCalendar && (
                <div style={{ position: 'absolute', top: '70px', left: 0, zIndex: 1000, boxShadow: 'var(--shadow-md)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    months={1}
                    direction="horizontal"
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Max Items Per Run</label>
              <input type="number" className="glass-input" style={{background: '#ffffff', padding: '12px 16px'}} min="1" max="100" value={crawlData.maxPosts} onChange={e => setCrawlData({...crawlData, maxPosts: e.target.value})} />
            </div>
            
            <button className="glass-button primary" type="submit" disabled={loadingCrawl} style={{ marginTop: '8px', justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: '700' }}>
              {loadingCrawl ? 'Processing in background...' : 'INITIALIZE PIPELINE'}
            </button>
          </form>
        </div>

        {/* Panel 2: Sync WP */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#f1f5f9', color: 'var(--text-primary)', borderRadius: '10px' }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>2. Auto PBN Distribution</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Publish processed articles globally</p>
            </div>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              The system scans the database for all <strong style={{color:'var(--success-color)'}}>Processed</strong> queue and pushes them to all <strong style={{color:'var(--text-primary)'}}>Active</strong> WordPress instances. Redundant cross-posts are filtered.
            </p>
          </div>

          <button onClick={handleSync} className="glass-button" disabled={loadingSync} style={{ marginTop: '20px', justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: '700', background: 'var(--text-primary)', color: 'white', border: 'none' }}>
            {loadingSync ? 'Synchronizing globally...' : 'EXECUTE FORCED SYNC'}
          </button>
        </div>

      </div>
    </div>
  );
}
