'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { KillShots } from '@/components/KillShots';
import { VulnerabilityTable } from '@/components/VulnerabilityTable';
import { ComplianceMatrix } from '@/components/ComplianceMatrix';
import { ScoringCeiling } from '@/components/ScoringCeiling';
import { VerdictBar } from '@/components/VerdictBar';
import { Footer } from '@/components/Footer';

export default function DashboardPage() {
  const { user, loading, isDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isDemo) {
      router.push('/login');
    }
  }, [user, loading, isDemo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1420] flex items-center justify-center">
        <div className="font-['Share_Tech_Mono'] text-[#00eeff] text-lg tracking-[2px]">
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (!user && !isDemo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 grid grid-cols-[280px_1fr]">
        <Sidebar />
        
        <main className="p-7 flex flex-col gap-5">
          {isDemo && (
            <div className="bg-[rgba(255,187,0,0.1)] border border-[rgba(255,187,0,0.3)] rounded p-3 text-center">
              <span className="font-['Share_Tech_Mono'] text-[#ffbb00] text-sm tracking-[2px]">
                ⚠ DEMO MODE — Firebase not configured. Add env vars for production auth.
              </span>
            </div>
          )}
          <KillShots />
          <VulnerabilityTable />
          
          <div className="grid grid-cols-2 gap-5">
            <ComplianceMatrix />
            <ScoringCeiling />
          </div>
          
          <VerdictBar />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
