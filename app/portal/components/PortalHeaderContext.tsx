'use client'

// ポータルヘッダーにページタイトルを表示するためのコンテキスト
import { createContext, useContext, useState, useEffect } from 'react'

type PortalHeaderContextType = {
  title: string | null
  subtitle: string | null
  setHeader: (title: string, subtitle?: string) => void
  clearHeader: () => void
}

const PortalHeaderContext = createContext<PortalHeaderContextType>({
  title: null,
  subtitle: null,
  setHeader: () => {},
  clearHeader: () => {},
})

export function PortalHeaderProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)

  const setHeader = (t: string, s?: string) => {
    setTitle(t)
    setSubtitle(s || null)
  }

  const clearHeader = () => {
    setTitle(null)
    setSubtitle(null)
  }

  return (
    <PortalHeaderContext.Provider value={{ title, subtitle, setHeader, clearHeader }}>
      {children}
    </PortalHeaderContext.Provider>
  )
}

export const usePortalHeader = () => useContext(PortalHeaderContext)

// ページからヘッダーを設定するフック
export function useSetPortalHeader(title: string, subtitle?: string) {
  const { setHeader, clearHeader } = usePortalHeader()
  useEffect(() => {
    setHeader(title, subtitle)
    return () => clearHeader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle])
}
