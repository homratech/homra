"use client"

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import PropertyCard from '@/components/PropertyCard'
import AuthModal from '@/components/AuthModal'
import { Search, Globe, Menu, MapPin, CalendarDays, BedDouble, Waves, Dog, Home as HomeIcon, Building2, Building, Sofa, Users, UsersRound, LayoutGrid, Map as MapIcon, ChevronRight, ChevronLeft, ChevronDown, Sparkles, Wifi, Truck, Wrench, Zap, ShieldCheck, Clock, Car, Check } from 'lucide-react'

// Reusable Property Carousel Component
function PropertyCarousel({ title, properties, maxBudget, activeFilters }: { title: string, properties: any[], maxBudget: number, activeFilters: string[] }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const cardWidthWithGap = 260

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -cardWidthWithGap : cardWidthWithGap
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const overflow = scrollWidth > clientWidth + 1
      setIsOverflowing(overflow)
      setCanScrollLeft(overflow && scrollLeft > 10)
      setCanScrollRight(overflow && scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    handleScroll()
  }, [properties])

  // Build URL query string to pass filters to the next page
  const filtersQuery = activeFilters.length > 0 ? `&filters=${activeFilters.join(',')}` : ''
  const browseUrl = `/properties?maxBudget=${maxBudget}${filtersQuery}`

  return (
    <section className="mb-10 mt-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-5">
        <Link href={browseUrl} className="text-[22px] font-bold text-[#1A1A1A] flex items-center gap-1.5 leading-7 cursor-pointer hover:text-[#1A73E8] transition-colors">
          {title} <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
        {isOverflowing && (
          <div className="flex gap-3 items-center">
            <button className="h-9 px-3.5 py-2 bg-white border border-[#E8EAED] rounded-[20px] text-sm font-medium text-[#1A1A1A] flex items-center gap-1.5 hover:shadow-md transition-shadow">
              View on map <MapIcon size={16} strokeWidth={1.5} />
            </button>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className={`w-9 h-9 rounded-full bg-white border border-[#E8EAED] flex items-center justify-center transition-all duration-300 ${canScrollLeft ? 'opacity-100 hover:shadow-md' : 'opacity-40 cursor-not-allowed'}`}>
                <ChevronLeft size={14} strokeWidth={1.5} className="text-[#3C4043]" />
              </button>
              <button onClick={() => scroll('right')} className={`w-9 h-9 rounded-full bg-white border border-[#E8EAED] flex items-center justify-center transition-all duration-300 ${canScrollRight ? 'opacity-100 hover:shadow-md' : 'opacity-40 cursor-not-allowed'}`}>
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#3C4043]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div ref={scrollRef} onScroll={handleScroll} className="flex gap-4 items-start overflow-x-auto pb-6 snap-x no-scrollbar smooth-scroll">
          {properties && properties.length > 0 ? (
            properties.map((prop, index) => (
              <div key={prop.id} className="w-[244px] shrink-0 snap-start">
                <PropertyCard 
                  id={prop.id}
                  title={prop.title}
                  general_location={prop.general_location}
                  rent_amount={prop.rent_amount}
                  is_superhost={index === 4}
                />
              </div>
            ))
          ) : (
            <p className="text-[#5F6368] text-sm">No properties match this filter yet.</p>
          )}
        </div>
        
        {isOverflowing && (
          <>
            <button 
              onClick={() => scroll('left')} 
              className={`absolute left-4 top-[110px] -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center z-20 hover:scale-110 transition-all duration-300 ${canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`} 
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <ChevronLeft size={14} strokeWidth={1.5} className="text-[#1A1A1A]" />
            </button>

            <button 
              onClick={() => scroll('right')} 
              className={`absolute right-4 top-[110px] -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center z-20 hover:scale-110 transition-all duration-300 ${canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`} 
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <ChevronRight size={14} strokeWidth={1.5} className="text-[#1A1A1A]" />
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Rentals')
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // INTERACTIVE SEARCH BAR STATE
  const [activeSearchSection, setActiveSearchSection] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [leaseLength, setLeaseLength] = useState('')
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const sectionIds = ['where', 'moveIn', 'leaseLength', 'bedrooms']
  
  // MULTI-FILTER STATE
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showParkingDropdown, setShowParkingDropdown] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const [maxBudget, setMaxBudget] = useState(100000)

  // Refs for Drag & Dropdown
  const filterRef = useRef<HTMLDivElement>(null)
  const parkingBtnRef = useRef<HTMLButtonElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Ensure portal mounts only on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Global Window Scroll Listener to close dropdown
  useEffect(() => {
    const handleWindowScroll = () => {
      if (showParkingDropdown) {
        setShowParkingDropdown(false)
      }
      if (activeSearchSection) {
        setActiveSearchSection(null)
      }
    }
    window.addEventListener('scroll', handleWindowScroll, true)
    return () => window.removeEventListener('scroll', handleWindowScroll, true)
  }, [showParkingDropdown, activeSearchSection])

  // Mouse Wheel Horizontal Scroll for Filters
  useEffect(() => {
    const el = filterRef.current
    if (!el) return
    
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault() 
        el.scrollLeft += e.deltaY 
      }
    }
    
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    if (filterRef.current) {
      setStartX(e.pageX - filterRef.current.offsetLeft)
      setScrollLeft(filterRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !filterRef.current) return;
    e.preventDefault();
    const x = e.pageX - filterRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    filterRef.current.scrollLeft = scrollLeft - walk;
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  // Handle opening dropdown and calculating fixed position (Smart Flipping)
  const handleParkingClick = () => {
    if (!showParkingDropdown && parkingBtnRef.current) {
      const rect = parkingBtnRef.current.getBoundingClientRect()
      const dropdownHeight = 160 // Approx height of the dropdown
      const spaceBelow = window.innerHeight - rect.bottom
      
      // If not enough space below, open upwards
      if (spaceBelow < dropdownHeight) {
        setDropdownPos({ top: rect.top - dropdownHeight - 4, left: rect.left })
      } else {
        // Otherwise open downwards as normal
        setDropdownPos({ top: rect.bottom + 4, left: rect.left })
      }
    }
    setShowParkingDropdown(!showParkingDropdown)
  }

  // Toggle Multi-Filter
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter)
      } else {
        return [...prev, filter]
      }
    })
  }

  // Search Bar Bedroom Filter Logic
  const currentBhk = activeFilters.find(f => ['1BHK', '2BHK', '3BHK+'].includes(f))
  const bedroomsText = currentBhk ? currentBhk : "Any"

  const handleSearchBedroom = (bhk: string) => {
    const withoutBhk = activeFilters.filter(f => !['1BHK', '2BHK', '3BHK+'].includes(f))
    if (bhk === 'Any') {
      setActiveFilters(withoutBhk)
    } else {
      setActiveFilters([...withoutBhk, bhk])
    }
    setActiveSearchSection(null)
  }

  // Handle Search Section Click with Glide Direction Logic
  const handleSectionClick = (id: string) => {
    if (id === activeSearchSection) {
      setActiveSearchSection(null)
      return
    }
    if (activeSearchSection) {
      const prevIdx = sectionIds.indexOf(activeSearchSection)
      const nextIdx = sectionIds.indexOf(id)
      setSlideDir(nextIdx > prevIdx ? 'left' : 'right')
    }
    setActiveSearchSection(id)
  }

  // Slider dynamic background math
  const minBudget = 10000
  const maxBudgetLimit = 100000
  const budgetPercentage = ((maxBudget - minBudget) / (maxBudgetLimit - minBudget)) * 100

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, general_location, rent_amount, categories')
      if (data) setProperties(data)
    }
    fetchProperties()
  }, [])

  const parkingOptions = [
    { label: 'Two Wheeler', tag: '2 Wheeler Parking' },
    { label: '1 Car', tag: '1 Car Parking' },
    { label: '2 Cars', tag: '2 Cars Parking' },
    { label: '3 Cars', tag: '3 Cars Parking' }
  ]

  const filteredProperties = properties.filter(p => {
    if (activeFilters.length === 0) {
      return p.rent_amount <= maxBudget
    }

    const tagsToCheck = activeFilters.map(f => {
      const pOpt = parkingOptions.find(po => po.label === f)
      return pOpt ? pOpt.tag : f
    })

    for (const tag of tagsToCheck) {
      if (!p.categories?.includes(tag)) return false
    }

    if (p.rent_amount > maxBudget) return false
    return true
  })

  const services = [
    { title: "Deep Cleaning", icon: Sparkles, img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop" },
    { title: "Furniture Rental", icon: Sofa, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop" },
    { title: "High-Speed Internet", icon: Wifi, img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=400&auto=format&fit=crop" },
    { title: "Packers & Movers", icon: Truck, img: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=400&auto=format&fit=crop" },
    { title: "Maintenance", icon: Wrench, img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=400&auto=format&fit=crop" },
    { title: "Utility Setup", icon: Zap, img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=400&auto=format&fit=crop" },
  ]

  const tabs = ['Rentals', 'PG & Co-Living', 'Buy Homes']
  
  const filters = [
    { name: "Student PG", icon: Users },
    { name: "1BHK", icon: HomeIcon },
    { name: "2BHK", icon: Building2 },
    { name: "3BHK+", icon: Building },
    { name: "Pet Friendly", icon: Dog },
    { name: "Furnished", icon: Sofa },
    { name: "Gated Society", icon: ShieldCheck },
    { name: "Bachelor Allowed", icon: UsersRound },
    { name: "Immediate Move-in", icon: Clock },
    { name: "Luxury Sea View", icon: Waves },
    { name: "Family Home", icon: HomeIcon },
  ]

  const activeParkingCount = activeFilters.filter(f => parkingOptions.some(po => po.label === f)).length

  return (
    <>
      <Sidebar />
      <div className="ml-[200px] px-6 py-4 animate-fade-in-up">
        {/* TOP NAVIGATION BAR - PERFECTLY ALIGNED */}
        <header className="flex items-center justify-between h-14 mb-4">
          <div className="flex-1 flex items-center"></div>
          
          <nav className="flex-1 flex justify-center items-center gap-6 text-xs font-medium whitespace-nowrap">
            {tabs.map((tab) => (
              <span 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`h-8 flex items-center cursor-pointer transition-all duration-200 border-b-2 ${activeTab === tab ? 'text-[#1A73E8] border-[#1A73E8]' : 'text-[#5F6368] hover:text-[#1A1A1A] border-transparent'}`}
              >
                {tab}
              </span>
            ))}
          </nav>

          {/* Right Actions (Slightly nudged up for optical alignment) */}
          <div className="flex-1 flex justify-end items-center gap-3 whitespace-nowrap -mt-1">
            <button onClick={() => setShowAuthModal(true)} className="h-8 flex items-center text-xs font-medium text-[#1A1A1A] hover:underline cursor-pointer hidden md:inline">
              List your property
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-[#F1F3F4] flex items-center justify-center transition-colors">
              <Globe size={16} className="text-[#3C4043]" strokeWidth={1.5} />
            </button>
            <button onClick={() => setShowAuthModal(true)} className="h-8 px-1.5 pr-0.5 rounded-full bg-white border border-[#E8EAED] hover:shadow-md transition-shadow flex items-center gap-1.5">
              <Menu size={14} className="text-[#3C4043] ml-1" strokeWidth={1.5} />
              <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=50&auto=format&fit=crop" alt="Profile" />
              </div>
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative h-[220px] mb-16">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1600&auto=format&fit=crop" 
              alt="Modern Apartment Building" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
              <div className="absolute left-8 top-8 max-w-sm">
                <h1 className="text-2xl font-bold text-white mb-1 leading-tight">Find your next home</h1>
                <p className="text-white text-xs mb-3 opacity-90">Verified properties. Secure escrow. Zero broker fees.</p>
                <button className="bg-[#1A73E8] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors" style={{ boxShadow: '0 4px 12px rgba(26,115,232,0.3)' }}>
                  Explore rentals
                </button>
              </div>
            </div>
            <span className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#1A1A1A] flex items-center gap-1 shadow-sm">
              <ShieldCheck size={10} className="text-[#1A73E8]" /> 100% Verified Listings
            </span>
          </div>

          {/* PREMIUM FLOATING SEARCH BAR */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl z-30">
            <div className="bg-white flex items-center pl-4 pr-1.5 h-16 rounded-full border border-gray-200 shadow-lg transition-all hover:shadow-xl">
              
              {[
                { id: 'where', icon: MapPin, label: 'Where', value: searchLocation || 'Search destinations' },
                { id: 'moveIn', icon: CalendarDays, label: 'Move in', value: moveInDate || 'Add dates' },
                { id: 'leaseLength', icon: CalendarDays, label: 'Lease Length', value: leaseLength || '11 months+' },
                { id: 'bedrooms', icon: BedDouble, label: 'Bedrooms', value: bedroomsText }
              ].map((sec, idx, arr) => (
                <div key={sec.id} className="flex flex-1 items-center min-w-0">
                  <button onClick={() => handleSectionClick(sec.id)} className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer min-w-0 transition-all duration-200 ${activeSearchSection === sec.id ? 'bg-white shadow-md border border-gray-200' : 'hover:bg-gray-100 border border-transparent'}`}>
                    <sec.icon size={16} className="text-gray-800 shrink-0" strokeWidth={1.5} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-bold text-gray-800 leading-tight">{sec.label}</span>
                      <span className="text-xs text-gray-500 leading-tight truncate w-full text-left">{sec.value}</span>
                    </div>
                  </button>
                  {idx < arr.length - 1 && <div className="h-8 w-px bg-gray-200 shrink-0 mx-1"></div>}
                </div>
              ))}

              <button onClick={() => setActiveSearchSection(null)} className="w-12 h-12 bg-[#1A73E8] rounded-full flex items-center justify-center hover:bg-blue-700 hover:scale-105 shrink-0 ml-2 transition-all shadow-md">
                <Search size={18} className="text-white" strokeWidth={2.5} />
              </button>
            </div>

            {activeSearchSection && <div className="fixed inset-0 z-10" onClick={() => setActiveSearchSection(null)}></div>}

            {/* PREMIUM FLOATING POPOVER WITH GAP AND GLIDE */}
            {activeSearchSection && (
              <div className="absolute top-20 left-0 right-0 bg-white rounded-3xl border border-gray-100 p-6 z-40 shadow-2xl overflow-hidden">
                {/* Key + dynamic class forces remount and glides in the correct direction */}
                <div key={activeSearchSection} className={slideDir === 'left' ? 'animate-glide-left' : 'animate-glide-right'}>
                  {activeSearchSection === 'where' && (
                    <div>
                      <input autoFocus type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="Search destinations" className="w-full h-14 px-5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all shadow-sm" />
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        {['Mumbai', 'Bandra West', 'Andheri East'].filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).map(loc => (
                          <button key={loc} onClick={() => { setSearchLocation(loc); setActiveSearchSection(null) }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-2xl text-sm flex items-center gap-4 text-gray-800 transition-colors group">
                            <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                              <MapPin size={18} className="text-gray-500" strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="font-medium">{loc}</div>
                              <div className="text-xs text-gray-500">India</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSearchSection === 'moveIn' && (
                    <div className="flex flex-col items-center">
                      <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full h-14 px-5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all shadow-sm" />
                      <button onClick={() => setActiveSearchSection(null)} className="mt-6 bg-[#1A1A1A] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-black transition-colors">Done</button>
                    </div>
                  )}
                  {activeSearchSection === 'leaseLength' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full flex flex-col gap-3">
                        {['11 months', '22 months', '33 months'].map(len => (
                          <button key={len} onClick={() => { setLeaseLength(len); setActiveSearchSection(null) }} className={`w-full px-6 py-4 rounded-2xl border-2 text-left text-sm font-medium transition-all flex items-center justify-between ${leaseLength === len ? 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]' : 'border-gray-200 text-gray-800 hover:border-gray-400'}`}>
                            {len}
                            {leaseLength === len && <Check size={18} className="text-[#1A73E8]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSearchSection === 'bedrooms' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full flex flex-col gap-3">
                        {['Any', '1BHK', '2BHK', '3BHK+'].map(bhk => {
                          const isActive = bhk === 'Any' ? !currentBhk : currentBhk === bhk
                          return (
                            <button key={bhk} onClick={() => handleSearchBedroom(bhk)} className={`w-full px-6 py-4 rounded-2xl border-2 text-left text-sm font-medium transition-all flex items-center justify-between ${isActive ? 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]' : 'border-gray-200 text-gray-800 hover:border-gray-400'}`}>
                              {bhk}
                              {isActive && <Check size={18} className="text-[#1A73E8]" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LIFESTYLE CATEGORY FILTERS */}
        <section 
          ref={filterRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex gap-2 mb-4 overflow-x-auto pb-2 h-12 items-center no-scrollbar smooth-scroll cursor-grab ${isDragging ? 'active:cursor-grabbing' : ''}`}
        >
          <button 
            onClick={() => { setActiveFilters([]); setShowParkingDropdown(false) }}
            className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-200 border ${activeFilters.length === 0 ? 'bg-[#E8F0FE] text-[#1A73E8] border-transparent scale-105' : 'bg-white text-[#3C4043] border-[#E8EAED] hover:shadow-md hover:border-gray-300'}`}
          >
            <LayoutGrid size={14} strokeWidth={1.5} />
            All
          </button>

          {filters.map((cat) => {
            const isActive = activeFilters.includes(cat.name)
            return (
              <button 
                key={cat.name} 
                onClick={() => { toggleFilter(cat.name); setShowParkingDropdown(false) }}
                className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-200 border ${isActive ? 'bg-[#E8F0FE] text-[#1A73E8] border-transparent scale-105' : 'bg-white text-[#3C4043] border-[#E8EAED] hover:shadow-md hover:border-gray-300'}`}
              >
                <cat.icon size={14} strokeWidth={1.5} />
                {cat.name}
              </button>
            )
          })}

          <div className="relative shrink-0">
            <button 
              ref={parkingBtnRef}
              onClick={handleParkingClick}
              className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-200 border ${activeParkingCount > 0 ? 'bg-[#E8F0FE] text-[#1A73E8] border-transparent scale-105' : 'bg-white text-[#3C4043] border-[#E8EAED] hover:shadow-md hover:border-gray-300'}`}
            >
              <Car size={14} strokeWidth={1.5} />
              Parking {activeParkingCount > 0 && `(${activeParkingCount})`}
              <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform duration-200 ${showParkingDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </section>

        {/* BUDGET SLIDER FILTER */}
        <section className="flex items-center gap-4 mb-6 bg-white border border-[#E8EAED] rounded-xl px-5 py-3 w-fit shadow-sm">
          <span className="text-xs font-semibold text-[#1A1A1A] whitespace-nowrap">Max Budget:</span>
          <input 
            type="range" 
            min={minBudget} 
            max={maxBudgetLimit} 
            step="1000" 
            value={maxBudget} 
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="range-slider w-72"
            style={{
              background: `linear-gradient(to right, #1A73E8 0%, #1A73E8 ${budgetPercentage}%, #E8EAED ${budgetPercentage}%, #E8EAED 100%)`
            }}
          />
          <span className="text-xs font-bold text-[#1A73E8] whitespace-nowrap w-16 text-right">₹{maxBudget.toLocaleString('en-IN')}</span>
        </section>

        <PropertyCarousel 
          title={`Available homes in Mumbai (${filteredProperties.length})`} 
          properties={filteredProperties} 
          maxBudget={maxBudget} 
          activeFilters={activeFilters} 
        />

        {/* HOMRA LIVING SERVICES */}
        <section className="mt-4 mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Homra Living Services</h2>
            <button className="text-[10px] font-medium text-[#1A1A1A] px-2 py-1 bg-white border border-[#E8EAED] rounded-full hover:shadow-md flex items-center gap-1 transition-shadow">
              View all <ChevronRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {services.map((srv) => (
              <div key={srv.title} className="relative h-[140px] rounded-lg overflow-hidden group cursor-pointer">
                <img src={srv.img} alt={srv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <srv.icon size={12} className="text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  <span className="text-white font-semibold text-[10px]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{srv.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* AUTH MODAL OVERLAY */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* PORTAL DROPDOWN */}
      {mounted && showParkingDropdown && createPortal(
        <div 
          style={{ position: 'fixed', top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px`, zIndex: 9999 }} 
          className="w-48 bg-white rounded-xl shadow-lg border border-[#E8EAED] py-2 animate-fade-in-up"
        >
          {parkingOptions.map((opt) => (
            <button 
              key={opt.label}
              onClick={() => toggleFilter(opt.label)}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F5F5F7] transition-colors flex items-center gap-2 ${activeFilters.includes(opt.label) ? 'text-[#1A73E8] font-semibold' : 'text-[#3C4043]'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeFilters.includes(opt.label) ? 'bg-[#1A73E8] border-[#1A73E8]' : 'border-[#E8EAED]'}`}>
                {activeFilters.includes(opt.label) && <Check size={10} className="text-white" />}
              </div>
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}