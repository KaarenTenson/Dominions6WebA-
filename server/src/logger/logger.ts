import pino from "pino"
import { pinoHttp } from "pino-http"

const isDev = process.env.NODE_ENV !== "production"

export const logger = pino(
  isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}
)

export const httpLogger = pinoHttp({
  customLogLevel: (res, err) => {
    if (!res || !res.statusCode) return "err"
    if (err || res.statusCode >= 500) return "error"
    if (res.statusCode >= 400) return "warn"
    return "info"
  },
})
