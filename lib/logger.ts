import pino from "pino";

// Configure Pino with structured logging
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Format configuration for consistent structure
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: () => {
      return {}; // Remove default pid/hostname
    },
  },

  // Human-readable ISO timestamps
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

  // Production: JSON, Development: Pretty formatted
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "[{service}] {msg}",
      },
    },
  }),

  // Custom message key
  messageKey: "message",

  // Error serialization
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});

/**
 * Create a logger for a specific service/function
 *
 * @param service - The service or function name (e.g., 'chat-api', 'search-service', 'pdf-processor')
 * @returns Logger instance with service context
 *
 * @example
 * // Basic usage
 * const log = createLogger('chat-api');
 * log.info('Processing chat request');
 * // Output: { "timestamp": "2025-10-15T10:30:00.000Z", "level": "info", "service": "chat-api", "message": "Processing chat request" }
 *
 * @example
 * // With additional structured data
 * log.info({ userId: 123, query: 'insurance' }, 'User search completed');
 * // Output: { "timestamp": "...", "level": "info", "service": "chat-api", "message": "User search completed", "userId": 123, "query": "insurance" }
 *
 * @example
 * // Create base logger with request context
 * const requestLogger = log.child({ requestId: 'abc123', userId: 456 });
 * requestLogger.info('Request started');
 * // Output: { "timestamp": "...", "level": "info", "service": "chat-api", "requestId": "abc123", "userId": 456, "message": "Request started" }
 *
 * requestLogger.info({ query: 'insurance' }, 'Search completed');
 * // Output: { "timestamp": "...", "level": "info", "service": "chat-api", "requestId": "abc123", "userId": 456, "query": "insurance", "message": "Search completed" }
 *
 * @example
 * // Error logging
 * log.error({ err: error, userId: 123 }, 'Failed to process request');
 */
export function createLogger(service: string) {
  return logger.child({ service });
}

/**
 * Default logger instance
 * Prefer using createLogger(service) for better context tracking
 */
export default logger;
