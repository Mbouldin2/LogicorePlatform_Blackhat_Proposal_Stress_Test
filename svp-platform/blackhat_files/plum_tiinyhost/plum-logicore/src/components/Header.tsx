'use client';

import { useEffect, useState } from 'react';

export function Header() {
  const [timestamp, setTimestamp] = useState('INITIALIZING...');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '.');
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      setTimestamp(`${date} // ${time} EST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-10 py-7 pb-5 border-b border-[rgba(0,238,255,0.18)] relative">
      <div className="absolute bottom-[-1px] left-10 w-70 h-px bg-gradient-to-r from-[#ff3545] to-transparent" />
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-['Share_Tech_Mono'] text-[15px] text-[#ff3545] tracking-[4px] uppercase flex items-center gap-2">
            <span className="opacity-50">//</span>
            CLASSIFIED INTERNAL USE ONLY — PRE-DECISIONAL
          </div>
          <h1 className="font-['Exo_2'] text-[32px] font-black tracking-[-0.5px] text-[#f0f4ff] leading-none">
            <span className="text-[#ff3545]">BLACK HAT</span> PROPOSAL STRESS TEST
          </h1>
          <div className="font-['Share_Tech_Mono'] text-[16px] text-[#9db3cc] tracking-[2px] mt-1">
            FIRE SYSTEM C2 // CYBERSECURITY POSTURE // ADVERSARIAL EVALUATION ENGINE v2.4
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 font-['Share_Tech_Mono'] text-[16px] text-[#ff3545] tracking-[2px]">
            <div className="w-2 h-2 rounded-full bg-[#ff3545] animate-pulse shadow-[0_0_20px_rgba(255,53,69,0.4),0_0_60px_rgba(255,53,69,0.12)]" />
            RED TEAM ACTIVE
          </div>
          <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[1px]">
            {timestamp}
          </div>
        </div>
      </div>
    </header>
  );
}
