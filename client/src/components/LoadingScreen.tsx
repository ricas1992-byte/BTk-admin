import { useState, useEffect, useCallback, memo } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

interface PreloadTask {
  name: string;
  execute: () => Promise<void>;
}

const LoadingScreen = memo(function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }, []);

  const preloadFonts = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    });
  }, []);

  const preloadLocalStorage = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const keys = ['btk_documents', 'btk_courses', 'btk_tasks', 'btk_learning', 'btk_language'];
        keys.forEach(key => localStorage.getItem(key));
        resolve();
      } catch {
        resolve();
      }
    });
  }, []);

  const simulateMinDelay = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const runPreloading = async () => {
      const tasks: PreloadTask[] = [
        { name: 'logo', execute: () => preloadImage('/logo.png') },
        { name: 'favicon', execute: () => preloadImage('/favicon.png') },
        { name: 'fonts', execute: preloadFonts },
        { name: 'localStorage', execute: preloadLocalStorage },
        { name: 'minDelay', execute: () => simulateMinDelay(400) },
      ];

      const totalTasks = tasks.length;
      let completedTasks = 0;

      for (const task of tasks) {
        if (!isMounted) return;
        
        try {
          await task.execute();
        } catch {
          // Continue even if a task fails
        }
        
        completedTasks++;
        const newProgress = Math.min(Math.floor((completedTasks / totalTasks) * 100), 100);
        
        if (isMounted) {
          setProgress(newProgress);
        }
      }

      if (isMounted) {
        setProgress(100);
        setIsComplete(true);
      }
    };

    runPreloading();

    return () => {
      isMounted = false;
    };
  }, [preloadImage, preloadFonts, preloadLocalStorage, simulateMinDelay]);

  useEffect(() => {
    if (isComplete) {
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 150);

      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        onLoadingComplete();
      }, 650);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isComplete, onLoadingComplete]);

  if (isRemoved) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        fadeOut ? 'btk-loading-fadeout' : ''
      }`}
      style={{ backgroundColor: '#FFFFFF' }}
      data-testid="loading-screen"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-xs px-6 btk-slide-up">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="Beyond the Keys"
            className="h-24 w-auto object-contain"
            data-testid="loading-logo"
          />
          <h2 
            className="text-xl font-semibold tracking-tight"
            style={{ color: 'hsl(220, 60%, 15%)' }}
          >
            Beyond the Keys
          </h2>
        </div>

        <div className="w-full space-y-4">
          <div 
            className="relative h-1.5 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: 'hsl(220, 15%, 92%)' }}
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-full btk-progress-bar ${progress < 100 ? 'loading' : ''}`}
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(220, 60%, 20%) 0%, hsl(45, 95%, 55%) 100%)'
              }}
              data-testid="loading-progress-bar"
            />
          </div>
          <div className="text-center">
            <span
              className="text-lg font-medium tabular-nums"
              style={{ color: 'hsl(220, 60%, 20%)' }}
              data-testid="loading-progress-percent"
            >
              {progress}%
            </span>
          </div>
        </div>

        <div className="h-6 flex items-center justify-center">
          {progress < 100 && (
            <div className="flex items-center gap-2.5 btk-page-enter">
              <div 
                className="h-4 w-4 rounded-full border-2 btk-spinner"
                style={{ 
                  borderColor: 'hsl(220, 60%, 20%)',
                  borderTopColor: 'hsl(45, 95%, 55%)'
                }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: 'hsl(220, 30%, 45%)' }}
              >
                {progress < 20 && 'Loading assets...'}
                {progress >= 20 && progress < 40 && 'Loading images...'}
                {progress >= 40 && progress < 60 && 'Preparing fonts...'}
                {progress >= 60 && progress < 80 && 'Loading data...'}
                {progress >= 80 && progress < 100 && 'Almost ready...'}
              </span>
            </div>
          )}
          {progress === 100 && (
            <span 
              className="text-sm font-semibold btk-icon-enter"
              style={{ color: 'hsl(45, 95%, 40%)' }}
            >
              Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default LoadingScreen;
