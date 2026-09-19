
export const Card = ({
  children,
  className = '',
  elevation = '1', // 0, 1, 2, 3, 4, 5
  padding = 'lg', // 'none', 'sm', 'md', 'lg', 'xl'
  ...props
}) => {
  const baseStyles = 'bg-canvas text-ink rounded-lg overflow-hidden relative';
  
  const elevations = {
    '0': '',
    '1': 'shadow-[var(--shadow-level-1)]',
    '2': 'shadow-[var(--shadow-level-2)]',
    '3': 'shadow-[var(--shadow-level-3)]',
    '4': 'shadow-[var(--shadow-level-4)]',
    '5': 'shadow-[var(--shadow-level-5)]',
  };

  const paddings = {
    'none': 'p-0',
    'sm': 'p-4',
    'md': 'p-6',
    'lg': 'p-8',
    'xl': 'p-10',
  };

  return (
    <div className={`${baseStyles} ${elevations[elevation]} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};
