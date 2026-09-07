import type {WebpackFactory, WebpackRequire} from "./types";
import * as vulpatch from '@foxcord/vulpatch';
import { vulpmap } from './vulpmap';
import { webpack } from './hookWebpack';

export var patches = {
    regexPatches: [] as vulpatch.RegexPatch[],
    astPatches: [] as vulpatch.AstPatch[]
};

export function replaceSource(patch: vulpatch.UniformPatch, source: string) {
    patch.source = source;
}

const cachedPatchedFactories: Record<number, WebpackFactory> = [];

export function setupPatches(require: WebpackRequire) {
    for (const [id, module] of Object.entries(require.m)) {
        const mId = Number(id);

        require.m[mId] = makeLazilyPatchedFactory(module, mId);
    }

    require.m = proxyModules(require);
}

export function proxyModules(require: WebpackRequire) {
    return new Proxy(require.m, {
        set(target, prop, value, recv) {
            if (typeof prop === 'symbol') return Reflect.set(target, prop, value, recv);
            const mId = Number(prop);
            if (!Number.isInteger(mId)) return Reflect.set(target, prop, value, recv);

            return Reflect.set(target, mId, makeLazilyPatchedFactory(value, mId));
        }
    });
}

function makeLazilyPatchedFactory(factory: WebpackFactory, id: number): WebpackFactory {
    return (...args) => {
        const cachedEntry = cachedPatchedFactories[id];

        if (cachedEntry) {
            return cachedEntry(...args);
        }

        const patched = patchFactory(id, factory);

        cachedPatchedFactories[id] = patched;
        patched(...args);

        vulpmap.checkModule(webpack!.webpackCache[id], cachedPatchedFactories[id]);
    }
}

function patchFactory(id: number, factory: WebpackFactory): WebpackFactory {
    const pristine = String(factory);
    const patched = vulpatch.applyPatches(pristine, patches);

    const stringifiedBody = `${patched}[${id}](...args)\n//# sourceURL=PatchedChunk${id}.js`;

    return Function("...args", stringifiedBody) as WebpackFactory;
}