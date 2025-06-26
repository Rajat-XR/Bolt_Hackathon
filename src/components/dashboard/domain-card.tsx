import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { LucideIcon } from 'lucide-react';

interface DomainCardProps {
  title: string;
  icon: LucideIcon;
  score: number;
  description: string;
}

const colorVariants: { [key: string]: { text: string, progress: string, bg: string } } = {
  Social: { text: "text-chart-1", progress: "bg-chart-1", bg: "bg-chart-1/5" },
  Personal: { text: "text-chart-2", progress: "bg-chart-2", bg: "bg-chart-2/5" },
  Professional: { text: "text-chart-3", progress: "bg-chart-3", bg: "bg-chart-3/5" },
  Spiritual: { text: "text-chart-4", progress: "bg-chart-4", bg: "bg-chart-4/5" },
};

export function DomainCard({ title, icon: Icon, score, description }: DomainCardProps) {
  const colors = colorVariants[title] ?? colorVariants['Social'];
  
  return (
    <Card className={`overflow-hidden border-l-4 ${colors.bg}`} style={{ borderLeftColor: `hsl(var(--${title === 'Social' ? 'chart-1' : title === 'Personal' ? 'chart-2' : title === 'Professional' ? 'chart-3' : 'chart-4'}))`}}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colors.text}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{score}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Progress value={score} className="mt-4 h-2" indicatorClassName={colors.progress} />
      </CardContent>
    </Card>
  );
}
