'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1420] flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[rgba(255,32,48,0.15)] border border-[rgba(255,32,48,0.3)] rounded-lg flex items-center justify-center">
              <Shield className="w-10 h-10 text-[#ff3545]" />
            </div>
            <h1 className="font-['Exo_2'] text-3xl font-black text-[#f0f4ff] mb-2">
              BLACK HAT <span className="text-[#ff3545]">ACCESS</span>
            </h1>
            <p className="font-['Rajdhani'] text-[#9db3cc] text-lg">
              This content is classified and password protected
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#16202f] border border-[rgba(0,238,255,0.18)] rounded-lg p-6">
            {error && (
              <div className="mb-4 p-3 bg-[rgba(255,32,48,0.1)] border border-[rgba(255,32,48,0.2)] rounded text-[#ff3545] font-['Rajdhani'] text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[2px] mb-2">
                // EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d1420] border border-[rgba(0,238,255,0.18)] rounded px-4 py-3 text-[#f0f4ff] font-['Rajdhani'] text-lg focus:outline-none focus:border-[#00eeff] transition-colors"
                  placeholder="Enter authorized email"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-['Share_Tech_Mono'] text-[15px] text-[#5a7090] tracking-[2px] mb-2">
                // PASSCODE
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d1420] border border-[rgba(0,238,255,0.18)] rounded px-4 py-3 pr-12 text-[#f0f4ff] font-['Rajdhani'] text-lg focus:outline-none focus:border-[#00eeff] transition-colors"
                  placeholder="Enter access code"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7090] hover:text-[#00eeff] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff3545] hover:bg-[#ff4a5a] text-white font-['Rajdhani'] font-bold text-lg py-3 rounded transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-['Share_Tech_Mono'] text-[13px] text-[#5a7090] tracking-[1px]">
              CLASSIFIED INTERNAL USE ONLY
            </p>
            <p className="font-['Share_Tech_Mono'] text-[11px] text-[#5a7090] tracking-[1px] mt-1">
              PRE-DECISIONAL — NOT FOR DISTRIBUTION
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#111927] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,238,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,32,48,0.05)] to-transparent" />
        
        <div className="relative z-10 text-center p-8">
          <div className="text-[120px] opacity-10 font-black text-[#ff3545] font-['Exo_2']">⚠</div>
          <div className="font-['Share_Tech_Mono'] text-[#ff3545] tracking-[4px] text-lg mt-4">
            RED TEAM ACTIVE
          </div>
          <div className="font-['Rajdhani'] text-[#9db3cc] text-base mt-2 max-w-xs mx-auto">
            Adversarial evaluation engine analyzing proposal vulnerabilities
          </div>
        </div>
      </div>
    </div>
  );
}
