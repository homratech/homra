import Link from 'next/link'
import Image from 'next/image'
import { Search, Bookmark, KeyRound, MessageSquare, UserCircle } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#FCFCFC] py-4 px-3 flex flex-col z-50" style={{ boxShadow: '4px 0 12px rgba(0,0,0,0.03)' }}>
      
      {/* HOMRA LOGO PLACEMENT */}
      <div className="px-3 mb-4 mt-1">
        <Link href="/">
          <Image 
            src="/homra-logo.png" 
            alt="Homra Logo" 
            width={100} 
            height={30} 
            className="w-auto h-auto"
            priority
          />
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        <Link href="/" className="flex items-center gap-2.5 h-9 px-3 rounded-3xl bg-[#E8F0FE] text-[#1A73E8] font-medium text-xs">
          <Search size={16} strokeWidth={1.5} /> Explore
        </Link>
        <Link href="/wishlists" className="flex items-center gap-2.5 h-9 px-3 rounded-3xl text-[#5F6368] hover:bg-black/5 font-medium text-xs">
          <Bookmark size={16} strokeWidth={1.5} /> Saved Homes
        </Link>
        <Link href="/dashboard/tenant" className="flex items-center gap-2.5 h-9 px-3 rounded-3xl text-[#5F6368] hover:bg-black/5 font-medium text-xs">
          <KeyRound size={16} strokeWidth={1.5} /> My Leases
        </Link>
        <Link href="/inbox" className="flex items-center gap-2.5 h-9 px-3 rounded-3xl text-[#5F6368] hover:bg-black/5 font-medium text-xs">
          <MessageSquare size={16} strokeWidth={1.5} /> Inbox
        </Link>
        <Link href="/profile" className="flex items-center gap-2.5 h-9 px-3 rounded-3xl text-[#5F6368] hover:bg-black/5 font-medium text-xs">
          <UserCircle size={16} strokeWidth={1.5} /> Profile
        </Link>
      </div>
      
      <div className="mt-auto mb-4 w-[176px] h-[160px] rounded-2xl p-3 bg-white" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=80&auto=format&fit=crop" alt="Modern Apartment" className="absolute -top-1 -right-1 w-6 h-6 rounded-full object-cover border-2 border-white" />
          <h3 className="font-semibold text-[#1A1A1A] text-[11px] leading-tight max-w-[120px] pr-5">Find verified homes & PGs</h3>
        </div>
        <Link href="#" className="text-[#1A73E8] text-[10px] font-medium mt-1 block">Zero broker fees ›</Link>
        <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=200&auto=format&fit=crop" alt="Modern Living Room" className="mt-2 h-[70px] w-full rounded-lg object-cover" />
      </div>
    </aside>
  )
}