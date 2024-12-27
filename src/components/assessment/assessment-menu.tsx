import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Activity, Brain, Smile } from 'lucide-react';

const ASSESSMENTS = [
  { id: 'phq9', name: 'Depression (PHQ-9)', icon: Brain },
  { id: 'gad7', name: 'Anxiety (GAD-7)', icon: Activity },
  { id: 'who5', name: 'Well-Being (WHO-5)', icon: Smile },
  { id: 'wemwbs', name: 'Well-Being (WEMWBS)', icon: Smile }
] as const;

export function AssessmentMenu() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {ASSESSMENTS.map(({ id, name, icon: Icon }) => {
        const isActive = location.pathname === `/assessments/${id}`;
        return (
          <Link
            key={id}
            to={`/assessments/${id}`}
            className="block w-full"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{name}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}