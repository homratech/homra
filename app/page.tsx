"use client"

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import PropertyCard from '@/components/PropertyCard'
import AuthModal from '@/components/AuthModal'
import { Search, Globe, Menu, MapPin, CalendarDays, BedDouble, Waves, Dog, Home as HomeIcon, Building2, Building, Sofa, Users, UsersRound, LayoutGrid, Map as MapIcon, ChevronRight, ChevronLeft, ChevronDown, Sparkles, Wifi, Truck, Wrench, Zap, ShieldCheck, Clock, Car, Check, X, Navigation } from 'lucide-react'

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
  const [customLeaseInput, setCustomLeaseInput] = useState('')
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

  // Handle Custom Lease Length Set
  const handleSetCustomLease = () => {
    if (customLeaseInput && Number(customLeaseInput) > 0) {
      setLeaseLength(`${customLeaseInput} months`)
      setActiveSearchSection(null)
    }
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

  // Quick date options for Move In
  const getQuickDate = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }
  const quickDates = [
    { label: 'Today', value: getQuickDate(0) },
    { label: 'Tomorrow', value: getQuickDate(1) },
    { label: 'This Weekend', value: getQuickDate(7) },
    { label: 'Next Month', value: getQuickDate(30) },
  ]

  return (
    <>
      <Sidebar />
      <div className="ml-[200px] px-6 py-4 animate-fade-in-up">
        {/* TOP NAVIGATION BAR - PERFECTLY ALIGNED */}
        <header className="flex items-center justify-between h-14 mb-4">
          <div className="flex-1 flex items-center"></div>
          
          <nav className="flex-1 flex justify-center items-center gap-6 text-xs font-medium whitespace-nowrap">
            {tabs.map(tab => (
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
                { id: 'moveIn', icon: CalendarDays, label: 'Move in', value: moveInDate ? new Date(moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Add dates' },
                { id: 'leaseLength', icon: CalendarDays, label: 'Lease Length', value: leaseLength || 'Add duration' },
                { id: 'bedrooms', icon: BedDouble, label: 'Bedrooms', value: bedroomsText }
              ].map((sec, idx, arr) => (
                <div key={sec.id} className="flex flex-1 items-center min-w-0">
                  <button onClick={() => handleSectionClick(sec.id)} className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer min-w-0 border border-transparent transition-colors duration-300 focus:outline-none ${activeSearchSection === sec.id ? 'bg-[#1A73E8] shadow-sm' : 'hover:bg-gray-100'}`}>
                    <sec.icon size={16} className={`shrink-0 transition-colors duration-300 ${activeSearchSection === sec.id ? 'text-white' : 'text-gray-800'}`} strokeWidth={1.5} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className={`text-xs font-bold leading-tight transition-colors duration-300 ${activeSearchSection === sec.id ? 'text-white' : 'text-gray-800'}`}>{sec.label}</span>
                      <span className={`text-xs leading-tight truncate w-full text-left transition-colors duration-300 ${activeSearchSection === sec.id ? 'text-blue-100' : 'text-gray-600'}`}>{sec.value}</span>
                    </div>
                  </button>
                  {idx < arr.length - 1 && <div className="h-8 w-px bg-gray-200 shrink-0 mx-1"></div>}
                </div>
              ))}

              <button onClick={() => setActiveSearchSection(null)} className="w-12 h-12 bg-[#1A73E8] rounded-full flex items-center justify-center hover:bg-blue-700 hover:scale-105 shrink-0 ml-2 transition-all shadow-md focus:outline-none">
                <Search size={18} className="text-white" strokeWidth={2.5} />
              </button>
            </div>

            {activeSearchSection && <div className="fixed inset-0 z-10" onClick={() => setActiveSearchSection(null)}></div>}

            {/* PREMIUM COMPACT WHITE FLOATING POPOVER WITH CUSTOM SCROLLBAR */}
            {activeSearchSection && (
              <div className="absolute top-20 left-0 right-0 bg-white rounded-3xl border border-gray-100 p-5 z-40 shadow-2xl max-h-[70vh] overflow-y-auto homra-scroll">
                <div key={activeSearchSection} className={slideDir === 'left' ? 'animate-glide-left' : 'animate-glide-right'}>
                  
                  {/* WHERE SECTION */}
                  {activeSearchSection === 'where' && (
                    <div>
                      <div className="relative mb-4">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input autoFocus type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="Search city, area, or landmark" className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all shadow-sm" />
                        {searchLocation && (
                          <button onClick={() => setSearchLocation('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={16} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Popular Destinations</p>
                      <div className="grid grid-cols-1 gap-1">
                        {['Mumbai', 'Bandra West', 'Andheri East', 'Powai', 'Juhu'].filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).map(loc => (
                          <button key={loc} onClick={() => { setSearchLocation(loc); setActiveSearchSection(null) }} className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl text-sm flex items-center gap-3 text-gray-800 transition-colors group border border-transparent hover:border-gray-100">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                              <Navigation size={16} className="text-gray-500" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{loc}</div>
                              <div className="text-xs text-gray-500">Maharashtra, India</div>
                            </div>
                          </button>
                        ))}
                        {['Mumbai', 'Bandra West', 'Andheri East', 'Powai', 'Juhu'].filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).length === 0 && (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">No destinations found for "{searchLocation}"</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* MOVE IN SECTION */}
                  {activeSearchSection === 'moveIn' && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Select</p>
                      <div className="grid grid-cols-4 gap-2 mb-5">
                        {quickDates.map(qd => {
                          const dateObj = new Date(qd.value);
                          const dayLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                          const dateLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric' });
                          return (
                            <button key={qd.label} onClick={() => { setMoveInDate(qd.value); setActiveSearchSection(null) }} className={`h-[72px] rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all ${moveInDate === qd.value ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}>
                              <span className={`text-xs font-bold ${moveInDate === qd.value ? 'text-[#1A73E8]' : 'text-gray-900'}`}>{qd.label}</span>
                              <span className={`text-[10px] font-normal ${moveInDate === qd.value ? 'text-[#1A73E8]' : 'text-gray-500'}`}>{dayLabel} {dateLabel}</span>
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Custom Date</p>
                      <div className="relative">
                        <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all shadow-sm cursor-pointer" />
                      </div>
                      <div className="flex justify-end gap-2 mt-5">
                        {moveInDate && (
                          <button onClick={() => setMoveInDate('')} className="px-4 h-11 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Clear</button>
                        )}
                        <button onClick={() => setActiveSearchSection(null)} className="px-5 h-11 text-sm font-semibold text-white bg-[#1A73E8] rounded-xl hover:bg-blue-700 transition-colors">Done</button>
                      </div>
                    </div>
                  )}
                  
                  {/* LEASE LENGTH SECTION */}
                  {activeSearchSection === 'leaseLength' && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Select Lease Duration</p>
                      <div className="w-full flex flex-col gap-2">
                        {[
                          { len: '< 6 months', desc: 'Short-term stay or transit housing' },
                          { len: '11 months', desc: 'Standard leave & license agreement' },
                          { len: '2+ years', desc: 'Long-term commitment with stability' },
                        ].map(opt => (
                          <button key={opt.len} onClick={() => { setLeaseLength(opt.len); setCustomLeaseInput(''); setActiveSearchSection(null) }} className={`w-full px-4 py-4 rounded-2xl border flex items-center justify-between transition-all ${leaseLength === opt.len ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <div className="text-left">
                              <span className={`block font-bold text-base ${leaseLength === opt.len ? 'text-[#1A73E8]' : 'text-gray-900'}`}>{opt.len}</span>
                              <span className="text-xs text-gray-500 mt-0.5 block">{opt.desc}</span>
                            </div>
                            {leaseLength === opt.len && <Check size={18} className="text-[#1A73E8] shrink-0" strokeWidth={2.5} />}
                          </button>
                        ))}
                      </div>
                      <div className="mt-5 pt-5 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Custom Duration</p>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            placeholder="Enter months" 
                            className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all shadow-sm" 
                            onChange={(e) => setCustomLeaseInput(e.target.value)} 
                            value={customLeaseInput}
                          />
                          <button onClick={handleSetCustomLease} className="px-4 h-12 text-sm font-semibold text-white bg-[#1A73E8] rounded-xl hover:bg-blue-700 transition-colors shrink-0">Set</button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* BEDROOMS SECTION */}
                  {activeSearchSection === 'bedrooms' && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Number of Bedrooms</p>
                      <div className="w-full flex flex-col gap-1">
                        {[
                          { bhk: 'Any', desc: 'Show all properties regardless of size' },
                          { bhk: '1BHK', desc: '1 bedroom, hall, and kitchen' },
                          { bhk: '2BHK', desc: '2 bedrooms, hall, and kitchen' },
                          { bhk: '3BHK+', desc: '3 bedrooms or more' },
                        ].map(opt => {
                          const isActive = opt.bhk === 'Any' ? !currentBhk : currentBhk === opt.bhk
                          return (
                            <button key={opt.bhk} onClick={() => handleSearchBedroom(opt.bhk)} className={`w-full px-4 py-4 rounded-2xl border text-left transition-all flex items-center justify-between ${isActive ? 'border-[#1A73E8] bg-[#E8F0FE]' : 'border-transparent hover:bg-gray-50'}`}>
                              <div>
                                <div className={`text-sm font-bold ${isActive ? 'text-[#1A73E8]' : 'text-gray-900'}`}>{opt.bhk}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                              </div>
                              {isActive ? <Check size={18} className="text-[#1A73E8]" strokeWidth={2.5} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
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
            <button className="text-[10px] font-medium text-[#1A1A1A] px-2 py-1 bg-white border border-[#E8EAED] rounded-full hover:shadow-md flex items-center gap-1 transition-colors">
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