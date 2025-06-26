import { Users, Sparkles, User, Briefcase } from 'lucide-react';
import { DomainCard } from './domain-card';
import type { Scores } from './dashboard';

interface DomainScoresProps {
  scores: Scores;
}

export function DomainScores({ scores }: DomainScoresProps) {
  const domainData = [
    {
      title: 'Social',
      icon: Users,
      score: scores.social,
      description: "Connections & community.",
    },
    {
      title: 'Personal',
      icon: User,
      score: scores.personal,
      description: "Growth, hobbies & well-being.",
    },
    {
      title: 'Professional',
      icon: Briefcase,
      score: scores.professional,
      description: "Career, skills & finances.",
    },
    {
      title: 'Spiritual',
      icon: Sparkles,
      score: scores.spiritual,
      description: "Meaning, purpose & inner peace.",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {domainData.map((domain) => (
        <DomainCard key={domain.title} {...domain} />
      ))}
    </div>
  );
}
