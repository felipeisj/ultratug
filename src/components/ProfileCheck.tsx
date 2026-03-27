'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ProfileCheck() {
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Auto-create profile for first-time login
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'Usuario',
            role: 'ADMIN' // Default first user as Admin or change as needed
          })
        }
      } catch (err) {
        console.error("Profile check error:", err)
      }
    }

    checkProfile()
  }, [])

  return null
}
