import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatPhone(phone: string): string {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  return phone;
}

export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return cpf;
}

export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length === 14) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  }
  return cnpj;
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getStockStatus(stock: number, minStock: number): 'normal' | 'low' | 'critical' {
  if (stock === 0) return 'critical';
  if (stock <= minStock) return 'low';
  return 'normal';
}

export function getExpiryStatus(expiryDate: string | null, alertDays: number = 7): 'normal' | 'warning' | 'expired' {
  if (!expiryDate) return 'normal';
  
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= alertDays) return 'warning';
  return 'normal';
}

export function generateSKU(name: string, category: string): string {
  const prefix = category.substring(0, 2).toUpperCase();
  const namePart = name
    .split(' ')
    .map(word => word.substring(0, 2).toUpperCase())
    .join('')
    .substring(0, 6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}-${namePart}-${random}`;
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Cervejas': 'bg-blue-100 text-blue-800',
    'Refrigerantes': 'bg-green-100 text-green-800',
    'Destilados': 'bg-purple-100 text-purple-800',
    'Vinhos': 'bg-red-100 text-red-800',
    'Sucos': 'bg-orange-100 text-orange-800',
    'Águas': 'bg-cyan-100 text-cyan-800',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    'Gerente': 'bg-red-100 text-red-800',
    'Barman': 'bg-blue-100 text-blue-800',
    'Garçom': 'bg-green-100 text-green-800',
    'Cozinha': 'bg-orange-100 text-orange-800',
    'Caixa': 'bg-purple-100 text-purple-800',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export function getShiftColor(shift: string): string {
  const colors: Record<string, string> = {
    'manhã': 'bg-yellow-100 text-yellow-800',
    'tarde': 'bg-orange-100 text-orange-800',
    'noite': 'bg-blue-100 text-blue-800',
  };
  
  return colors[shift] || 'bg-gray-100 text-gray-800';
}

