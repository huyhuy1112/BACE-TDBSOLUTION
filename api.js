/**
 * Optional second cPanel Node app for Nest API.
 * Application root: same repo, startup file: api.js
 *
 * Before start:
 *   npm run build -w @bace/shared
 *   npm run build -w @bace/api
 *   npm run db:generate
 */
process.env.API_PORT = process.env.PORT || process.env.API_PORT || '3001';
require('./apps/api/dist/main');
