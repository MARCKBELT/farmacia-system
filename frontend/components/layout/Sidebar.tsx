'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText,
  AlertCircle,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: null },
  { href: '/dashboard/pos', icon: ShoppingCart, label: 'Punto de Venta', module: 'ventas' },
  { href: '/dashboard/products', icon: Package, label: 'Productos', module: 'productos' },
  { href: '/dashboard/inventory', icon: AlertCircle, label: 'Inventario', module: 'inventario' },
  { href: '/dashboard/customers', icon: Users, label: 'Clientes', module: 'clientes' },
  { href: '/dashboard/sales', icon: FileText, label: 'Ventas', module: 'ventas' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const hasPermission = (module: string | null) => {
    if (!module) return true
    return user?.permissions?.some(p => p.module === module && p.canRead)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">🏥 Farmacia</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.fullName}</p>
        <p className="text-xs text-gray-500">{user?.role}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            if (!hasPermission(item.module)) return null
            
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
