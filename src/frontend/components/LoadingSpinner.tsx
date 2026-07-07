type LoadingSpinnerProps = {
  isLoading: boolean;
  className?: string;
  message: string;
  spinnerClassName?: string;
  title?: string;
};

export function LoadingSpinner({ isLoading, className = '', message, spinnerClassName = '', title }: LoadingSpinnerProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className={className} role="status" aria-live="polite">
      <span className={`thinking-spinner${spinnerClassName ? ` ${spinnerClassName}` : ''}`} aria-hidden="true" />
      {title ? <strong>{title}</strong> : null}
      <p>{message}</p>
    </div>
  );
}
