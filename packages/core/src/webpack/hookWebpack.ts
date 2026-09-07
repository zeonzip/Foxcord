import {log, throwingError} from "../log";
import type { Webpack, WebpackRequire } from './types';
import {proxyModules, setupPatches} from "./patch";

export var webpack: Webpack | undefined = undefined;
const webpackResolvers = Promise.withResolvers<Webpack>();
export const webpackPromise = webpackResolvers.promise;

function isWebpackRequire(obj: unknown, newPath: string): obj is WebpackRequire {
    const string = String(obj);

    return (
        newPath.startsWith('/assets/') &&
        typeof obj === 'function' &&
        'c' in obj &&
        'm' in obj &&
        string.includes(".exports") &&
        string.includes(".loaded")
    );
}

export function registerHook(posthook?: (require: WebpackRequire) => void) {
    Object.defineProperty(Object.prototype, 'p', {
        set(v) {
            Object.defineProperty(this, 'p', { value: v, writable: true, enumerable: true, configurable: true });

            if (isWebpackRequire(this, String(v))) {
                log("Successfully hooked webpack!");

                if (Object.keys(this.c).length > 0) {
                    throwingError("Expected to hook webpack before any modules were loaded.");
                }

                webpack = {
                    webpackRequire: this,
                    webpackCache: this.c,
                    webpackFactories: this.m
                }

                webpackResolvers.resolve(webpack);

                setupPatches(this);

                if (posthook) {
                    posthook(this);
                }
            }
        },
        get() {
            return undefined;
        }
    })
}