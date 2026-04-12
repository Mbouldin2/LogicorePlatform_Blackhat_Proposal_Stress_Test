'use client';

import { useState } from 'react';
import { navItems, evaluatorLenses, scoringRing, miniScores } from '@/data/dashboard-data';

const badgeColors = {
  red: 'bg-[rgba(255,32,48,0.15)] text-[#ff3545] border-[rgba(255,32,48,0.3)]',
  amber: 'bg-[rgba(255,170,0,0.12)] text-[#ffbb00] border-[rgba(255,170,0,0.3)]',
  cyan: 'bg-[rgba(0,229,255,0.08)] text-[#00eeff] border-[rgba(0,229,255,0.2)]',
  green: 'bg-[rgba(0,255,136,0.08)] text-[#00ff99] border-[rgba(0,255,136,0.2)]',
};

const barColors = {
  red: 'bg-gradient-to-r from-[#660010] to-[#ff3545]',
  amber: 'bg-gradient-to-r from-[#664400] to-[#ffbb00]',
  cyan: 'bg-gradient-to-r from-[#005966] to-[#00eeff]',
  green: 'bg-gradient-to-r from-[#004422] to-[#00ff99]',
};

const textColors = {
  red: 'text-[#ff3545]',
  amber: 'text-[#ffbb00]',
  cyan: 'text-[#00eeff]',
  green: 'text-[#00ff99]',
};

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('kill-shots');

  return (
    <aside className="border-r border-[rgba(0,238,255,0.18)] py-6 flex flex-col gap-1.5">
      {/* Evaluation Panels */}
      <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[3px] px-6 mb-1 mt-4 first:mt-0">
        EVALUATION PANELS
      </div>
      
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => setActiveItem(item.id)}
          className={`px-6 py-2.5 cursor-pointer flex items-center justify-between transition-all duration-150 border-l-2 ${
            activeItem === item.id
              ? item.critical
                ? 'bg-[rgba(255,32,48,0.06)] border-l-[#ff3545]'
                : 'bg-[rgba(0,229,255,0.04)] border-l-[#00eeff]'
              : 'border-l-transparent hover:bg-[rgba(0,229,255,0.04)]'
          }`}
        >
          <span
            className={`font-['Rajdhani'] text-[15px] font-semibold tracking-[0.5px] ${
              activeItem === item.id
                ? item.critical
                  ? 'text-[#ff3545]'
                  : 'text-[#00eeff]'
                : 'text-[#9db3cc]'
            }`}
          >
            {item.label}
          </span>
          <span className={`font-['Share_Tech_Mono'] text-[15px] px-1.5 py-0.5 rounded-sm border ${badgeColors[item.badgeColor]}`}>
            {item.badge}
          </span>
        </div>
      ))}

      {/* Evaluator Lens */}
      <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[3px] px-6 mb-1 mt-4">
        EVALUATOR LENS
      </div>
      
      {evaluatorLenses.map((item) => (
        <div
          key={item.id}
          onClick={() => setActiveItem(item.id)}
          className={`px-6 py-2.5 cursor-pointer flex items-center justify-between transition-all duration-150 border-l-2 ${
            activeItem === item.id
              ? 'bg-[rgba(0,229,255,0.04)] border-l-[#00eeff]'
              : 'border-l-transparent hover:bg-[rgba(0,229,255,0.04)]'
          }`}
        >
          <span
            className={`font-['Rajdhani'] text-[15px] font-semibold tracking-[0.5px] ${
              activeItem === item.id ? 'text-[#00eeff]' : 'text-[#9db3cc]'
            }`}
          >
            {item.label}
          </span>
          <span className={`font-['Share_Tech_Mono'] text-[15px] px-1.5 py-0.5 rounded-sm border ${badgeColors[item.badgeColor]}`}>
            {item.badge}
          </span>
        </div>
      ))}

      {/* Score Ring Panel */}
      <div className="mx-5 my-4 bg-[#16202f] border border-[rgba(0,238,255,0.18)] rounded p-5">
        <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[3px] mb-4">
          // SCORING CEILING
        </div>
        
        <div className="flex items-center gap-4">
          <svg className="w-[72px] h-[72px] -rotate-90 flex-shrink-0" viewBox="0 0 40 40">
            <circle className="fill-none stroke-[rgba(255,32,48,0.1)] stroke-[6]" cx="20" cy="20" r="15" />
            <circle
              className="fill-none stroke-[#ff3545] stroke-[6] stroke-round transition-all duration-1500 ease-out"
              cx="20"
              cy="20"
              r="15"
              strokeDasharray="188"
              strokeDashoffset="79"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col gap-0.5">
            <div className="font-['Exo_2'] text-[34px] font-black text-[#ff3545] leading-none">
              {scoringRing.value}<span className="text-[16px] opacity-60">%</span>
            </div>
            <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[2px]">
              {scoringRing.label}
            </div>
            <div className="font-['Rajdhani'] text-[15px] text-[#9db3cc] font-medium">
              {scoringRing.sublabel}
            </div>
          </div>
        </div>

        {/* Mini Scores */}
        <div className="mt-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2.5">
            <span className="font-['Rajdhani'] text-[16px] text-[#9db3cc] font-semibold flex-1">Technical</span>
            <div className="flex-[2] h-1 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm ${barColors[miniScores.technical.color]}`} style={{ width: `${miniScores.technical.value}%` }} />
            </div>
            <span className={`font-['Share_Tech_Mono'] text-[15px] w-7 text-right ${textColors[miniScores.technical.color]}`}>
              {miniScores.technical.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2.5">
            <span className="font-['Rajdhani'] text-[16px] text-[#9db3cc] font-semibold flex-1">Management</span>
            <div className="flex-[2] h-1 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm ${barColors[miniScores.management.color]}`} style={{ width: `${miniScores.management.value}%` }} />
            </div>
            <span className={`font-['Share_Tech_Mono'] text-[15px] w-7 text-right ${textColors[miniScores.management.color]}`}>
              {miniScores.management.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2.5">
            <span className="font-['Rajdhani'] text-[16px] text-[#9db3cc] font-semibold flex-1">Risk</span>
            <div className="flex-[2] h-1 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm ${barColors[miniScores.risk.color]}`} style={{ width: `${miniScores.risk.value}%` }} />
            </div>
            <span className={`font-['Share_Tech_Mono'] text-[15px] w-7 text-right ${textColors[miniScores.risk.color]}`}>
              {miniScores.risk.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2.5">
            <span className="font-['Rajdhani'] text-[16px] text-[#9db3cc] font-semibold flex-1">Affordability</span>
            <div className="flex-[2] h-1 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden">
              <div className={`h-full rounded-sm ${barColors[miniScores.affordability.color]}`} style={{ width: `${miniScores.affordability.value}%` }} />
            </div>
            <span className={`font-['Share_Tech_Mono'] text-[15px] w-7 text-right ${textColors[miniScores.affordability.color]}`}>
              {miniScores.affordability.value}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
