import { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
  currentPage?: string
}

export default function Layout({ children, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar currentPage={currentPage} />
      <main>
        {children}
      </main>
    </div>
  )
} 