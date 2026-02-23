import { SuperAdminProvider } from './components/SuperAdminProvider'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SuperAdminProvider>{children}</SuperAdminProvider>
}
