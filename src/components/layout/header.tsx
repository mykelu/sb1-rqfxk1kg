import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { signOut } from '@/lib/auth';
import { UserGreeting } from './user-greeting';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePath = useCallback((path: string) => 
    location.pathname === path, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback navigation
      window.location.href = '/';
    }
  };

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Mental Health Support Platform
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex space-x-4 items-center">
          {user ? (
            <>
              <UserGreeting />
              <Link to="/assessments" className="inline-block">
                <Button 
                  variant="ghost" 
                  className={cn(isActivePath('/assessments') && "bg-accent")}
                >
                  Assessments
                </Button>
              </Link>
              <Link to="/appointments" className="inline-block">
                <Button 
                  variant="ghost"
                  className={cn(isActivePath('/appointments') && "bg-accent")}
                >
                  Appointments
                </Button>
              </Link>
              <Link to="/resources" className="inline-block">
                <Button 
                  variant="ghost"
                  className={cn(isActivePath('/resources') && "bg-accent")}
                >
                  Resources
                </Button>
              </Link>
              <Link to="/support" className="inline-block">
                <Button 
                  variant="ghost"
                  className={cn(isActivePath('/support') && "bg-accent")}
                >
                  Get Support
                </Button>
              </Link>
              <Link to="/profile" className="inline-block">
                <Button 
                  variant="ghost"
                  className={cn(isActivePath('/profile') && "bg-accent")}
                >
                  Profile
                </Button>
              </Link>
              <NotificationBell />
              {userRole === 'admin' && (
                <Link to="/admin/consents" className="inline-block">
                  <Button 
                    variant="ghost"
                    className={cn(isActivePath('/admin/consents') && "bg-accent")}
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <Button onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/signup" className="inline-block">
                <Button variant="ghost">Register</Button>
              </Link>
              <Link to="/login" className="inline-block">
                <Button>Login</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
      
      {/* Mobile navigation */}
      <nav className={`
        lg:hidden fixed inset-0 z-50 bg-white transform transition-transform duration-200 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="text-xl font-bold text-primary">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {user ? (
                <><div className="mb-4">
                    <UserGreeting />
                  </div>
                  <Link
                    to="/assessments"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        isActivePath('/assessments') && "bg-accent"
                      )}
                    >
                      Assessments
                    </Button>
                  </Link>
                  <Link
                    to="/appointments"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        isActivePath('/appointments') && "bg-accent"
                      )}
                    >
                      Appointments
                    </Button>
                  </Link>
                  <Link
                    to="/resources"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        isActivePath('/resources') && "bg-accent"
                      )}
                    >
                      Resources
                    </Button>
                  </Link>
                  <Link
                    to="/support"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        isActivePath('/support') && "bg-accent"
                      )}
                    >
                      Get Support
                    </Button>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="block w-full mb-2"
                  >
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start",
                        isActivePath('/profile') && "bg-accent"
                      )}
                    >
                      Profile
                    </Button>
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      to="/admin/consents"
                      onClick={closeMenu}
                      className="block w-full"
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button variant="ghost" className="w-full">
                      Register
                    </Button>
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button className="w-full">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}