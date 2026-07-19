"use client"

import { useState } from 'react'
import { supabaseAuth } from '@/lib/supabaseAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Check role from profiles to redirect correctly
      const { data: profile } = await supabaseAuth
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'landlord') {
        router.push('/dashboard/landlord')
      } else {
        router.push('/dashboard/tenant')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-[#E8EAED]">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A73E8]">Homra</h1>
          <p className="text-xs text-[#5F6368] mt-1">Welcome back</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#1A73E8] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Log in'}
          </button>
        </form>

        {/* Trust Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#5F6368]">
          <ShieldCheck size={12} className="text-[#1A73E8]" strokeWidth={1.5} />
          Protected by Homra Escrow & AI Verification
        </div>

        {/* Signup Link */}
        <p className="text-center text-xs text-[#5F6368] mt-4">
          New to Homra?{' '}
          <Link href="/auth/signup" className="text-[#1A73E8] font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}