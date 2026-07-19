"use client"

import { useState } from 'react'
import { Globe, Menu } from 'lucide-react'

export default function TopNav() {
  const [activeTab, setActiveTab] = useState('Rentals')
  const tabs = ['Rentals', 'PG & Co-Living', 'Buy Homes']

  return (
    <header className="grid grid-cols-3 items-center h-12 mb-4 animate-fade-in-up">
      <div></div>
      
      <nav className="justify-self-center flex gap-6 text-xs font-medium">
        {tabs.map((tab) => (
          <span 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-1 cursor-pointer transition-all duration-200 ${activeTab === tab ? 'text-[#1A73E8] border-b-2 border-[#1A73E8]' : 'text-[#5F6368] hover:text-[#1A1A1A]'}`}
          >
            {tab}
          </span>
        ))}
      </nav>

      <div className="justify-self-end flex items-center gap-3">
        <span className="text-xs font-medium text-[#1A1A1A] hover:underline cursor-pointer hidden md:inline">List your property</span>
        <button className="w-8 h-8 rounded-full hover:bg-[#F1F3F4] flex items-center justify-center transition-colors">
          <Globe size={16} className="text-[#3C4043]" strokeWidth={1.5} />
        </button>
        <button className="h-8 px-1.5 pr-0.5 rounded-full bg-white border border-[#E8EAED] hover:shadow-md transition-shadow flex items-center gap-1.5">
          <Menu size={14} className="text-[#3C4043] ml-1" strokeWidth={1.5} />
          <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=50&auto=format&fit=crop" alt="Profile" />
          </div>
        </button>
      </div>
    </header>
  )
}