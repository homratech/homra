"use client"

import { useState } from 'react'
import { Waves, Dog, Home as HomeIcon, Building2, Sofa, Users, LayoutGrid } from 'lucide-react'

export default function CategoryFilters() {
  const categories = [
    { name: "Student PG", icon: Users },
    { name: "1BHK", icon: HomeIcon },
    { name: "2BHK", icon: Building2 },
    { name: "Pet Friendly", icon: Dog },
    { name: "Furnished", icon: Sofa },
    { name: "Co-Living", icon: Users },
    { name: "Luxury Sea View", icon: Waves },
    { name: "Family Home", icon: HomeIcon },
    { name: "More", icon: LayoutGrid },
  ]
  const [active, setActive] = useState("Student PG")

  return (
    <section className="flex gap-2 mb-4 overflow-x-auto pb-1 h-10 items-center no-scrollbar animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {categories.map((cat) => (
        <button 
          key={cat.name} 
          onClick={() => setActive(cat.name)}
          className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-200 border ${active === cat.name ? 'bg-[#E8F0FE] text-[#1A73E8] border-transparent scale-105' : 'bg-white text-[#3C4043] border-[#E8EAED] hover:shadow-md hover:border-gray-300'}`}
        >
          <cat.icon size={14} strokeWidth={1.5} />
          {cat.name}
        </button>
      ))}
    </section>
  )
}