"use client"

import { useState } from 'react'
import Image from 'next/image'
import { supabaseAuth } from '@/lib/supabaseAuth'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Building2, Mail, Lock, Loader2, Phone, ArrowLeft, X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')
  const [authMode, setAuthMode] = useState<'email' | 'phone-send' | 'phone-verify'>('email')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleRoute = (userRole: string) => {
    onClose()
    router.push(userRole === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isLogin) {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.user) {
        const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', data.user.id).single()
        handleRoute(profile?.role || 'tenant')
      }
    } else {
      const { data, error } = await supabaseAuth.auth.signUp({
        email, password,
        options: { data: { role } }
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.user) {
        await supabaseAuth.from('profiles').upsert({ id: data.user.id, role, is_verified: false })
        handleRoute(role)
      }
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
      if (!isLogin) {
        await supabaseAuth.from('profiles').upsert({ id: data.user.id, role, is_verified: false })
      }
      const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', data.user.id).single()
      handleRoute(profile?.role || role || 'tenant')
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabaseAuth.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + '/dashboard/tenant' }
    })
  }

  const switchTab = (tab: 'login' | 'signup') => {
    setIsLogin(tab === 'login')
    setAuthMode('email')
    setError('')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          {authMode !== 'email' ? (
            <button onClick={() => setAuthMode('email')} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={16} className="text-gray-800" />
            </button>
          ) : (
            <div className="w-8"></div>
          )}
          
          <div className="flex gap-6">
            <button 
              onClick={() => switchTab('login')}
              className={`text-sm font-semibold transition-colors ${isLogin && authMode === 'email' ? 'text-gray-900' : 'text-gray-400'}`}>
              Log in
            </button>
            <button 
              onClick={() => switchTab('signup')}
              className={`text-sm font-semibold transition-colors ${!isLogin && authMode === 'email' ? 'text-gray-900' : 'text-gray-400'}`}>
              Sign up
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={16} className="text-gray-800" />
          </button>
        </div>

        <div className="p-8">
          {/* Dynamic Header */}
          <div className="mb-8">
            {authMode === 'email' && (
              <h1 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome to Homra' : 'Create your account'}
              </h1>
            )}
            {authMode === 'phone-send' && (
              <h1 className="text-2xl font-bold text-gray-900">Continue with Phone</h1>
            )}
            {authMode === 'phone-verify' && (
              <h1 className="text-2xl font-bold text-gray-900">Enter Code</h1>
            )}
          </div>

          {/* Role Selector (Only for Email Signup) */}
          {!isLogin && authMode === 'email' && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 mb-3">I am a:</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole('tenant')} className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${role === 'tenant' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <User size={20} className={role === 'tenant' ? 'text-gray-900' : 'text-gray-500'} strokeWidth={1.5} />
                  <span className={`text-xs font-medium ${role === 'tenant' ? 'text-gray-900' : 'text-gray-500'}`}>Tenant</span>
                </button>
                <button type="button" onClick={() => setRole('landlord')} className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${role === 'landlord' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Building2 size={20} className={role === 'landlord' ? 'text-gray-900' : 'text-gray-500'} strokeWidth={1.5} />
                  <span className={`text-xs font-medium ${role === 'landlord' ? 'text-gray-900' : 'text-gray-500'}`}>Landlord</span>
                </button>
              </div>
            </div>
          )}

          {/* Email Auth Form */}
          {authMode === 'email' && (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-14 px-4 text-sm rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full h-14 px-4 text-sm rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? 'Log in' : 'Continue')}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-3 text-[10px] text-gray-400 font-medium uppercase">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button onClick={() => handleOAuth('google')} className="h-14 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
                <button onClick={() => handleOAuth('apple')} className="h-14 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                </button>
                <button onClick={() => setAuthMode('phone-send')} className="h-14 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Phone size={16} className="text-gray-900" strokeWidth={1.5} />
                </button>
              </div>
            </>
          )}

          {/* Phone OTP Forms */}
          {authMode === 'phone-send' && (
            <form onSubmit={handleSendOtp} className="space-y-4 mt-4">
              <p className="text-sm text-gray-500 mb-6">Enter your phone number. We'll send you a verification code.</p>
              <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full h-14 px-4 text-sm rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Code'}
              </button>
            </form>
          )}

          {authMode === 'phone-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
              <p className="text-sm text-gray-500 mb-6">We sent a code to <span className="font-semibold text-gray-900">{phone}</span>.</p>
              <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="w-full h-14 px-4 text-sm tracking-widest rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-center" />
              {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}