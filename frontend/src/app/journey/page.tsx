'use client'

import TradingJourney from '@/components/dashboard/TradingJourney'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function JourneyPage() {
  return (
    <ProtectedRoute requireVerification={true}>
      <TradingJourney />
    </ProtectedRoute>
  )
} 