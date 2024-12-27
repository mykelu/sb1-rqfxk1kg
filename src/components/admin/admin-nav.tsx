import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const ADMIN_LINKS = [
  { 
    href: '/admin', 
    icon: LayoutDashboard, 
    label: 'Dashboard',
    description: 'Overview and key metrics'
  },
  { 
    href: '/admin/users', 
    icon: Users, 
    label: 'Users',
    description: 'Manage user accounts'
  },
  { 
    href: '/admin/consents', 
    icon: Shield, 
    label: 'Consents',
    description: 'Review and manage consents'
  },
  { 
    href: '/admin/assessments', 
    icon: FileText, 
    label: 'Assessments',
    description: 'View assessment results'
  },
  { 
    href: '/admin/notifications', 
    icon: Bell, 
    label: 'Notifications',
    description: 'System notifications'
  },
  { 
    href: '/admin/support', 
    icon: HelpCircle, 
    label: 'Support',
    description: 'Help and support tools'
  },
  { 
    href: '/admin/settings', 
    icon: Settings, 
    label: 'Settings',
    description: 'System configuration'
  }
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {ADMIN_LINKS.map(({ href, icon: Icon, label, description }) => (
        <Link
          to={href}
          key={href}
          className={cn(
            "w-full text-left px-4 py-3 rounded-lg transition-colors",
            "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
            location.pathname === href ? "bg-accent" : "hover:bg-accent/10",
            "group relative"
          )}
        >
          <div
            className={cn(
              "w-full flex justify-between items-center",
              "group-hover:translate-x-1 transition-transform duration-200"
            )}
          >
            <div className="flex items-center space-x-3">
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                location.pathname === href ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 opacity-0 transition-all",
              "group-hover:opacity-100",
              location.pathname === href ? "opacity-100" : ""
            )} />
          </div>
        </Link>
      ))}
    </nav>
  );
}