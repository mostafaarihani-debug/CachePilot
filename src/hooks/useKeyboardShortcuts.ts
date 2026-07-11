import { useEffect } from 'react';
import { useAppStore } from '../store';

export function useKeyboardShortcuts() {
  const { currentPage, setCurrentPage } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'r') {
        e.preventDefault();
        if (currentPage !== 'scan') {
          setCurrentPage('scan');
        }
      }

      if (isCtrl && e.key === '1') {
        e.preventDefault();
        setCurrentPage('dashboard');
      }
      if (isCtrl && e.key === '2') {
        e.preventDefault();
        setCurrentPage('scan');
      }
      if (isCtrl && e.key === '3') {
        e.preventDefault();
        setCurrentPage('history');
      }
      if (isCtrl && e.key === '4') {
        e.preventDefault();
        setCurrentPage('settings');
      }

      if (e.key === 'Escape') {
        const modal = document.querySelector('[data-modal-overlay]');
        if (modal) {
          (modal as HTMLElement).click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, setCurrentPage]);
}
