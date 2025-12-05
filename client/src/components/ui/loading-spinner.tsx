import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={cn(
        "btk-spinner rounded-full border-muted",
        sizeClasses[size],
        className
      )}
      style={{ borderTopColor: 'hsl(var(--primary))' }}
      data-testid="loading-spinner"
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm btk-backdrop-enter"
      data-testid="loading-overlay"
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-muted-foreground btk-slide-up">{message}</p>
      )}
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 btk-page-enter"
      data-testid="page-loading"
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
