'use client';

import { killShots } from '@/data/dashboard-data';
import { Zap } from 'lucide-react';

export function KillShots() {
  return (
    <div className="bg-gradient-to-br from-[rgba(255,32,48,0.08)] to-[rgba(255,32,48,0.02)] border border-[rgba(255,53,69,0.5)] rounded p-5 relative overflow-hidden animate-fadeIn">
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[90px] opacity-[0.04] pointer-events-none">
        ⚠
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#ff3545] to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-[rgba(255,32,48,0.12)] border border-[rgba(255,32,48,0.3)] rounded-sm flex items-center justify-center">
          <Zap className="w-4 h-4 text-[#ff3545]" />
        </div>
        <div>
          <div className="font-['Exo_2'] text-[16px] font-bold text-[#ff3545] tracking-[2px] uppercase">
            // TOP 3 KILL SHOTS — AWARD ELIMINATION RISK
          </div>
          <div className="font-['Rajdhani'] text-[15px] text-[#9db3cc]">
            Vulnerabilities most likely to result in deficiency finding or loss to competitor
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {killShots.map((shot) => (
          <div
            key={shot.id}
            className="bg-[rgba(255,32,48,0.04)] border border-[rgba(255,32,48,0.15)] rounded p-3.5 cursor-pointer transition-all duration-200 hover:bg-[rgba(255,32,48,0.08)] hover:border-[rgba(255,32,48,0.35)] hover:-translate-y-0.5"
          >
            <div className="font-['Share_Tech_Mono'] text-[15px] text-[#ff3545] tracking-[2px] mb-1.5 opacity-70">
              {shot.num}
            </div>
            <div className="font-['Rajdhani'] text-[15px] font-bold text-[#f0f4ff] mb-1.5 leading-tight">
              {shot.title}
            </div>
            <div className="font-['Rajdhani'] text-[12px] text-[#5a7090] mb-2 leading-snug">
              {shot.description}
            </div>
            <div className="font-['Share_Tech_Mono'] text-[15px] text-[#ffbb00] tracking-[1px]">
              {shot.impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
