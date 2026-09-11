import { defineGlobal } from "../api/global";
import { log } from "../log";
import { registerHook } from "../webpack/hookWebpack";

log("Initializing...");

import "../webpack/discord/modules";
import { initPackages } from "@foxcord/core/package/package";
import { registerPromises } from '@/webpack/discord/promises.ts';

defineGlobal();
registerPromises();
initPackages();
registerHook();
