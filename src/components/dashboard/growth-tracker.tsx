'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ScoreHistory } from './dashboard';

interface GrowthTrackerProps {
  scoreHistory: ScoreHistory[];
}

const chartConfig = {
  social: { label: 'Social', color: 'hsl(var(--chart-1))' },
  personal: { label: 'Personal', color: 'hsl(var(--chart-2))' },
  professional: { label: 'Professional', color: 'hsl(var(--chart-3))' },
  spiritual: { label: 'Spiritual', color: 'hsl(var(--chart-4))' },
};

export function GrowthTracker({ scoreHistory }: GrowthTrackerProps) {
  const data = scoreHistory.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ...entry.scores
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Over Time</CardTitle>
        <CardDescription>Visualize your progress across all life domains.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelClassName="font-medium" />} />
            <defs>
              <linearGradient id="fillSocial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-social)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-social)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="fillPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-personal)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-personal)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="fillProfessional" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-professional)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-professional)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="fillSpiritual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spiritual)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-spiritual)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="social" stroke="var(--color-social)" strokeWidth={2} fillOpacity={1} fill="url(#fillSocial)" />
            <Area type="monotone" dataKey="personal" stroke="var(--color-personal)" strokeWidth={2} fillOpacity={1} fill="url(#fillPersonal)" />
            <Area type="monotone" dataKey="professional" stroke="var(--color-professional)" strokeWidth={2} fillOpacity={1} fill="url(#fillProfessional)" />
            <Area type="monotone" dataKey="spiritual" stroke="var(--color-spiritual)" strokeWidth={2} fillOpacity={1} fill="url(#fillSpiritual)" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
