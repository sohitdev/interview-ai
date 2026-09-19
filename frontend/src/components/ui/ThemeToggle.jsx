import { useTheme } from '../../context/theme.context.jsx';
import { Button } from './Button.jsx';
import { Moon, Sun } from '@phosphor-icons/react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className={`text-mute hover:text-ink ${className}`}>
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
};
