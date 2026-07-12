import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { useAppStore, loadInitialData } from './store';
import ToastContainer from './components/ToastContainer';
import { useToastStore } from './store/toastStore';
import type { UpdateStatus } from './types';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { WelcomeWizard, hasCompletedWizard } from './components/WelcomeWizard';
import { initCrashReporter } from './utils/crashReporter';
import { DashboardSkeleton } from './components/Skeleton';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const ScanResults = lazy(() => import('./pages/ScanResults').then((m) => ({ default: m.ScanResults })));
const History = lazy(() => import('./pages/History').then((m) => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'white', background: '#0F1115', height: '100vh' }}>
          <h2 style={{ color: '#FF6B6B' }}>Something went wrong</h2>
          <pre style={{ color: '#A9B4C2', marginTop: 10 }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentPage } = useAppStore();
  const addToast = useToastStore((s) => s.addToast);
  useKeyboardShortcuts();

  const [showWizard, setShowWizard] = useState(false);
  const [wizardChecked, setWizardChecked] = useState(false);

  useEffect(() => {
    initCrashReporter();
    console.log('CachePilot: App mounted');
    loadInitialData();

    if (!hasCompletedWizard()) {
      setShowWizard(true);
    }
    setWizardChecked(true);

    const api = window.electronAPI;
    if (!api) return;

    api.isAdmin().then((isAdm) => {
      if (!isAdm) {
        const delay = hasCompletedWizard() ? 1500 : 6000;
        setTimeout(() => {
          addToast({
            type: 'warning',
            title: 'Admin Access Recommended',
            message: 'Run CachePilot as administrator for full cleanup access. Some locked files cannot be cleaned without it.',
            duration: 10000,
          });
        }, delay);
      }
    });

    api.onUpdateStatus((status: UpdateStatus) => {
      switch (status.status) {
        case 'available':
          addToast({
            type: 'info',
            title: 'Update Available',
            message: `Version ${status.version} is ready to download`,
            duration: 8000,
          });
          break;
        case 'downloaded':
          addToast({
            type: 'success',
            title: 'Update Downloaded',
            message: `Version ${status.version} will be installed on restart`,
            duration: 8000,
          });
          break;
        case 'error':
          addToast({
            type: 'error',
            title: 'Update Error',
            message: status.message,
            duration: 6000,
          });
          break;
      }
    });
  }, []);

  if (!wizardChecked) return null;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PageErrorBoundary pageName="Dashboard"><Dashboard /></PageErrorBoundary>;
      case 'scan':
        return <PageErrorBoundary pageName="Scan Results"><ScanResults /></PageErrorBoundary>;
      case 'history':
        return <PageErrorBoundary pageName="History"><History /></PageErrorBoundary>;
      case 'settings':
        return <PageErrorBoundary pageName="Settings"><Settings /></PageErrorBoundary>;
      default:
        return <PageErrorBoundary pageName="Dashboard"><Dashboard /></PageErrorBoundary>;
    }
  };

  return (
    <>
      {showWizard && <WelcomeWizard onComplete={() => setShowWizard(false)} />}
      <div className="dark h-screen w-screen flex overflow-hidden" style={{ background: 'rgb(15, 17, 21)', color: 'rgb(232, 237, 245)' }}>
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<DashboardSkeleton />}>
            {renderPage()}
          </Suspense>
        </main>
        <ToastContainer />
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
