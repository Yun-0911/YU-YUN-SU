
import React, { useState, useEffect, useMemo } from 'react';
import { TicketRequest, ConcertDate, MatchResult } from './types.ts';
import { CONCERT_NAME, VENUE, DATES, ICONS } from './constants.tsx';
import TicketCard from './components/TicketCard.tsx';

const App: React.FC = () => {
  const [requests, setRequests] = useState<TicketRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  
  // Form State
  const [date, setDate] = useState<ConcertDate>(DATES[0]);
  const [haveArea, setHaveArea] = useState('');
  const [haveRow, setHaveRow] = useState('');
  const [wantArea, setWantArea] = useState('');
  const [wantRow, setWantRow] = useState('');
  const [contact, setContact] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('day6_exchange_requests');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save data whenever requests change
  useEffect(() => {
    localStorage.setItem('day6_exchange_requests', JSON.stringify(requests));
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
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('網址已複製到剪貼簿，快分享給朋友吧！');
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

    // Logical Matching Engine
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setRequests(prev => [newRequest, ...prev]);
      setLastMatch({ success: false });
    }

    setHaveArea('');
    setHaveRow('');
    setWantArea('');
    setWantRow('');
    setContact('');
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => !req.isMatched);
  }, [requests]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header - Immersive Deep Dark Background for the text section */}
      <header 
        className="relative text-white py-24 md:py-36 px-6 shadow-2xl overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.feverup.com/plan/photo/26_day6_ff6224b440fa97410714fccecdcd4d33.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      >
        {/* Darkened overlay to match the deep blue/grey theme in the screenshot */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950/90"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <h1 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter leading-[1.1] italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-white">
            {CONCERT_NAME}
          </h1>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            <span className="flex items-center bg-blue-600 px-6 py-3 rounded-2xl border border-white/20 text-sm md:text-xl font-black shadow-2xl transition-all hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {VENUE}
            </span>
            <button 
              onClick={handleShare}
              className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-sm md:text-xl font-bold transition-all active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享給 My Day
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Light Theme */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex">
          <button 
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-6 text-center font-black text-sm md:text-base flex items-center justify-center space-x-2 transition-all ${activeTab === 'form' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ICONS.Exchange className="w-5 h-5" />
            <span>我要換票</span>
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-6 text-center font-black text-sm md:text-base flex items-center justify-center space-x-2 transition-all ${activeTab === 'list' ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ICONS.Search className="w-5 h-5" />
            <span>未配對區 ({filteredRequests.length})</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-10">
        {/* Anti-fraud alert - Light Theme */}
        <div className="mb-10 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start space-x-4 shadow-sm">
          <div className="text-amber-500 p-2 bg-white rounded-2xl shadow-sm border border-amber-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-black text-amber-900 text-sm md:text-base">防詐騙安全提醒</h4>
            <p className="text-amber-800 text-xs md:text-sm leading-relaxed mt-1">
              本站僅提供媒合功能。換票時請務必選擇<b>當天現場面交</b>。切勿先行匯款，並請小心查證對方身分。
            </p>
          </div>
        </div>

        {lastMatch && (
          <div className={`mb-10 p-8 rounded-3xl border-2 shadow-xl animate-in fade-in zoom-in duration-500 ${lastMatch.success ? 'bg-green-50 border-green-200 text-green-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
            <div className="flex items-start">
              <div className={`p-4 rounded-2xl mr-5 shadow-inner ${lastMatch.success ? 'bg-green-100' : 'bg-blue-100'}`}>
                {lastMatch.success ? <ICONS.Check className="w-8 h-8" /> : <ICONS.Search className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-3 italic">
                  {lastMatch.success ? 'FOUND A MATCH! 恭喜！' : '需求已排隊登錄'}
                </h2>
                <p className="mb-6 text-sm md:text-lg leading-relaxed font-medium">
                  {lastMatch.success 
                    ? `我們找到一位 My Day 有你想交換的票！立即查看下方聯絡資訊或進入列表與對方聯繫：${lastMatch.matchedRequest?.contact}`
                    : '目前還沒有完全符合的人選。別擔心，我們已經將您的需求發布在列表中。您可以先分享這個網址，讓更多 My Day 加入配對！'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setLastMatch(null)}
                    className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${lastMatch.success ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    關閉視窗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-20">
            <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Submit Request</h2>
                <p className="text-slate-500 font-bold mt-1">填寫您的票券資訊，系統將即時比對</p>
              </div>
              <div className="hidden sm:block">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+100}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="MyDay" />
                  ))}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest italic">Choose Date</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DATES.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`py-5 px-6 rounded-2xl border-2 font-black text-lg transition-all ${date === d ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xl ring-4 ring-blue-100 scale-[1.02]' : 'border-slate-100 bg-white text-slate-300 hover:border-slate-200 hover:text-slate-400'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center text-blue-600 space-x-4">
                  <span className="text-4xl font-black italic opacity-20">01</span>
                  <h3 className="font-black text-2xl tracking-tight uppercase">您持有的票券 (Have)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">區域 (Area)</label>
                    <input required value={haveArea} onChange={e => setHaveArea(e.target.value)} placeholder="例: 特B" className="w-full px-6 py-5 rounded-3xl bg-slate-100 border-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-black text-slate-900 shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">排數 (Row)</label>
                    <input required value={haveRow} onChange={e => setHaveRow(e.target.value)} placeholder="例: 15" className="w-full px-6 py-5 rounded-3xl bg-slate-100 border-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-black text-slate-900 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center text-indigo-600 space-x-4">
                  <span className="text-4xl font-black italic opacity-20">02</span>
                  <h3 className="font-black text-2xl tracking-tight uppercase">欲交換的目標 (Want)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">區域 (Area)</label>
                    <input required value={wantArea} onChange={e => setWantArea(e.target.value)} placeholder="例: 特A" className="w-full px-6 py-5 rounded-3xl bg-slate-100 border-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-black text-slate-900 shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">排數 (Row)</label>
                    <input required value={wantRow} onChange={e => setWantRow(e.target.value)} placeholder="例: 1" className="w-full px-6 py-5 rounded-3xl bg-slate-100 border-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-black text-slate-900 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center text-slate-800 space-x-4">
                  <span className="text-4xl font-black italic opacity-20">03</span>
                  <h3 className="font-black text-2xl tracking-tight uppercase">聯絡方式 (IG / FB)</h3>
                </div>
                <div className="space-y-4">
                  <input required value={contact} onChange={e => setContact(e.target.value)} placeholder="請輸入 IG 或 FB 帳號，以便配對後聯繫" className="w-full px-6 py-5 rounded-3xl bg-slate-100 border-none focus:ring-4 focus:ring-slate-200 focus:bg-white transition-all font-black text-slate-900 shadow-inner" />
                  <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input type="checkbox" required id="agree" className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 mr-3" />
                    <label htmlFor="agree" className="text-xs md:text-sm text-slate-500 font-bold">我已了解「本平台僅供資訊媒合，交易風險需自行承擔」並同意公開聯絡資訊。</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black text-2xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-inner">
                立即加入配對佇列
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Waiting List</h2>
                <p className="text-slate-400 font-black mt-1">目前線上有 {filteredRequests.length} 位 My Day 正在等候換票</p>
              </div>
              <div className="flex bg-slate-50 p-2 rounded-[1.5rem] self-start md:self-center border border-slate-100">
                <div className="px-6 py-3 text-sm font-black rounded-2xl bg-white shadow-sm text-blue-600">
                  全日期展示中
                </div>
              </div>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredRequests.map(req => (
                  <div key={req.id} className="transition-all hover:scale-[1.02]">
                    <TicketCard request={req} showContact={true} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-200 p-24 text-center">
                <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                  <ICONS.Search className="w-14 h-14 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-black text-3xl mb-3 italic uppercase">Empty Stage!</h3>
                <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed text-lg">
                  目前還沒有等待配對的需求。快來當第一個發起交換的人吧！
                </p>
                <button onClick={() => setActiveTab('form')} className="mt-10 px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95">
                  GO SUBMIT &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 px-6 mt-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center items-center space-x-6">
            <div className="h-px w-12 bg-slate-200"></div>
            <span className="text-2xl font-black text-slate-300 italic tracking-widest uppercase">The DECADE</span>
            <div className="h-px w-12 bg-slate-200"></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            &copy; 2024-2025 My Day Taipei Hub • Not affiliated with JYP or Live Nation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
