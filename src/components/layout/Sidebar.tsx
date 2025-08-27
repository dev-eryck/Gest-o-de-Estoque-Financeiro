'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  Package,
  Move,
  Users,
  Truck,
  BarChart3,
  Settings,
  Menu,
  ShoppingCart
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { name: 'Movimentações', href: '/movimentacoes', icon: Move },
  { name: 'Funcionários', href: '/funcionarios', icon: Users },
  { name: 'Fornecedores', href: '/fornecedores', icon: Truck },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      'flex flex-col border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <span className="font-semibold text-lg">BAR DO CARNEIRO</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'sidebar-item',
                isActive && 'active',
                collapsed && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground text-center">
            Estoque no ponto e mesa cheia
          </div>
        </div>
      )}
    </div>
  );
}

