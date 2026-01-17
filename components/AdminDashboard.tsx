
import React, { useState, useEffect, useRef } from 'react';
import { changePassword, setSession } from '../services/authService';
import { getNewsEvents, updateNewsData, uploadCustomData, fetchHistoricalData } from '../services/cryptoService';
import { LanguageCode, languageNames } from '../services/translations';
import { NewsEvent } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'prices' | 'settings'>('news');

  const handleLogout = () => {
    setSession(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-orange-500">CryptoPulse Admin</h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
      </nav>
      
      <div className="flex max-w-7xl mx-auto mt-8 px-4 gap-8">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-gray-900 rounded-xl p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('news')} 
              className={`w-full text-left px-4 py-2 rounded-lg font-medium ${activeTab === 'news' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              News Manager
            </button>
            <button 
              onClick={() => setActiveTab('prices')} 
              className={`w-full text-left px-4 py-2 rounded-lg font-medium ${activeTab === 'prices' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Price Data
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`w-full text-left px-4 py-2 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Settings
            </button>
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'prices' && <PriceManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>
    </div>
  );
};

// Sub-components for cleaner file structure

const NewsManager: React.FC = () => {
    const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
    const [news, setNews] = useState<NewsEvent[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<NewsEvent>({ date: '', title: '', description: '', type: 'neutral' });
    const [editIndex, setEditIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadNews = async () => {
            setIsLoading(true);
            try {
                const newsData = await getNewsEvents(selectedLang);
                setNews(newsData);
            } catch (err) {
                setErrorMsg('Failed to load news events');
            } finally {
                setIsLoading(false);
            }
        };
        loadNews();
    }, [selectedLang]);

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const updated = [...news];
            if (editIndex >= 0) {
                updated[editIndex] = currentEvent;
            } else {
                updated.push(currentEvent);
            }
            updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            await updateNewsData(selectedLang, updated);
            setNews(updated);
            setIsEditing(false);
            setEditIndex(-1);
        } catch (err) {
            setErrorMsg('Failed to save news event');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (index: number) => {
        if(!confirm("Are you sure?")) return;
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const updated = news.filter((_, i) => i !== index);
            await updateNewsData(selectedLang, updated);
            setNews(updated);
        } catch (err) {
            setErrorMsg('Failed to delete news event');
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (event: NewsEvent, index: number) => {
        setCurrentEvent(event);
        setEditIndex(index);
        setIsEditing(true);
    };

    const openAdd = () => {
        setCurrentEvent({ date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'neutral' });
        setEditIndex(-1);
        setIsEditing(true);
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage News</h2>
                {errorMsg && <p className="text-rose-400 text-sm">{errorMsg}</p>}
            </div>
                <div className="flex gap-4">
                    <select 
                        value={selectedLang} 
                        onChange={e => setSelectedLang(e.target.value as LanguageCode)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white"
                    >
                        {Object.entries(languageNames).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                    <button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-1 rounded-lg text-sm font-bold">Add Event</button>
                </div>
            </div>

            {isEditing && (
                <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="font-bold mb-4">{editIndex >= 0 ? 'Edit Event' : 'New Event'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="date" value={currentEvent.date} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} className="bg-gray-700 rounded px-3 py-2" />
                        <select value={currentEvent.type} onChange={e => setCurrentEvent({...currentEvent, type: e.target.value as any})} className="bg-gray-700 rounded px-3 py-2">
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                        </select>
                        <input type="text" placeholder="Title" value={currentEvent.title} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} className="bg-gray-700 rounded px-3 py-2 md:col-span-2" />
                        <textarea placeholder="Description" value={currentEvent.description} onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})} className="bg-gray-700 rounded px-3 py-2 md:col-span-2 h-20" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-orange-600 px-4 py-1 rounded">Save</button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-1 rounded">Cancel</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {news.map((n, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                        <div>
                            <span className="text-xs text-gray-500 font-mono">{n.date}</span>
                            <span className={`ml-2 text-xs font-bold uppercase ${n.type === 'positive' ? 'text-emerald-400' : n.type === 'negative' ? 'text-rose-400' : 'text-gray-400'}`}>{n.type}</span>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openEdit(n, i)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                            <button onClick={() => handleDelete(i)} className="text-rose-400 hover:text-rose-300 text-xs">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PriceManager: React.FC = () => {
    const [stats, setStats] = useState<any>({ count: 0, first: '', last: '' });
    const [csv, setCsv] = useState('');
    const [msg, setMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadStats = async () => {
        try {
            const data = await fetchHistoricalData('max');
            if(data.length > 0) {
                setStats({
                    count: data.length,
                    first: data[0].dateString,
                    last: data[data.length-1].dateString
                });
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleUpload = async () => {
        setIsLoading(true);
        setMsg('');
        try {
            await uploadCustomData(csv);
            await loadStats();
            setMsg("Success! Data updated.");
            setCsv('');
        } catch(e: any) {
            setMsg("Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                setCsv(text);
                setMsg("File loaded into text area. Click 'Process & Upload' to save.");
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
             <h2 className="text-xl font-bold mb-4">Price Data Manager</h2>
             <div className="bg-gray-800 p-4 rounded-lg mb-6 flex gap-8">
                 <div>
                     <p className="text-gray-400 text-xs uppercase">Records</p>
                     <p className="font-mono text-xl">{stats.count}</p>
                 </div>
                 <div>
                     <p className="text-gray-400 text-xs uppercase">Range Start</p>
                     <p className="font-mono text-xl">{stats.first || 'N/A'}</p>
                 </div>
                 <div>
                     <p className="text-gray-400 text-xs uppercase">Range End</p>
                     <p className="font-mono text-xl">{stats.last || 'N/A'}</p>
                 </div>
             </div>
             
             <div className="space-y-4">
                 <div>
                    <label className="text-sm font-bold text-gray-300 block mb-2">Update Dataset (CSV Paste or Upload)</label>
                    <textarea 
                        value={csv} 
                        onChange={e => setCsv(e.target.value)} 
                        placeholder="Start,End,Open,High,Low,Close,Volume,Market Cap..." 
                        className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-orange-500 mb-2"
                    />
                    <div className="flex gap-3">
                        <button onClick={handleUpload} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Processing...' : 'Process & Upload'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-bold transition-colors">Load from File</button>
                    </div>
                 </div>
                 {msg && <p className={`text-sm ${msg.includes('Success') ? 'text-green-400' : 'text-yellow-400'}`}>{msg}</p>}
             </div>
        </div>
    );
};

const SettingsManager: React.FC = () => {
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [msg, setMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = async () => {
        if(p1 !== p2) {
            setMsg("Passwords do not match");
            return;
        }
        if(p1.length < 6) {
             setMsg("Password too short");
             return;
        }
        setIsLoading(true);
        try {
            const success = await changePassword(p1);
            if(success) {
                setMsg("Password updated successfully.");
                setP1('');
                setP2('');
            } else {
                setMsg("Failed to update password.");
            }
        } catch (err) {
            setMsg("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
             <h2 className="text-xl font-bold mb-4">Admin Security</h2>
             <div className="max-w-md space-y-4">
                 <div>
                     <label className="block text-sm text-gray-400 mb-1">New Password</label>
                     <input type="password" value={p1} onChange={e => setP1(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2" />
                 </div>
                 <div>
                     <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                     <input type="password" value={p2} onChange={e => setP2(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2" />
                 </div>
                  <button onClick={handleChange} disabled={isLoading} className="bg-orange-600 px-4 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                 {msg && <p className="text-sm text-yellow-400">{msg}</p>}
             </div>
        </div>
    );
};

export default AdminDashboard;
