import log from 'electron-log';
import path from 'path';
import fs from 'fs';

const MAX_LOG_SIZE = 10 * 1024 * 1024;
const MAX_LOG_FILES = 5;

function ensureLogDir(logPath: string) {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function rotateLogs(logDir: string, baseName: string) {
  try {
    if (!fs.existsSync(logDir)) return;
    const files = fs.readdirSync(logDir)
      .filter((f) => f.startsWith(baseName) && f.endsWith('.log'))
      .sort()
      .reverse();

    for (const file of files) {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_LOG_SIZE) {
        const match = file.match(/\.(\d+)\.log$/);
        const nextIndex = match ? parseInt(match[1]) + 1 : 1;
        const newName = `${baseName}.${nextIndex}.log`;
        fs.renameSync(filePath, path.join(logDir, newName));
      }
    }

    const allLogs = fs.readdirSync(logDir)
      .filter((f) => f.startsWith(baseName) && f.endsWith('.log'))
      .sort()
      .reverse();

    for (let i = MAX_LOG_FILES; i < allLogs.length; i++) {
      fs.unlinkSync(path.join(logDir, allLogs[i]));
    }
  } catch {}
}

const logPath = log.transports.file.getFile().path;
const logDir = path.dirname(logPath);

log.transports.file.resolvePath = () => {
  ensureLogDir(logPath);
  rotateLogs(logDir, 'main');
  return path.join(logDir, 'main.log');
};

log.transports.file.level = 'info';
log.transports.console.level = 'info';

log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

export const mainLog = log;
export const updateLog = log;
export const scannerLog = log;

export default log;
