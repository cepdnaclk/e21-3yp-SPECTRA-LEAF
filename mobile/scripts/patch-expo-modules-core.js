const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'adapters',
  'react',
  'permissions',
  'PermissionsService.kt'
);

if (!fs.existsSync(filePath)) {
  process.exit(0);
}

const current = fs.readFileSync(filePath, 'utf8');
const original = 'return requestedPermissions.contains(permission)';
const replacement = 'return requestedPermissions?.contains(permission) == true';

if (current.includes(replacement)) {
  process.exit(0);
}

if (!current.includes(original)) {
  console.warn('[postinstall] Expo modules API 35 patch skipped: target line not found.');
  process.exit(0);
}

fs.writeFileSync(filePath, current.replace(original, replacement));
console.log('[postinstall] Patched Expo modules permission lookup for Android API 35.');
