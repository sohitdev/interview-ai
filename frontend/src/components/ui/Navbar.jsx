import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { ThemeToggle } from './ThemeToggle.jsx';
import { Button } from './Button.jsx';
import { Sparkle, SignOut } from '@phosphor-icons/react';

export const Navbar = () => {
  const { user, handleLogout: authLogout } = useAuth();
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    await authLogout();
    navigate('/login');
  };

  return (
    <nav className="h-16 border-b border-hairline bg-canvas flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 text-ink font-semibold tracking-tight">
          <Sparkle weight="fill" className="text-primary w-5 h-5" />
          <span>Interview AI</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link to="/interviews">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Previous Interviews</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-body hidden md:inline-block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={onLogoutClick} className="gap-2">
              <SignOut className="w-4 h-4" />
              <span className="hidden md:inline-block">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link to="/register"><Button variant="primary" size="sm">Sign Up</Button></Link>
          </div>
        )}
      </div>
    </nav>
  );
};
