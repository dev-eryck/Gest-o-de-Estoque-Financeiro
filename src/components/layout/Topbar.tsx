'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  User, 
  Sun, 
  Moon,
  Command
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-4">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-sm text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <User className="h-4 w-4" />
        </Button>
      </div>

      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou pesquise..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          <CommandGroup heading="Navegação">
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
              <Search className="mr-2 h-4 w-4" />
              Ir para Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/produtos'))}>
              <Search className="mr-2 h-4 w-4" />
              Ir para Produtos
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/movimentacoes'))}>
              <Search className="mr-2 h-4 w-4" />
              Ir para Movimentações
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Ações">
            <CommandItem onSelect={() => runCommand(() => router.push('/produtos/novo'))}>
              <Search className="mr-2 h-4 w-4" />
              Novo Produto
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/movimentacoes?action=nova'))}>
              <Search className="mr-2 h-4 w-4" />
              Nova Movimentação
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/funcionarios/novo'))}>
              <Search className="mr-2 h-4 w-4" />
              Novo Funcionário
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Configurações">
            <CommandItem onSelect={() => runCommand(() => router.push('/configuracoes'))}>
              <Search className="mr-2 h-4 w-4" />
              Configurações
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

