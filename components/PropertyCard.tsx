import Link from 'next/link'
import { Heart, Star, Zap, ShieldCheck } from 'lucide-react'

interface PropertyCardProps {
  id: string;
  title: string;
  general_location: string;
  rent_amount: number;
  is_superhost?: boolean;
}

export default function PropertyCard({ 
  id, 
  title, 
  general_location, 
  rent_amount, 
  is_superhost = false 
}: PropertyCardProps) {
  const imageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop"

  return (
    <div className="w-full">
      <Link href={`/properties/${id}`} className="block">
        <div className="relative w-full h-[220px] rounded-2xl overflow-hidden group shadow-md transition-shadow duration-300 hover:shadow-xl">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 h-7 px-3 py-1.5 rounded-[20px] bg-white text-xs font-semibold flex items-center gap-1" style={{ color: is_superhost ? '#1A73E8' : '#1A1A1A' }}>
            {is_superhost ? <Zap size={12} className="text-[#1A73E8] fill-[#1A73E8]" /> : <ShieldCheck size={12} className="text-[#1A73E8]" />}
            {is_superhost ? "Superhost" : "Homra Verified"}
          </span>
          <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Heart size={16} className="text-[#3C4043]" strokeWidth={1.5} />
          </button>
        </div>
        <div className="pt-3 pb-1.5 px-1">
          <div className="flex justify-between items-center">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] leading-5">{title}</h3>
            <span className="text-[#1A1A1A] text-sm font-medium flex items-center gap-1 leading-5">
              <Star size={12} className="fill-[#1A73E8] text-[#1A73E8]" /> 4.92
            </span>
          </div>
          <p className="text-[#5F6368] text-sm mt-0.5 leading-5">{general_location}</p>
          <p className="text-[#1A1A1A] text-sm font-semibold mt-1 leading-5">₹{rent_amount.toLocaleString()} <span className="font-normal text-[#5F6368]">/ month</span></p>
        </div>
      </Link>
    </div>
  )
}