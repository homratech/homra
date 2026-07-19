"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Sidebar from '@/components/Sidebar'
import PropertyCard from '@/components/PropertyCard'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const parkingOptions = [
  { label: 'Two Wheeler', tag: '2 Wheeler Parking' },
  { label: '1 Car', tag: '1 Car Parking' },
  { label: '2 Cars', tag: '2 Cars Parking' },
  { label: '3 Cars', tag: '3 Cars Parking' }
]

function PropertiesGrid() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, general_location, rent_amount, categories')
      
      if (error) {
        console.error("Error fetching properties:", error)
      }
      
      if (data) {
        // Read filters from URL
        const maxBudgetParam = searchParams.get('maxBudget')
        const filtersParam = searchParams.get('filters')
        
        const maxBudget = maxBudgetParam ? Number(maxBudgetParam) : 100000
        const activeFilters = filtersParam ? filtersParam.split(',') : []

        // Apply exact same filter logic as homepage
        const filtered = data.filter(p => {
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

        setProperties(filtered)
      }
    }
    fetchProperties()
  }, [searchParams])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">Available homes in Mumbai ({properties.length})</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
        {properties && properties.length > 0 ? (
          properties.map((prop, index) => (
            <PropertyCard 
              key={prop.id}
              id={prop.id}
              title={prop.title}
              general_location={prop.general_location}
              rent_amount={prop.rent_amount}
              is_superhost={index === 4}
            />
          ))
        ) : (
          <p className="text-[#5F6368] text-sm">No properties match this filter yet.</p>
        )}
      </div>
    </>
  )
}

export default function AllPropertiesPage() {
  return (
    <>
      <Sidebar />
      <div className="ml-[200px] px-6 py-4 animate-fade-in-up">
        <Link href="/" className="flex items-center gap-2 text-[#5F6368] hover:text-[#1A1A1A] mb-4 text-sm font-medium">
          <ChevronLeft size={16} /> Back to home
        </Link>
        
        {/* Suspense is required by Next.js when using useSearchParams */}
        <Suspense fallback={<div className="text-[#5F6368] text-sm">Loading properties...</div>}>
          <PropertiesGrid />
        </Suspense>
      </div>
    </>
  )
}