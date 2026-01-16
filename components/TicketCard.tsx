
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
    <div className={`bg-white rounded-xl shadow-sm border p-5 transition-all hover:shadow-md ${request.isMatched ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-700 mb-2">
            {request.date}
          </span>
          <h3 className="text-slate-900 font-bold text-lg">
            {request.isMatched ? '已成功配對' : '尋找交換中'}
          </h3>
        </div>
        {request.isMatched && <ICONS.Check className="w-6 h-6 text-green-500" />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">持有區域</p>
          <p className="text-slate-800 font-semibold">{request.haveArea}</p>
          <p className="text-slate-600 text-sm">{request.haveRow} 排</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-1">希望區域</p>
          <p className="text-slate-800 font-semibold">{request.wantArea}</p>
          <p className="text-slate-600 text-sm">{request.wantRow} 排</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
        <div className="flex items-center text-slate-500 text-sm">
          <ICONS.User className="w-4 h-4 mr-1.5" />
          <span>{showContact ? request.contact : '配對成功後可見聯絡資訊'}</span>
        </div>
        {onSelect && !request.isMatched && (
          <button 
            onClick={() => onSelect(request)}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            查看詳情
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
