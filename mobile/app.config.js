const fs = require('fs');
const path = require('path');

function readDotEnvValue(name) {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return undefined;

  const line = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find(entry => entry.trim().startsWith(`${name}=`));

  if (!line) return undefined;
  return line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
}

function normalizeApiBaseUrl(value) {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return undefined;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const DEFAULT_API_BASE_URL = 'https://ptao6erh2gi2z32eqy5rjj4gfu0pksbi.lambda-url.ap-south-1.on.aws/api';

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.EXPO_PUBLIC_API_BASE_URL ||
        readDotEnvValue('EXPO_PUBLIC_API_BASE_URL') ||
        DEFAULT_API_BASE_URL
    ),
  },
});
