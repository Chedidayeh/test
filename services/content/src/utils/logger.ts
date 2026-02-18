interface LogMetadata {
  [key: string]: any;
}

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL || "info";
  return LogLevel[level.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO;
}

function shouldLog(messageLevel: LogLevel): boolean {
  const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
  const currentLevel = getLogLevel();
  return levels.indexOf(messageLevel) <= levels.indexOf(currentLevel);
}

function formatLog(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
): string {
  const timestamp = new Date().toISOString();
  const base = {
    timestamp,
    level,
    message,
  };

  const log = metadata ? { ...base, ...metadata } : base;
  return JSON.stringify(log);
}

function getConsoleColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.ERROR:
      return "\x1b[31m"; // Red
    case LogLevel.WARN:
      return "\x1b[33m"; // Yellow
    case LogLevel.INFO:
      return "\x1b[36m"; // Cyan
    case LogLevel.DEBUG:
      return "\x1b[35m"; // Magenta
    default:
      return "\x1b[0m"; // Reset
  }
}

export const logger = {
  error: (message: string, metadata?: LogMetadata): void => {
    if (shouldLog(LogLevel.ERROR)) {
      const log = formatLog(LogLevel.ERROR, message, metadata);
      console.error(getConsoleColor(LogLevel.ERROR) + log + "\x1b[0m");
    }
  },

  warn: (message: string, metadata?: LogMetadata): void => {
    if (shouldLog(LogLevel.WARN)) {
      const log = formatLog(LogLevel.WARN, message, metadata);
      console.warn(getConsoleColor(LogLevel.WARN) + log + "\x1b[0m");
    }
  },

  info: (message: string, metadata?: LogMetadata): void => {
    if (shouldLog(LogLevel.INFO)) {
      const log = formatLog(LogLevel.INFO, message, metadata);
      console.log(getConsoleColor(LogLevel.INFO) + log + "\x1b[0m");
    }
  },

  debug: (message: string, metadata?: LogMetadata): void => {
    if (shouldLog(LogLevel.DEBUG)) {
      const log = formatLog(LogLevel.DEBUG, message, metadata);
      console.debug(getConsoleColor(LogLevel.DEBUG) + log + "\x1b[0m");
    }
  },
};
