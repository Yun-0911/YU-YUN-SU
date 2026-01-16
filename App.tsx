
import React, { useState, useEffect, useMemo } from 'react';
import { TicketRequest, ConcertDate, MatchResult } from './types.ts';
import { CONCERT_NAME, VENUE, DATES, ICONS } from './constants.tsx';
import TicketCard from './components/TicketCard.tsx';

const App: React.FC = () => {
  // Main data state
  const [requests, setRequests] = useState<TicketRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'history'>('form');
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  
  // Form State
  const [date, setDate] = useState<ConcertDate>(DATES[0]);
  const [haveArea, setHaveArea] = useState('');
  const [haveRow, setHaveRow] = useState('');
  const [wantArea, setWantArea] = useState('');
  const [wantRow, setWantRow] = useState('');
  const [contact, setContact] = useState('');

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('day6_exchange_db_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRequests(parsed);
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
  }, []);

  // 2. Persistent Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('day6_exchange_db_v2', JSON.stringify(requests));
  }, [requests]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DAY6 台北場換票中心',
          text: '快來這個平台看看有沒有人想跟你換票！',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('網址已複製到剪貼簿！');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = Math.random().toString(36).substr(2, 9);
    const newRequest: TicketRequest = {
      id: newId,
      createdAt: Date.now(),
      date,
      haveArea,
      haveRow,
      wantArea,
      wantRow,
      contact,
      isMatched: false
    };

    // Logical Matching Engine: Look through recorded data
    const matchIndex = requests.findIndex(req => 
      !req.isMatched &&
      req.date === newRequest.date &&
      req.haveArea.trim().toLowerCase() === newRequest.wantArea.trim().toLowerCase() &&
      req.haveRow.trim() === newRequest.wantRow.trim() &&
      req.wantArea.trim().toLowerCase() === newRequest.haveArea.trim().toLowerCase() &&
      req.wantRow.trim() === newRequest.haveRow.trim()
    );

    if (matchIndex !== -1) {
      const matchedReq = requests[matchIndex];
      const updatedRequests = [...requests];
      
      const finalizedNewReq = { ...newRequest, isMatched: true, matchedWithId: matchedReq.id };
      updatedRequests[matchIndex] = { ...matchedReq, isMatched: true, matchedWithId: newId };
      
      setRequests([finalizedNewReq, ...updatedRequests]);
      setLastMatch({ success: true, matchedRequest: matchedReq });
      setActiveTab('history'); // Switch to history to show the match
    } else {
      setRequests(prev => [newRequest, ...prev]);
      setLastMatch({ success: false });
      setActiveTab('list'); // Switch to list to see the post in pool
    }

    // Reset Form
    setHaveArea('');
    setHaveRow('');
    setWantArea('');
    setWantRow('');
    setContact('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRequest = (id: string) => {
    if (window.confirm('確定要刪除這筆換票記錄嗎？')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const unmatchedRequests = useMemo(() => requests.filter(req => !req.isMatched), [requests]);
  const matchedRequests = useMemo(() => requests.filter(req => req.isMatched), [requests]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header - Immersive Dark */}
      <header 
        className="relative text-white py-24 md:py-32 px-6 shadow-2xl overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.feverup.com/plan/photo/26_day6_ff6224b440fa97410714fccecdcd4d33.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950/90"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-[1.1] italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {CONCERT_NAME}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="flex items-center bg-blue-600 px-5 py-2.5 rounded-2xl border border-white/20 text-sm md:text-lg font-black shadow-xl">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {VENUE}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation - Light */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex">
          <button 
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-5 text-center font-black text-xs md:text-sm flex flex-col items-center justify-center transition-all ${activeTab === 'form' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ICONS.Exchange className="w-5 h-5 mb-1" />
            <span>我要刊登</span>
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-5 text-center font-black text-xs md:text-sm flex flex-col items-center justify-center transition-all ${activeTab === 'list' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ICONS.Search className="w-5 h-5 mb-1" />
            <span>配對大廳 ({unmatchedRequests.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-5 text-center font-black text-xs md:text-sm flex flex-col items-center justify-center transition-all ${activeTab === 'history' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ICONS.User className="w-5 h-5 mb-1" />
            <span>我的記錄 ({requests.length})</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        {/* Anti-fraud alert */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 shadow-sm">
          <div className="text-amber-500 p-1.5 bg-white rounded-xl shadow-sm border border-amber-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-amber-800 text-xs md:text-sm font-bold leading-tight">
            本站僅提供資訊記錄與媒合。換票請選擇<b>當天現場面交</b>，切勿先行匯款！
          </p>
        </div>

        {activeTab === 'form' && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Submit Entry</h2>
                <p className="text-slate-500 text-xs font-bold">填寫資料後，系統會自動在資料庫尋找對象</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">00. 選擇日期</label>
                <div className="grid grid-cols-2 gap-4">
                  {DATES.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`py-4 px-4 rounded-xl border-2 font-black text-sm transition-all ${date === d ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]' : 'border-slate-100 bg-white text-slate-300 hover:border-slate-200 hover:text-slate-400'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center text-blue-600 space-x-2">
                    <span className="text-2xl font-black italic opacity-30">01</span>
                    <h3 className="font-black text-sm uppercase">持有的票 (Have)</h3>
                  </div>
                  <div className="space-y-3">
                    <input required value={haveArea} onChange={e => setHaveArea(e.target.value)} placeholder="區域 (例: 特B)" className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold text-slate-800 shadow-inner" />
                    <input required value={haveRow} onChange={e => setHaveRow(e.target.value)} placeholder="排數 (例: 10)" className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold text-slate-800 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-indigo-600 space-x-2">
                    <span className="text-2xl font-black italic opacity-30">02</span>
                    <h3 className="font-black text-sm uppercase">想要的票 (Want)</h3>
                  </div>
                  <div className="space-y-3">
                    <input required value={wantArea} onChange={e => setWantArea(e.target.value)} placeholder="區域 (例: 特A)" className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold text-slate-800 shadow-inner" />
                    <input required value={wantRow} onChange={e => setWantRow(e.target.value)} placeholder="排數 (例: 5)" className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold text-slate-800 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-slate-800 space-x-2">
                  <span className="text-2xl font-black italic opacity-30">03</span>
                  <h3 className="font-black text-sm uppercase">聯絡資訊</h3>
                </div>
                <input required value={contact} onChange={e => setContact(e.target.value)} placeholder="IG 或 FB 帳號 (配對成功後雙方可見)" className="w-full px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-4 focus:ring-slate-200 focus:bg-white transition-all font-bold text-slate-800 shadow-inner" />
              </div>

              <button type="submit" className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0">
                刊登並開始配對
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 italic uppercase">Matching Pool</h2>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                {unmatchedRequests.length} 位等待中
              </span>
            </div>
            
            {unmatchedRequests.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {unmatchedRequests.map(req => (
                  <TicketCard key={req.id} request={req} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-16 text-center border-4 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">目前大廳沒有等待中的需求</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {lastMatch?.success && (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-[2rem] shadow-lg flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <ICONS.Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-black text-green-900 text-lg italic uppercase tracking-tight">Match Success!</h3>
                  <p className="text-green-800 text-sm font-bold">已在記錄中為您標記，請查看下方清單聯絡對方。</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 italic uppercase">Your Records</h2>
              <button 
                onClick={handleShare}
                className="text-blue-600 text-xs font-black hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                分享給朋友
              </button>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="relative group">
                    <TicketCard request={req} showContact={true} />
                    <button 
                      onClick={() => deleteRequest(req.id)}
                      className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm border border-red-100"
                      title="刪除此記錄"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-16 text-center border-4 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold mb-4">目前沒有任何記錄</p>
                <button onClick={() => setActiveTab('form')} className="text-blue-600 font-black text-sm uppercase italic">立即去刊登 &rarr;</button>
              </div>
            )}

            {requests.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('這將清除此裝置上的所有資料，確定嗎？')) setRequests([]);
                }}
                className="w-full py-4 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-colors"
              >
                Clear All Data Permanently
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-12 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-lg font-black text-slate-200 italic tracking-widest uppercase">The DECADE</span>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; 2024-2025 My Day Taipei Hub • 此為非官方應援工具
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
