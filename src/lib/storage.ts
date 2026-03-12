// Persistent localStorage wrapper for Smart Park AI
// All parking data persists across page reloads

const STORAGE_KEYS = {
  SLOTS: 'smartpark_slots',
  LOGS: 'smartpark_vehicle_logs',
  SESSIONS: 'smartpark_active_sessions',
  RESERVATIONS: 'smartpark_reservations',
  NOTIFICATIONS: 'smartpark_notifications',
  INITIALIZED: 'smartpark_initialized',
} as const;

// Generic typed storage helpers
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw, (k, v) => {
        // Auto-revive Date strings
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
          return new Date(v);
        }
        return v;
      }) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};

export { STORAGE_KEYS };
