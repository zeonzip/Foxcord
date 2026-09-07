import { patches, replaceSource } from '../webpack/patch';
import corePlugin from './packages/core/core';
import privacyPlugin from './packages/privacy';
import experimentsPlugin from './packages/experiments';
import testPlugin from './packages/test';
import { PatchType, type UniformPatch } from '@foxcord/vulpatch';
import { FoxcordStore } from '@foxcord/core/utils/store';
import { webpack } from '@foxcord/core/webpack/hookWebpack';

export interface PackageInterface {
    name: string;
    patches?: UniformPatch[];
    core?: boolean;
    load?: () => void;
    unload?: () => void;
    [key: string]: any;
}

export type PackageEntry = {
    package: PackageInterface;
    toggled: boolean;
    loaded: boolean;
}

class PackageStore extends FoxcordStore {
    private packages: Map<string, PackageEntry> = new Map();
    private pendingPackages: number = 0;

    register(pack: PackageInterface, toggled = pack.core === true) {
        this.rawRegister(pack, toggled);
        this.emit();
    }

    private rawRegister(pack: PackageInterface, toggled = pack.core === true) {
        if (this.packages.has(pack.name)) return;

        this.packages.set(pack.name, { package: pack, toggled, loaded: toggled && (isStartup() || hotLoadable(pack)) });
        if (toggled) {
            if (isStartup()) {
                startupLoadPackage(pack);
            } else if (hotLoadable(pack)) {
                hotLoadPackage(pack);
            } else {
                this.pendingPackages++;
            }
        }
    }

    registerBatch(...packs: PackageInterface[]) {
        for (const pack of packs) {
            this.rawRegister(pack);
        }

        this.emit();
    }

    get(name: string) {
        return this.packages.get(name);
    }

    setToggled(name: string, toggle: boolean) {
        const entry = this.packages.get(name);
        if (!entry) return;
        if (entry.package.core) return;
        if (entry.toggled == toggle) return;

        entry.toggled = toggle;

        if (!hotLoadable(entry.package)) {
            if (toggle == entry.loaded) {
                this.pendingPackages--;
            } else {
                this.pendingPackages++;
            }
        } else if (toggle) {
            hotLoadPackage(entry.package);
            entry.loaded = true;
        } else {
            hotUnloadPackage(entry.package);
            entry.loaded = false;
        }

        this.emit();
    }

    get entries() {
        return [...this.packages];
    }

    get entriesMap() {
        return new Map(this.packages);
    }

    get isPending() {
        return this.pendingPackages > 0;
    }
}

export const packageStore = new PackageStore();

export function initPackages() {
    packageStore.registerBatch(
        corePlugin,
        privacyPlugin,
        experimentsPlugin,
        testPlugin,
    );
}

function hotLoadable(pack: PackageInterface) {
    return pack.patches == undefined;
}

function isStartup(): boolean {
    return webpack == undefined;
}

export function definePackage(plugin: PackageInterface): PackageInterface {
    plugin.patches?.forEach(patch => {
        replaceSource(patch, plugin.name);

        if (patch.type == PatchType.RegexPatch) {
            patch.replace.forEach(replace => {
                replace.with = replaceSelfRef(plugin.name, replace.with);
            })
        }
    });

    return plugin;
}

export function replaceSelfRef(name: string, replace: string) {
    return replace.replaceAll("$&self", accessPackageRuntime(name));
}

export function accessPackageRuntime(name: string) {
    return `window.BSJD.p.get(${JSON.stringify(name)}).package`;
}

export function hotLoadPackage(pack: PackageInterface) {
    if (!hotLoadable(pack)) return;

    if (pack.load) {
        pack.load();
    }
}

export function hotUnloadPackage(pack: PackageInterface) {
    if (!hotLoadable(pack)) return;

    if (pack.unload) {
        pack.unload();
    }
}

export function startupLoadPackage(pack: PackageInterface) {
    if (!isStartup()) return;

    const pluginPatches = pack.patches || [];

    pluginPatches.forEach(patch => replaceSource(patch, pack.name));

    patches.regexPatches.push(...pluginPatches.filter((patch) => patch.type == PatchType.RegexPatch));
    patches.astPatches.push(...pluginPatches.filter((patch) => patch.type == PatchType.AstPatch));

    if (pack.load) {
        pack.load();
    }
}