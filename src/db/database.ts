let dbReady = false;

export function isDbReady(): boolean {
  return dbReady;
}

export async function initDatabase(): Promise<void> {
  dbReady = true;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}