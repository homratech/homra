"use client"

import { useState, useEffect } from 'react'
import { supabaseAuth } from '@/lib/supabaseAuth'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { Building2, PlusCircle, Loader2 } from 'lucide-react'

export default function LandlordDashboard() {
  const [user, setUser] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabaseAuth.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }
      setUser(user)

      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
      
      if (props) setProperties(props)
      setLoading(false)
    }
    checkUserAndFetch()
  }, [])

  if (loading) return <div className="ml-[200px] p-8 flex items-center gap-2 text-[#5F6368]"><Loader2 size={16} className="animate-spin" /> Loading dashboard...</div>

  return (
    <>
      <Sidebar />
      <div className="ml-[200px] px-6 py-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Landlord Dashboard</h1>
            <p className="text-xs text-[#5F6368] mt-1">Manage your listings and inquiries.</p>
          </div>
          <Link href="/dashboard/landlord/add-property" className="bg-[#1A73E8] text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
            <PlusCircle size={14} strokeWidth={2} /> Add New Property
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-[#E8EAED]">
            <p className="text-xs text-[#5F6368] font-medium">Active Listings</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">{properties.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E8EAED]">
            <p className="text-xs text-[#5F6368] font-medium">Total Inquiries</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">0</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E8EAED]">
            <p className="text-xs text-[#5F6368] font-medium">Funds in Escrow</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mt-1">₹0</h3>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-2xl border border-[#E8EAED] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8EAED]">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Your Properties</h2>
          </div>
          {properties.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 size={32} className="mx-auto text-[#E8EAED] mb-2" strokeWidth={1.5} />
              <p className="text-xs text-[#5F6368]">You haven't listed any properties yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8EAED]">
              {properties.map((prop) => (
                <div key={prop.id} className="p-4 flex justify-between items-center hover:bg-[#F5F5F7] transition-colors">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{prop.title}</h3>
                    <p className="text-xs text-[#5F6368] mt-0.5">{prop.general_location} · ₹{prop.rent_amount.toLocaleString('en-IN')} / month</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${prop.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {prop.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}