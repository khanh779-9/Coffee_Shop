const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const workspaceRoot = path.resolve(__dirname, '..');
const envPath = path.join(workspaceRoot, '.env');
const outputDir = path.join(workspaceRoot, 'src', 'environments');
const outputPath = path.join(outputDir, 'environment.ts');

const fileEnv = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const parsed = {
  ...fileEnv,
  NG_APP_PRODUCTION: process.env.NG_APP_PRODUCTION || fileEnv.NG_APP_PRODUCTION,
  NG_APP_API_BASE_URL: process.env.NG_APP_API_BASE_URL || fileEnv.NG_APP_API_BASE_URL
};

const environment = {
  production: parsed.NG_APP_PRODUCTION === 'true',
  apiBaseUrl: parsed.NG_APP_API_BASE_URL || 'http://localhost:4000/api'
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  `export const environment = ${JSON.stringify(environment, null, 2)} as const;\n`,
  'utf8'
);

console.log(`Generated ${path.relative(workspaceRoot, outputPath)} from ${fs.existsSync(envPath) ? '.env' : 'defaults'}`);
