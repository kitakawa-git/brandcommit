'use client'

// STPセッションページレイアウト: UnifiedAuthProvider + STPHeader
import { UnifiedAuthProvider, useUnifiedAuth } from '@/components/providers/UnifiedAuthProvider'
import { STPHeader } from '../../components/STPHeader'
import Footer from '@/components/Footer'

export default function STPSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UnifiedAuthProvider redirectTo="/portal/auth?from=stp">
      <STPSessionLayoutInner>{children}</STPSessionLayoutInner>
    </UnifiedAuthProvider>
  )
}

function STPSessionLayoutInner({ children }: { children: React.ReactNode }) {
  const { signOut } = useUnifiedAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <STPHeader showSignOut onSignOut={signOut} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
