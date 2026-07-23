import { existsSync, writeFileSync } from "node:fs";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const configPath = "js/config.js";

if (url && publishableKey) {
  writeFileSync(
    configPath,
    `window.HSB_SUPABASE_CONFIG = ${JSON.stringify({ url, publishableKey }, null, 2)};\n`
  );
} else if (!existsSync(configPath)) {
  throw new Error(
    "Create js/config.js from js/config.example.js, or set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY."
  );
}
