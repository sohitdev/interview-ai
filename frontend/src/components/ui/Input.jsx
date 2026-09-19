import { forwardRef } from "react";

export const Input = forwardRef(({
  label,
  error,
  helperText,
  id,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={generatedId}
        className={`bg-canvas text-ink text-sm rounded-sm px-3 h-10 shadow-[0_0_0_1px_var(--color-hairline)] focus:outline-none focus:shadow-[0_0_0_2px_var(--color-primary)] transition-shadow placeholder:text-mute disabled:opacity-50 disabled:bg-canvas-soft ${error ? 'shadow-[0_0_0_1px_var(--color-error)] focus:shadow-[0_0_0_2px_var(--color-error)]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-error">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-sm text-mute">{helperText}</span>
      )}
    </div>
  );
});
Input.displayName = 'Input';
