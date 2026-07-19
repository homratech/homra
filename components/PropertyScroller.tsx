"use client"

import { useRef } from 'react'
import PropertyCard from './PropertyCard'
import { ChevronRight, ChevronLeft, Map as MapIcon } from 'lucide-react'

interface Property {
  id: string;
  title: string;
  general_location: string;
  rent_amount: number;
}

export default function PropertyScroller({ properties }: { properties: Property[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const cardSizes = [
    { width: 'w-[244px]', height: 'h-[200px]' },
    { width: 'w-[244px]', height: 'h-[200px]' },
    { width: 'w-[244px]', height: 'h-[200px]' },
    { width: 'w-[236px]', height: 'h-[190px]' },
    { width: 'w-[256px]', height: 'h-[210px]' },
  ]

  return (
    <section className="mb-10 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[22px] font-bold text-[#1A1A1A] flex items-center gap-1.5 leading-7">
          Available rentals in Mumbai <ChevronRight size={20} strokeWidth={1.5} className="text-[#1A1A1A]" />
        </h2>
        <div className="flex gap-3 items-center">
          <button className="h-9 px-3.5 py-2 bg-white border border-[#E8EAED] rounded-[20px] text-sm font-medium text-[#1A1A1A] flex items-center gap-1.5 hover:shadow-md transition-shadow">
            View on map <MapIcon size={16} strokeWidth={1.5} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full bg-white border border-[#E8EAED] flex items-center justify-center hover:shadow-md transition-shadow">
              <ChevronLeft size={14} strokeWidth={1.5} className="text-[#3C4043]" />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full bg-white border border-[#E8EAED] flex items-center justify-center hover:shadow-md transition-shadow">
              <ChevronRight size={14} strokeWidth={1.5} className="text-[#3C4043]" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 items-start overflow-x-auto pb-6 snap-x no-scrollbar smooth-scroll">
          {properties && properties.length > 0 ? (
            properties.map((prop, index) => {
              const size = index < cardSizes.length ? cardSizes[index] : cardSizes[0];
              return (
                <PropertyCard 
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  general_location={prop.general_location}
                  rent_amount={prop.rent_amount}
                  is_superhost={index === 4}
                  widthClass={size.width}
                  imgHeightClass={size.height}
                />
              )
            })
          ) : (
            <p className="text-[#5F6368] text-sm">No properties listed yet.</p>
          )}
        </div>
        {/* Floating Scroll Arrow */}
        <button 
          onClick={() => scroll('right')} 
          className="absolute right-4 top-[100px] -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center z-10 hover:scale-110 transition-transform" 
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          <ChevronRight size={14} strokeWidth={1.5} className="text-[#1A1A1A]" />
        </button>
      </div>
    </section>
  )
}