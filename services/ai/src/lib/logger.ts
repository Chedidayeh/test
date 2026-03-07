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
    service: "gateway",
    message,
  };

  if (metadata) {
    return JSON.stringify({ ...base, ...metadata });
  }
  return JSON.stringify(base);
}

export const logger = {
  error: (message: string, metadata?: LogMetadata) => {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatLog(LogLevel.ERROR, message, metadata));
    }
  },
  warn: (message: string, metadata?: LogMetadata) => {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatLog(LogLevel.WARN, message, metadata));
    }
  },
  info: (message: string, metadata?: LogMetadata) => {
    if (shouldLog(LogLevel.INFO)) {
      console.log(formatLog(LogLevel.INFO, message, metadata));
    }
  },
  debug: (message: string, metadata?: LogMetadata) => {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(formatLog(LogLevel.DEBUG, message, metadata));
    }
  },
};
