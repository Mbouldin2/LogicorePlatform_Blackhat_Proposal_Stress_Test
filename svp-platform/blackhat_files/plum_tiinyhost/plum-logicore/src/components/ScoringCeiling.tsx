'use client';

import { scoreFactors } from '@/data/dashboard-data';

const tagColors = {
  red: 'bg-[rgba(255,32,48,0.1)] text-[#ff3545] border-[rgba(255,32,48,0.2)]',
  amber: 'bg-[rgba(255,170,0,0.1)] text-[#ffbb00] border-[rgba(255,170,0,0.2)]',
  cyan: 'bg-[rgba(0,229,255,0.06)] text-[#00eeff] border-[rgba(0,229,255,0.15)]',
  green: 'bg-[rgba(0,255,136,0.06)] text-[#00ff99] border-[rgba(0,255,136,0.18)]',
  purple: 'bg-[rgba(167,139,250,0.1)] text-[#a78bfa] border-[rgba(167,139,250,0.2)]',
};

const barColors = {
  red: 'bg-gradient-to-r from-[#660010] to-[#ff3545]',
  amber: 'bg-gradient-to-r from-[#664400] to-[#ffbb00]',
  cyan: 'bg-gradient-to-r from-[#005966] to-[#00eeff]',
  green: 'bg-gradient-to-r from-[#004422] to-[#00ff99]',
  purple: 'bg-gradient-to-r from-[#3b1f7a] to-[#a78bfa]',
};

const textColors = {
  red: 'text-[#ff3545]',
  amber: 'text-[#ffbb00]',
  cyan: 'text-[#00eeff]',
  green: 'text-[#00ff99]',
  purple: 'text-[#a78bfa]',
};

export function ScoringCeiling() {
  return (
    <div className="bg-[#16202f] border border-[rgba(0,238,255,0.18)] rounded overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[rgba(0,238,255,0.18)] flex items-center justify-between bg-[#1c2b3f]">
        <div className="font-['Exo_2'] text-[15px] font-bold tracking-[2px] uppercase text-[#f0f4ff] flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00eeff] shadow-[0_0_20px_rgba(0,238,255,0.35),0_0_60px_rgba(0,238,255,0.1)]" />
          SCORING CEILING BY FACTOR
        </div>
        <div className="font-['Share_Tech_Mono'] text-[16px] text-[#5a7090] tracking-[2px]">
          MAX ACHIEVABLE // CURRENT STATE
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {scoreFactors.map((factor) => (
          <div key={factor.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <div className="font-['Rajdhani'] text-[15px] font-semibold text-[#9db3cc] flex items-center gap-2">
                {factor.name}
                <span className={`font-['Share_Tech_Mono'] text-[15px] px-1.5 py-0.5 rounded-sm tracking-[1px] border ${tagColors[factor.tagColor]}`}>
                  {factor.tag}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`font-['Share_Tech_Mono'] text-[16px] ${textColors[factor.tagColor]}`}>
                  {factor.current}%
                </span>
                <span className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090]">/ 100</span>
              </div>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-sm overflow-hidden relative">
              <div
                className={`h-full rounded-sm relative ${barColors[factor.tagColor]}`}
                style={{ width: `${factor.current}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-[30px] bg-gradient-to-r from-transparent to-[rgba(255,255,255,0.3)] rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
