"use client"

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function InvitePage() {
  const { code } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (code) {
      // Set the referral code in local storage / cookie for the signup flow
      document.cookie = `sf_ref_code=${code}; path=/; max-age=604800` // 7 days
      localStorage.setItem('sf_ref_code', code as string)
      
      // Redirect to the signup flow which handles new users
      setTimeout(() => {
         router.push('/choice?ref=invited')
      }, 500)
    }
  }, [code, router])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
       <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 animate-pulse mb-6">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
       </div>
       <h1 className="text-2xl font-bold text-white mb-2">You've been invited!</h1>
       <p className="text-slate-400 mb-8 max-w-sm">Applying your special invite code to unlock premium features and preparing your workspace...</p>
    </div>
  )
}
