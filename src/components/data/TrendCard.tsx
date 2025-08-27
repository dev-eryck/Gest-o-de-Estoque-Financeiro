'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface TrendCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: LucideIcon;
  description?: string;
}

export function TrendCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  description 
}: TrendCardProps) {
  const isPositive = changeType === 'increase';
  
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger mr-1" />
          )}
          <span className={cn(
            'text-sm font-medium',
            isPositive ? 'text-success' : 'text-danger'
          )}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            vs. período anterior
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

