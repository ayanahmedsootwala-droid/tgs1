import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  environment: import.meta.env.MODE,
});

// Service Worker registration with safe environment checking
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Only register service worker if standalone or top window, not inside sandboxed preview iframes
  const isPreviewIframe = window.self !== window.top;
  if (!isPreviewIframe && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('TGS PWA Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('TGS PWA Service Worker skipped:', err);
        });
    });
  } else if (isPreviewIframe) {
    // Unregister any active service worker in preview iframe to avoid caching conflicts
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

const GlobalErrorFallback = ({ error, resetError }: ErrorFallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="max-w-md w-full bg-card border border-border p-6 rounded-2xl shadow-lg text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
        💈
      </div>
      <h2 className="text-lg font-bold tracking-tight">The Grooming Studio TGS</h2>
      <p className="text-xs text-muted-foreground">
        Application state encountered an unexpected interruption.
      </p>
      {error && (
        <div className="p-2.5 bg-muted rounded-lg text-left text-[11px] font-mono text-muted-foreground overflow-auto max-h-24">
          {error.message || String(error)}
        </div>
      )}
      <div className="flex gap-2 justify-center pt-2">
        <button
          onClick={() => {
            if (resetError) resetError();
            else window.location.reload();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Refresh Application
        </button>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('tgs_cached_invoices');
              localStorage.removeItem('tgs_offline_sync_queue');
            } catch {}
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Reset View
        </button>
      </div>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={({ error, resetError }) => <GlobalErrorFallback error={error as Error} resetError={resetError} />}>
    <AppWrapper>
      <App />
    </AppWrapper>
  </Sentry.ErrorBoundary>
);
