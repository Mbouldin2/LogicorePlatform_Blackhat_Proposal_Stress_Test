'use client';

export function VerdictBar() {
  return (
    <div className="bg-[#16202f] border border-[rgba(0,238,255,0.18)] border-l-[3px] border-l-[#ffbb00] rounded p-4 flex items-center gap-5 animate-fadeIn4">
      <div className="font-['Share_Tech_Mono'] text-[15px] text-[#ffbb00] tracking-[3px] whitespace-nowrap">
        // RED TEAM VERDICT
      </div>
      <div className="font-['Rajdhani'] text-[16px] font-semibold text-[#f0f4ff] leading-snug flex-1">
        Current proposal <strong className="text-[#ffbb00]">cannot achieve Outstanding</strong>. Primary blockers: unvalidated OT architecture claims, absent IEC 62443 compliance mapping, and life-safety bypass gap. With KS-001 and KS-002 resolved and IEC 62443 zone/conduit architecture inserted, scoring ceiling elevates to <strong className="text-[#ffbb00]">Good (75–82%)</strong>. Outstanding requires demonstrated fire system C2 past performance and validated latency-compliant Zero Trust implementation.
      </div>
      <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
        <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[2px]">
          CURRENT CEILING
        </div>
        <div className="font-['Exo_2'] text-[24px] font-black text-[#ffbb00]">
          ACCEPTABLE
        </div>
      </div>
    </div>
  );
}
