"use client"

import { useState } from 'react'
import Image from 'next/image'
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

    const { data, error } = await supabaseAuth.auth.signUp({
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
      await supabaseAuth.from('profiles').insert({
        id: data.user.id,
        role: role,
        is_verified: false,
      })
      
      router.push(role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#F5F5F7]">
      {/* Left Branding Panel */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-[#1A1A1A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1500&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]/60"></div>
        
        <div className="relative z-10">
          <Image src="/homra-logo.jpg" width={100} height={30} alt="Homra Logo" className="rounded-md" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3 leading-tight">Find. Book.<br/>Live Better.</h2>
          <p className="text-sm text-gray-300 max-w-sm">The global PropTech platform for verified rentals and zero broker fees.</p>
        </div>
        
        <div className="relative z-10 flex gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#1A73E8]" /> Verified Listings</span>
          <span className="flex items-center gap-1.5"><Lock size={14} className="text-[#1A73E8]" /> Escrow Protected</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E8EAED]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Image src="/homra-logo.jpg" width={80} height={24} alt="Homra Logo" className="rounded-md" />
          </div>
          
          <h1 className="text-xl font-bold text-[#1A1A1A] mb-1">Create your account</h1>
          <p className="text-xs text-[#5F6368] mb-6">Join Homra to rent, list, or buy properties securely.</p>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#1A1A1A] mb-2">I am a:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${role === 'tenant' ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-[#E8EAED] hover:border-gray-300'}`}
              >
                <User size={20} className={role === 'tenant' ? 'text-[#1A73E8]' : 'text-[#5F6368]'} strokeWidth={1.5} />
                <span className={`text-xs font-medium ${role === 'tenant' ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}>Tenant / Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${role === 'landlord' ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-[#E8EAED] hover:border-gray-300'}`}
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
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]" strokeWidth={1.5} />
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1A73E8] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#5F6368]">
            <ShieldCheck size={12} className="text-[#1A73E8]" strokeWidth={1.5} />
            Protected by Homra Escrow & AI Verification
          </div>

          <p className="text-center text-xs text-[#5F6368] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1A73E8] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}