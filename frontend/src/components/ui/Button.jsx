import React from 'react';
import { motion } from 'motion/react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'outline'
  size = 'md', // 'sm', 'md', 'lg', 'icon'
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90',
    secondary: 'bg-canvas text-ink shadow-[0_0_0_1px_var(--color-hairline)] hover:bg-canvas-soft',
    ghost: 'bg-transparent text-ink hover:bg-canvas-soft',
    outline: 'bg-transparent text-ink shadow-[0_0_0_1px_var(--color-hairline-strong)] hover:bg-canvas-soft',
    danger: 'bg-error text-white hover:bg-error/90',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-sm',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-pill', // marketing scale pill
    icon: 'h-10 w-10 rounded-full',
  };

  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
