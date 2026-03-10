'use client'

// セッションページレイアウト: UnifiedAuthProvider + ToolsHeader
import { UnifiedAuthProvider, useUnifiedAuth } from '@/components/providers/UnifiedAuthProvider'
import { ToolsHeader } from '../../components/ToolsHeader'
import Footer from '@/components/Footer'

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UnifiedAuthProvider redirectTo="/portal/auth?from=colors">
      <SessionLayoutInner>{children}</SessionLayoutInner>
    </UnifiedAuthProvider>
  )
}

function SessionLayoutInner({ children }: { children: React.ReactNode }) {
  const { signOut } = useUnifiedAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToolsHeader showSignOut onSignOut={signOut} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
