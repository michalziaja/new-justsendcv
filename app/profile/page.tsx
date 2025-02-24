'use client'

import { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClerkSupabaseClient } from '@/utils/supabaseClient'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Header } from "@/components/app-header"

export default function ProfilePage() {
  const [aboutMe, setAboutMe] = useState('')
  const [city, setCity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const { session } = useSession()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
      try {
        const supabase = await createClerkSupabaseClient(session)
        const { data, error } = await supabase
          .from('profiles')
          .select('about_me, city')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setAboutMe(data.about_me || '')
          setCity(data.city || '')
        }
      } catch (error) {
        console.error('Błąd podczas pobierania danych profilu:', error)
      }
    }

    fetchProfileData()
  }, [user, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setIsLoading(true)
  
    try {
      const supabase = await createClerkSupabaseClient(session)
  
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          about_me: aboutMe,
          city: city,
          updated_at: new Date().toISOString(),
        })
  
      if (error) throw error
  
      alert('Profil został zaktualizowany!')
    } catch (error) {
      console.error('Błąd:', error)
      alert('Wystąpił błąd podczas aktualizacji profilu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Profil" />
        <div className="flex flex-col gap-8 p-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Zarządzanie kontem Clerk</h2>
            <UserProfile routing="path" path="/profile" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Dodatkowe informacje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="city" className="block mb-2">Miasto</label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Twoje miasto"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="aboutMe" className="block mb-2">O mnie</label>
                <Textarea
                  id="aboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Napisz coś o sobie..."
                  disabled={isLoading}
                  className="w-full"
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Aktualizowanie...' : 'Zaktualizuj profil'}
              </Button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
