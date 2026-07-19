"use client"

import { useState } from 'react'
import Image from 'next/image'
import { supabaseAuth } from '@/lib/supabaseAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Loader2, Phone, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'email' | 'phone-send' | 'phone-verify'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRoute = (role: string) => {
    if (role === 'landlord') router.push('/dashboard/landlord')
    else router.push('/dashboard/tenant')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', data.user.id).single()
      handleRoute(profile?.role || 'tenant')
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabaseAuth.auth.signInWithOtp({ phone })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setAuthMode('phone-verify')
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabaseAuth.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', data.user.id).single()
      handleRoute(profile?.role || 'tenant')
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabaseAuth.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + '/dashboard/tenant' }
    })
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#F5F5F7]">
      {/* Left Branding Panel - Dark Gradient */}
      <div className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1500&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/90"></div>
        
        <div className="relative z-10">
          <Image src="/homra-logo.jpg" width={100} height={30} alt="Homra Logo" className="rounded-md" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3 leading-tight">Find. Book.<br/>Live Better.</h2>
          <p className="text-sm text-gray-400 max-w-sm">The global PropTech platform for verified rentals and zero broker fees.</p>
        </div>
        
        <div className="relative z-10 flex gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#1A73E8]" /> Verified Listings</span>
          <span className="flex items-center gap-1.5"><Lock size={14} className="text-[#1A73E8]" /> Escrow Protected</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E8EAED]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="md:hidden flex justify-center mb-6">
            <Image src="/homra-logo.jpg" width={80} height={24} alt="Homra Logo" className="rounded-md" />
          </div>
          
          {authMode === 'email' && (
            <>
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-1">Welcome back</h1>
              <p className="text-xs text-[#5F6368] mb-6">Log in to manage your listings or find your next home.</p>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all" />
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="w-full h-11 bg-[#1A73E8] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Log in'}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[#E8EAED]"></div>
                <span className="px-3 text-[10px] text-[#5F6368] font-medium uppercase">or continue with</span>
                <div className="flex-grow border-t border-[#E8EAED]"></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => handleOAuth('google')} className="h-11 border border-[#E8EAED] rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
                <button onClick={() => handleOAuth('apple')} className="h-11 border border-[#E8EAED] rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] transition-colors">
                  <svg className="w-4 h-4 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                </button>
                <button onClick={() => setAuthMode('phone-send')} className="h-11 border border-[#E8EAED] rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] transition-colors">
                  <Phone size={16} className="text-[#1A1A1A]" strokeWidth={1.5} />
                </button>
              </div>
            </>
          )}

          {authMode === 'phone-send' && (
            <>
              <button onClick={() => setAuthMode('email')} className="flex items-center gap-1 text-xs text-[#5F6368] hover:text-[#1A1A1A] mb-4"><ArrowLeft size={12} /> Back to email login</button>
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-1">Continue with Phone</h1>
              <p className="text-xs text-[#5F6368] mb-6">Enter your phone number. We'll send you a login code.</p>
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
                  <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all" />
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="w-full h-11 bg-[#1A73E8] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Login Code'}
                </button>
              </form>
            </>
          )}

          {authMode === 'phone-verify' && (
            <>
              <button onClick={() => setAuthMode('phone-send')} className="flex items-center gap-1 text-xs text-[#5F6368] hover:text-[#1A1A1A] mb-4"><ArrowLeft size={12} /> Change number</button>
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-1">Enter Code</h1>
              <p className="text-xs text-[#5F6368] mb-6">We sent a code to <span className="font-semibold text-[#1A1A1A]">{phone}</span>.</p>
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="w-full h-11 px-3 text-sm tracking-widest rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all" />
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="w-full h-11 bg-[#1A73E8] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Log in'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#5F6368]">
            <ShieldCheck size={12} className="text-[#1A73E8]" strokeWidth={1.5} />
            Protected by Homra Escrow & AI Verification
          </div>

          <p className="text-center text-xs text-[#5F6368] mt-6">
            New to Homra?{' '}
            <Link href="/auth/signup" className="text-[#1A73E8] font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}