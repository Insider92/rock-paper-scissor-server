import { Options } from 'pino-http';
import { Params } from 'nestjs-pino';

const loggerOptions: Options = {
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: {
    colorize: true,
    levelFirst: true,
    translateTime: 'UTC:dd/mm/yyyy h:MM:ss TT Z',
  },
};

export const loggerConfig: Params = {
  pinoHttp: loggerOptions,
};
