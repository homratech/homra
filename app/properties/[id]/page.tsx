import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { ChevronLeft, Star, ShieldCheck, Lock, MessageSquare, FileCheck, Bot, ChevronRight } from 'lucide-react'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!property) {
    return (
      <div className="ml-[200px] p-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Property not found</h1>
        <Link href="/" className="text-[#1A73E8] mt-4 inline-block">Go back home</Link>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <div className="p-8">
        {/* Back Link & Header */}
        <Link href="/" className="flex items-center gap-2 text-[#5F6368] hover:text-[#1A1A1A] mb-4 text-sm font-medium">
          <ChevronLeft size={16} /> Back to all homes
        </Link>
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">{property.title}</h1>
            <p className="text-[#5F6368] mt-1 flex items-center gap-2">
              {property.general_location} · <span className="flex items-center gap-1"><Star size={14} className="fill-[#1A1A1A] text-[#1A1A1A]" /> 4.92</span>
            </p>
          </div>
          <span className="bg-[#E8F0FE] text-[#1A73E8] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck size={14} strokeWidth={2} /> Homra Verified
          </span>
        </div>

        {/* Image Gallery Layout */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden h-[440px] mb-12">
          <div className="col-span-2 row-span-2 relative h-full">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop" alt="Main" className="w-full h-full object-cover rounded-l-3xl" />
          </div>
          <div className="col-span-2 h-full">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop" alt="Interior 1" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-1 h-full">
            <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400&auto=format&fit=crop" alt="Interior 2" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-1 h-full relative">
            <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=400&auto=format&fit=crop" alt="Interior 3" className="w-full h-full object-cover rounded-tr-3xl" />
            <button className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm hover:bg-black/50 transition-colors">
              Show all photos
            </button>
          </div>
        </div>

        {/* Main Content & Sticky Paywall */}
        <div className="grid grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="col-span-2">
            <div className="pb-8 mb-8 border-b border-[#E8EAED]">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Entire home hosted by Mock Landlord</h2>
              {/* Updated rental specs */}
              <p className="text-[#5F6368]">2 BHK · Furnished · 2 Baths · 1100 sq ft</p>
            </div>

            <div className="pb-8 mb-8 border-b border-[#E8EAED] space-y-4">
              <div className="flex items-start gap-4">
                <ShieldCheck size={24} className="text-[#1A73E8] mt-1" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Homra Verified Title & ID</h3>
                  <p className="text-[#5F6368] text-sm mt-1">Landlord identity and property ownership confirmed via government registry API. 100% scam-free.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Lock size={24} className="text-[#1A73E8] mt-1" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Homra Protect Escrow</h3>
                  <p className="text-[#5F6368] text-sm mt-1">Your deposit and first month's rent are held in a secure escrow account. Funds are only released to the landlord 24 hours after you move in and confirm the property is as described.</p>
                </div>
              </div>
            </div>

            <div className="pb-8 mb-8 border-b border-[#E8EAED]">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Property Description</h2>
              <p className="text-[#1A1A1A] leading-relaxed">{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Location</h2>
              <p className="text-[#5F6368] text-sm mb-4">The exact location is hidden for your safety until you unlock Homra Connect.</p>
              {/* Masked Map Area */}
              <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden border border-[#E8EAED]">
                <div className="absolute inset-0 backdrop-blur-md bg-gray-100/50"></div>
                <div className="z-10 text-center bg-white p-6 rounded-2xl shadow-md border border-[#E8EAED]">
                  <Lock size={24} className="text-[#1A73E8] mx-auto mb-2" strokeWidth={1.5} />
                  <h4 className="font-semibold text-[#1A1A1A]">Exact Map Locked</h4>
                  <p className="text-sm text-[#5F6368] mt-1">Showing general area: {property.general_location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Paywall Card */}
          <div className="col-span-1">
            <div className="sticky top-8 bg-white p-6 rounded-2xl border border-[#E8EAED]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  {/* Updated 'night' to '/ month' */}
                  <span className="text-2xl font-bold text-[#1A1A1A]">₹{property.rent_amount.toLocaleString('en-IN')}</span>
                  <span className="text-[#5F6368]"> / month</span>
                </div>
                <span className="text-sm text-[#1A1A1A] font-medium flex items-center gap-1">
                  <Star size={14} className="fill-[#1A1A1A] text-[#1A1A1A]" /> 4.92
                </span>
              </div>

              {/* Homra Connect Paywall Box */}
              <div className="border border-[#1A73E8] rounded-xl p-4 mb-4 bg-[#E8F0FE]/50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-[#1A73E8]" strokeWidth={2} />
                  <h3 className="font-semibold text-[#1A73E8] text-sm">Homra Connect</h3>
                </div>
                <p className="text-[#3C4043] text-xs">Unlock the exact address, phone number, and secure chat with the landlord.</p>
              </div>

              <button className="w-full bg-[#1A73E8] text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors mb-3 flex items-center justify-center gap-2" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                Unlock for $2.00 <ChevronRight size={18} />
              </button>
              
              <p className="text-center text-xs text-[#5F6368] mb-6">· No charges until landlord responds ·</p>

              <div className="space-y-3 text-sm text-[#3C4043]">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-[#5F6368]" strokeWidth={1.5} /> Secure AI-Monitored Chat
                </div>
                <div className="flex items-center gap-3">
                  <FileCheck size={18} className="text-[#5F6368]" strokeWidth={1.5} /> Digital Smart-Lease
                </div>
                <div className="flex items-center gap-3">
                  <Bot size={18} className="text-[#5F6368]" strokeWidth={1.5} /> Anti-Bypass Protection
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}