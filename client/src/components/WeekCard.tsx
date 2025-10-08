import React, { useState } from 'react';
import { WeekGoal } from '../../../shared/types/user';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { formatWeekLabel, isCurrentWeek } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface WeekCardProps {
  goal: WeekGoal;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const WeekCard: React.FC<WeekCardProps> = ({
  goal,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isCurrent = isCurrentWeek(goal.weekStart);

  return (
    <Card className={cn(
      "mb-4 transition-all duration-200",
      isCurrent && "border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10"
    )}>
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              {formatWeekLabel(goal.weekStart, goal.weekEnd)}
            </CardTitle>
            {isCurrent && (
              <Badge className="bg-primary text-primary-foreground">
                Current Week
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </CardContent>
      )}
    </Card>
  );
};