'use client'

import TigerRisk from '@/components/risk/TigerRisk'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function RiskPage() {
  return (
    <ProtectedRoute requireVerification={true}>
      <TigerRisk />
    </ProtectedRoute>
  )
} 