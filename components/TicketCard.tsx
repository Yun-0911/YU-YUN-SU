
import React from 'react';
import { TicketRequest } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface TicketCardProps {
  request: TicketRequest;
  onSelect?: (request: TicketRequest) => void;
  showContact?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ request, onSelect, showContact = false }) => {
  return (
    <div className={`bg-white rounded-[2rem] shadow-xl border p-6 transition-all hover:shadow-blue-200/50 hover:translate-y-[-4px] ${request.isMatched ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-blue-100 text-blue-600 border border-blue-200/50 mb-3">
            {request.date}
          </span>
          <h3 className="text-slate-900 font-black text-xl italic tracking-tight">
            {request.isMatched ? 'MATCHED!' : 'EXCHANGE OPEN'}
          </h3>
        </div>
        {request.isMatched && <ICONS.Check className="w-8 h-8 text-green-500" />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">HAVE 持有</p>
          <p className="text-slate-900 font-black text-lg">{request.haveArea}</p>
          <p className="text-slate-500 text-sm font-bold">{request.haveRow} 排</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-[10px] uppercase tracking-widest text-blue-500 font-black mb-1">WANT 想要</p>
          <p className="text-slate-900 font-black text-lg">{request.wantArea}</p>
          <p className="text-slate-500 text-sm font-bold">{request.wantRow} 排</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-50">
        <div className="flex items-center text-slate-500 text-sm font-bold">
          <ICONS.User className="w-5 h-5 mr-2 text-blue-500" />
          <span className="truncate max-w-[150px] text-slate-700">{showContact ? request.contact : '配對成功後可見'}</span>
        </div>
        {onSelect && !request.isMatched && (
          <button 
            onClick={() => onSelect(request)}
            className="text-blue-600 font-black text-sm hover:text-blue-700 transition-colors uppercase tracking-widest italic"
          >
            Details &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
