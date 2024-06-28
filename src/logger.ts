import { createLogger, format, transports } from 'winston';

interface LogDetails {
  method: string;
  url: string;
  status: number;
  responseBody?: any;
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' })
  ]
});

export const logInfo = (logDetails: LogDetails) => {
  logger.info(logDetails);
};

export const logError = (logDetails: LogDetails) => {
  logger.error(logDetails);
};
