export default () => ({
    NODE_ENV: process.env.NODE_ENV,
    port: parseInt(process.env.SERVER_PORT, 10) || 3000,
    prefix: process.env.SERVER_PREFIX || '',
  });