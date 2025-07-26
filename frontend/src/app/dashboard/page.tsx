'use client'

import React from 'react'
import Dashboard from '@/components/dashboard/Dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireVerification={true}>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </ProtectedRoute>
  )
} 