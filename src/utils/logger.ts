import { create } from 'zustand';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

interface LoggerStore {
  entries: LogEntry[];
  log: (level: LogLevel, message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  getEntries: () => LogEntry[];
  clear: () => void;
}

const MAX_ENTRIES = 200;

export const useLogger = create<LoggerStore>((set, get) => ({
  entries: [],

  log: (level, message, data) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    set((state) => ({
      entries: [...state.entries.slice(-(MAX_ENTRIES - 1)), entry],
    }));

    const prefix = `[CachePilot:${level.toUpperCase()}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  },

  debug: (message, data) => get().log('debug', message, data),
  info: (message, data) => get().log('info', message, data),
  warn: (message, data) => get().log('warn', message, data),
  error: (message, data) => get().log('error', message, data),

  getEntries: () => get().entries,
  clear: () => set({ entries: [] }),
}));
