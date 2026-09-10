import { webFrame } from 'electron';
import { readFileSync } from 'fs';
import { join } from 'path';

const originalPreload = process.argv.find(a => a.startsWith("foxcord-preload-arg:"))!.split(":")[1];
webFrame.executeJavaScript(
    readFileSync(join(__dirname, "preload-hook.js")).toString()
).catch(() => {})

require(originalPreload)