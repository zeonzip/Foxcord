import type * as Electron from "electron";
import { join } from "path";

const originalElectron: typeof Electron = require('electron');
const electronCached = require.cache['electron']! ;

let patchedBrowserWindow: typeof originalElectron.BrowserWindow | undefined;

Object.defineProperty(electronCached, 'exports', {
    value: new Proxy(originalElectron, {
        get(target, prop) {
            if (prop !== 'BrowserWindow') return Reflect.get(target, prop);

            patchedBrowserWindow ??= new Proxy(target.BrowserWindow, {
                construct(target, args, nt) {
                    const [config] = args;

                    if (!config.webPreferences.preload.includes("mainScreenPreload.js")) return Reflect.construct(target, args);

                    const originalPreload = config.webPreferences.preload;

                    config.webPreferences.preload = join(__dirname, "foxcord-trampoline.js");
                    if (config.webPreferences.additionalArguments) {
                        config.webPreferences.additionalArguments.push(`foxcord-preload-arg:${originalPreload}`);
                    } else {
                        config.webPreferences.additionalArguments = [`foxcord-preload-arg:${originalPreload}`];
                    }

                    return Reflect.construct(target, args, nt);
                }
            });

            return patchedBrowserWindow;
        }
    }),
    writable: true,
    configurable: true,
    enumerable: true
});

require(join(__dirname, "../discord.asar"));