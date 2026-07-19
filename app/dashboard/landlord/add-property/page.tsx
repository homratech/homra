"use client"

import { useState } from 'react'
import { supabaseAuth } from '@/lib/supabaseAuth'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, ShieldCheck } from 'lucide-react'

export default function AddPropertyPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rent, setRent] = useState('')
  const [exactAddress, setExactAddress] = useState('')
  const [generalLocation, setGeneralLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        title,
        description,
        rent_amount: Number(rent),
        exact_address: exactAddress,
        general_location: generalLocation,
        is_active: true,
        categories: ['Furnished'] // Default tag for now
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/landlord')
    }
  }

  return (
    <>
      <Sidebar />
      <div className="ml-[200px] px-6 py-4 animate-fade-in-up">
        <Link href="/dashboard/landlord" className="flex items-center gap-2 text-[#5F6368] hover:text-[#1A1A1A] mb-4 text-sm font-medium">
          <ChevronLeft size={16} /> Back to dashboard
        </Link>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">List a New Property</h1>
          <p className="text-xs text-[#5F6368] mb-6">Fill out the details below. Your exact address is hidden from tenants until they unlock Homra Connect.</p>

          <form onSubmit={handleAddProperty} className="space-y-4 bg-white p-6 rounded-2xl border border-[#E8EAED]">
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Property Title</label>
              <input
                type="text"
                placeholder="e.g. Modern 2BHK near Bandra Station"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Description</label>
              <textarea
                placeholder="Describe the property, amenities, and rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full p-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Monthly Rent (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">General Location (Public)</label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Mumbai"
                  value={generalLocation}
                  onChange={(e) => setGeneralLocation(e.target.value)}
                  required
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Exact Address (Hidden until unlock)</label>
              <input
                type="text"
                placeholder="e.g. 12 Carter Road, Bandra West, Mumbai 400050"
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs rounded-xl border border-[#E8EAED] focus:border-[#1A73E8] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] transition-all"
              />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1A73E8] text-white px-6 h-10 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Publish Listing'}
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-[#5F6368] ml-auto">
                <ShieldCheck size={12} className="text-[#1A73E8]" strokeWidth={1.5} />
                Protected by Homra Anti-Bypass AI
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}