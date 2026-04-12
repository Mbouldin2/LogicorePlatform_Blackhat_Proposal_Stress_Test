'use client';

export function Footer() {
  return (
    <footer className="px-10 py-2.5 border-t border-[rgba(0,238,255,0.18)] flex items-center justify-between bg-[#111927]">
      <div className="font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[2px]">
        // PRE-DECISIONAL — INTERNAL RED TEAM ONLY — NOT FOR DISTRIBUTION
      </div>
      <div className="flex gap-3 items-center">
        <span className="font-['Share_Tech_Mono'] text-[15px] px-2 py-0.5 rounded-sm tracking-[2px] bg-[rgba(255,32,48,0.1)] text-[#ff3545] border border-[rgba(255,32,48,0.2)]">
          BLACK HAT MODE
        </span>
        <span className="font-['Share_Tech_Mono'] text-[15px] px-2 py-0.5 rounded-sm tracking-[2px] bg-[rgba(0,229,255,0.06)] text-[#00eeff] border border-[rgba(0,229,255,0.15)]">
          DUAL LENS ACTIVE
        </span>
        <span className="font-['Share_Tech_Mono'] text-[15px] px-2 py-0.5 rounded-sm tracking-[2px] bg-[rgba(0,255,136,0.06)] text-[#00ff99] border border-[rgba(0,255,136,0.15)]">
          LOGICORE INTERNAL
        </span>
      </div>
    </footer>
  );
}
