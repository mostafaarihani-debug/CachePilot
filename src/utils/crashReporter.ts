let initialized = false;

export function initCrashReporter() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('error', (event) => {
    console.error('[CrashReporter:UncaughtError]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[CrashReporter:UnhandledRejection]', {
      reason: event.reason instanceof Error
        ? { message: event.reason.message, stack: event.reason.stack }
        : String(event.reason),
      timestamp: new Date().toISOString(),
    });
  });
}
