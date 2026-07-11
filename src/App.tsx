import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ScanResults } from './pages/ScanResults';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { useAppStore, loadInitialData } from './store';
import ToastContainer from './components/ToastContainer';
import { useToastStore } from './store/toastStore';
import type { UpdateStatus } from './types';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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

  React.useEffect(() => {
    console.log('CachePilot: App mounted');
    loadInitialData();

    const api = window.electronAPI;
    if (!api) return;

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
    <div className="dark h-screen w-screen flex overflow-hidden" style={{ background: 'rgb(15, 17, 21)', color: 'rgb(232, 237, 245)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderPage()}
      </main>
      <ToastContainer />
    </div>
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