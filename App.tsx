
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchHistoricalData, fetchMarketStats, getNewsEvents } from './services/cryptoService';
import { translations, languageNames, LanguageCode } from './services/translations';
import { isAuthenticated } from './services/authService';
import { PriceDataPoint, MarketStats, TimeRange, NewsEvent } from './types';
import PriceChart from './components/PriceChart';
import StatsCard from './components/StatsCard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  // View State: 'app', 'admin'
  const [viewMode, setViewMode] = useState<'app' | 'admin'>('app');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // App Logic State
  const [range, setRange] = useState<TimeRange>(TimeRange.MAX);
  const [fullHistory, setFullHistory] = useState<PriceDataPoint[]>([]);
  const [displayHistory, setDisplayHistory] = useState<PriceDataPoint[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Language State
  const [lang, setLang] = useState<LanguageCode>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = translations[lang];

  // Playback States
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const playbackTimerRef = useRef<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(5); // Default (Normal)

  // News State
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [activeNews, setActiveNews] = useState<NewsEvent | null>(null);
  const [showNews, setShowNews] = useState(false);

  // Check auth on mount
  useEffect(() => {
    setIsAdminLoggedIn(isAuthenticated());
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsPlaybackActive(false);
    setPlaybackIndex(0);
    setActiveNews(null);
    setShowNews(false);
    
    try {
        const [priceHistory, marketStats] = await Promise.all([
          fetchHistoricalData(range),
          fetchMarketStats()
        ]);
        
        // Pass the current language to get translated news
        const news = getNewsEvents(lang);
        setNewsEvents(news);

        if (priceHistory.length === 0) {
            throw new Error(t.errorCsv);
        }

        // Adaptive sampling for smooth chart performance
        let sampled = priceHistory;
        if (priceHistory.length > 1500) {
            const step = Math.ceil(priceHistory.length / 1500);
            sampled = priceHistory.filter((_, i) => i % step === 0);
        }
        
        setFullHistory(sampled);
        setDisplayHistory(sampled);
        setStats(marketStats);
        
    } catch (err: any) {
        setError(err.message || t.errorLoad);
    } finally {
        setIsLoading(false);
    }
  }, [range, lang, t.errorCsv, t.errorLoad]);

  useEffect(() => {
    if (viewMode === 'app') {
        loadData();
    }
  }, [loadData, viewMode]);

  // Playback Logic
  useEffect(() => {
    if (isPlaybackActive) {
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackIndex(prevIndex => {
          const nextIndex = prevIndex + playbackSpeed;
          
          if (fullHistory.length > 0) {
              const startData = fullHistory[prevIndex] || fullHistory[0];
              const endData = fullHistory[Math.min(nextIndex, fullHistory.length - 1)];
              
              if (startData && endData && (startData as any).dateString && (endData as any).dateString) {
                  const relevantNews = newsEvents.find(n => {
                      return n.date >= (startData as any).dateString && n.date <= (endData as any).dateString;
                  });

                  if (relevantNews) {
                      setActiveNews(relevantNews);
                      setShowNews(true);
                      setTimeout(() => setShowNews(false), 4000);
                  }
              }
          }

          if (nextIndex >= fullHistory.length) {
            setIsPlaybackActive(false);
            return fullHistory.length - 1;
          }
          return nextIndex;
        });
      }, 250); 
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => { if (playbackTimerRef.current) clearInterval(playbackTimerRef.current); };
  }, [isPlaybackActive, fullHistory, playbackSpeed, newsEvents]);

  useEffect(() => {
    if (isPlaybackActive || playbackIndex > 0) {
      setDisplayHistory(fullHistory.slice(0, playbackIndex + 1));
    } else {
      setDisplayHistory(fullHistory);
    }
  }, [playbackIndex, fullHistory, isPlaybackActive]);

  const togglePlayback = () => {
      if (isPlaybackActive) setIsPlaybackActive(false);
      else {
          if (playbackIndex >= fullHistory.length - 1) setPlaybackIndex(0);
          setIsPlaybackActive(true);
      }
  };
  const resetPlayback = () => {
    setIsPlaybackActive(false);
    setPlaybackIndex(0);
    setDisplayHistory(fullHistory);
    setActiveNews(null);
    setShowNews(false);
  };

  const currentPoint = (isPlaybackActive || playbackIndex > 0) && fullHistory[playbackIndex] ? fullHistory[playbackIndex] : null;
  const displayPrice = currentPoint ? currentPoint.price : stats?.currentPrice;
  const displayDate = currentPoint ? currentPoint.formattedTime : 'End of Timeline';
  const isPositive = stats ? stats.priceChangePercentage24h >= 0 : true;

  const timeOptions = [
    { label: t.time1M, value: TimeRange.MONTH },
    { label: t.time1Y, value: TimeRange.YEAR },
    { label: t.timeFull, value: TimeRange.MAX },
  ];
  const speedOptions = [
    { label: t.slow, val: 2 }, { label: t.normal, val: 5 }, { label: t.fast, val: 15 }, { label: t.turbo, val: 50 },
  ];

  if (viewMode === 'admin') {
      if (!isAdminLoggedIn) {
          return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} onBack={() => setViewMode('app')} />;
      }
      return <AdminDashboard onLogout={() => { setIsAdminLoggedIn(false); setViewMode('app'); }} />;
  }

  return (
    <div className="min-h-screen pb-20 relative bg-[#030712] text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <span className="text-white font-black">B</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isPlaybackActive && (
              <span className="hidden md:flex items-center gap-2 text-xs font-bold text-orange-400 animate-pulse bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                {t.replaying}
              </span>
            )}
            <span className="hidden lg:inline text-xs font-semibold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
              {t.csvActive}
            </span>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-medium">{languageNames[lang]}</span>
              </button>
              
              {isLangMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-20 py-1">
                    {(Object.keys(languageNames) as LanguageCode[]).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${lang === code ? 'text-orange-500 font-bold' : 'text-gray-300'}`}
                      >
                        {languageNames[code]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative">
        {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-rose-400 text-lg">⚠️</span>
                    <p className="text-rose-400 text-sm font-medium">{error}</p>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <span className="text-gray-400 font-medium uppercase tracking-tighter">
                  {isPlaybackActive || playbackIndex > 0 ? `${t.selectedDate}: ${displayDate}` : t.valueIndex}
                </span>
                <span className="text-gray-500 text-sm mono">BTC / USD</span>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-5xl font-extrabold tracking-tighter mono">
                ${displayPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
              </h2>
              <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(stats?.priceChangePercentage24h || 0).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-end md:items-end">
            <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800 self-start md:self-auto">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRange(opt.value)}
                  disabled={isPlaybackActive}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${range === opt.value ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white disabled:opacity-30'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 justify-end">
               {/* Speed Control */}
               <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800 items-center">
                  <span className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t.speed}</span>
                  {speedOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setPlaybackSpeed(opt.val)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${playbackSpeed === opt.val ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                      >
                        {opt.label}
                      </button>
                  ))}
               </div>

               <button onClick={togglePlayback} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg text-sm ${isPlaybackActive ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-orange-500 text-white shadow-orange-500/20 hover:scale-105 active:scale-95'}`}>
                 {isPlaybackActive ? ( <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> {t.pause}</>) : ( <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> {t.play}</>)}
               </button>
               
               {(isPlaybackActive || playbackIndex > 0) && (
                 <button onClick={resetPlayback} className="p-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 border border-gray-700 transition-colors" title="Reset to Dataset End">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </button>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          {activeNews && (
              <div className={`absolute top-4 left-6 z-20 max-w-sm transition-all duration-500 transform ${showNews ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
                  <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl ${activeNews.type === 'positive' ? 'bg-emerald-900/80 border-emerald-500/50' : activeNews.type === 'negative' ? 'bg-rose-900/80 border-rose-500/50' : 'bg-gray-800/80 border-gray-600/50'}`}>
                      <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{activeNews.date} • {t.breakingNews}</span>
                          {activeNews.type === 'positive' && <span className="text-emerald-400">🚀</span>}
                          {activeNews.type === 'negative' && <span className="text-rose-400">📉</span>}
                      </div>
                      <h4 className="text-white font-bold text-lg leading-tight mb-1">{activeNews.title}</h4>
                      <p className="text-white/80 text-xs leading-relaxed">{activeNews.description}</p>
                  </div>
              </div>
          )}

          <div className="lg:col-span-3 bg-gray-900/30 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-200 uppercase tracking-widest text-xs">
                  {range === TimeRange.MAX ? `2010 - 2026 ${t.valueIndex}` : t.timelineRange}
                </h3>
            </div>
            
            <PriceChart data={displayHistory} isPositive={isPositive} />

            {(isPlaybackActive || playbackIndex > 0) && (
              <div className="mt-4 px-2">
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(249,115,22,0.8)]" style={{ width: `${(playbackIndex / (fullHistory.length - 1)) * 100}%` }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-gray-500 font-bold mono">{fullHistory[0]?.formattedTime}</span>
                  <span className="text-[10px] text-orange-400 font-bold mono uppercase tracking-wider">Historical Marker {playbackIndex + 1} / {fullHistory.length}</span>
                  <span className="text-[10px] text-gray-500 font-bold mono">{fullHistory[fullHistory.length-1]?.formattedTime}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <StatsCard label={t.statHigh1y} value={`$${(stats?.high1y || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue={stats?.high1yDate || '-'} />
            <StatsCard label={t.statLow1y} value={`$${(stats?.low1y || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue={stats?.low1yDate || '-'} />
            <StatsCard label={t.statHighCap1y} value={`$${((stats?.highMarketCap1y || 0) / 1e12).toFixed(2)}T`} subValue={stats?.highMarketCap1yDate || '-'} />
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <p className="text-gray-500 text-sm">{t.footerText}</p>
            <div className="flex gap-6 items-center">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{t.downloadDataset}</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{t.methodology}</a>
                {/* Admin Entry Point */}
                <button onClick={() => setViewMode('admin')} className="text-gray-600 hover:text-orange-500 transition-colors text-xs ml-4">Admin Login</button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
