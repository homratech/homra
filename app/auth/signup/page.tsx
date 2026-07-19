"use client"

import { useState } from 'react'
import { supabaseAuth } from '@/lib/supabaseAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Building2, Mail, Lock, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabaseAuth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Insert into profiles table
      await supabaseAuth.from('profiles').insert({
        id: data.user.id,
        role: role,
        is_verified: false,
      })
      
      // Redirect to appropriate dashboard
      router.push(role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-[#E8EAED]">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A73E8]">Homra</h1>
          <p className="text-xs text-[#5F6368] mt-1">Find. Book. Live Better.</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#1A1A1A] mb-2">I am a:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRole('tenant')}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${role === 'tenant' ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-[#E8EAED] hover:border-gray-300'}`}
            >
              <User size={20} className={role === 'tenant' ? 'text-[#1A73E8]' : 'text-[#5F6368]'} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${role === 'tenant' ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}>Tenant / Buyer</span>
            </button>
            <button
              onClick={() => setRole('landlord')}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${role === 'landlord' ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-[#E8EAED] hover:border-gray-300'}`}
            >
              <Building2 size={20} className={role === 'landlord' ? 'text-[#1A73E8]' : 'text-[#5F6368]'} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${role === 'landlord' ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}>Landlord / Owner</span>
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-3">
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
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Create account'}
          </button>
        </form>

        {/* Trust Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#5F6368]">
          <ShieldCheck size={12} className="text-[#1A73E8]" strokeWidth={1.5} />
          Protected by Homra Escrow & AI Verification
        </div>

        {/* Login Link */}
        <p className="text-center text-xs text-[#5F6368] mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#1A73E8] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}