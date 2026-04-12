'use client';

import { complianceItems } from '@/data/dashboard-data';
import { X, AlertTriangle, Check, Minus } from 'lucide-react';

const statusIcons = {
  fail: <X className="w-4 h-4 text-[#ff3545]" />,
  warn: <AlertTriangle className="w-4 h-4 text-[#ffbb00]" />,
  pass: <Check className="w-4 h-4 text-[#00ff99]" />,
  na: <Minus className="w-4 h-4 text-[#5a7090]" />,
};

const iconBackgrounds = {
  fail: 'bg-[rgba(255,32,48,0.15)] border-[rgba(255,32,48,0.3)]',
  warn: 'bg-[rgba(255,170,0,0.12)] border-[rgba(255,170,0,0.3)]',
  pass: 'bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.25)]',
  na: 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]',
};

const statusText = {
  fail: 'text-[#ff3545]',
  warn: 'text-[#ffbb00]',
  pass: 'text-[#00ff99]',
  na: 'text-[#5a7090]',
};

const statusLabels = {
  fail: 'NOT CITED',
  warn: 'NAME-DROPPED',
  pass: 'ADDRESSED',
  na: 'N/A',
};

export function ComplianceMatrix() {
  return (
    <div className="bg-[#16202f] border border-[rgba(0,238,255,0.18)] rounded overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[rgba(0,238,255,0.18)] flex items-center justify-between bg-[#1c2b3f]">
        <div className="font-['Exo_2'] text-[15px] font-bold tracking-[2px] uppercase text-[#f0f4ff] flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ffbb00] shadow-[0_0_20px_rgba(255,187,0,0.4),0_0_60px_rgba(255,187,0,0.12)]" />
          COMPLIANCE MATRIX
        </div>
        <div className="font-['Share_Tech_Mono'] text-[16px] text-[#5a7090] tracking-[2px]">
          OT CYBERSECURITY STANDARDS
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {complianceItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3.5 px-3.5 py-2.5 bg-[rgba(255,255,255,0.02)] rounded-sm border border-[rgba(255,255,255,0.04)] cursor-pointer transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className={`w-7 h-7 rounded-sm flex items-center justify-center border ${iconBackgrounds[item.status]}`}>
              {statusIcons[item.status]}
            </div>
            <div className="font-['Share_Tech_Mono'] text-[16px] text-[#9db3cc] flex-1">
              {item.name}
            </div>
            <div className={`font-['Rajdhani'] text-[15px] font-semibold tracking-[1px] ${statusText[item.status]}`}>
              {statusLabels[item.status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
