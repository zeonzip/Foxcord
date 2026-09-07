import type {
    Webpack,
    WebpackCache,
    WebpackCacheObject,
    WebpackFactory,
    WebpackModules,
} from '@foxcord/coreTypes';

export * as utils from './utils';

export type ExportsFilter = (exports: any) => boolean;
export type FactoryFilter = (factory: WebpackFactory) => boolean;
export type FullFilter<T> = {
    retrieveModuleRoot: boolean,
    filter: T
}

export enum FilterType {
    ExportsFilter,
    FactoryFilter,
}

export type Mapper = {
    map: (exports: any, builder: MappedModuleBuilder) => void;
} & ({
    filterType: FilterType.ExportsFilter;
    filter: FullFilter<ExportsFilter>;
} | {
    filterType: FilterType.FactoryFilter;
    filter: FactoryFilter;
})

function filterFromCtx(mapper: Mapper, ctx: VulpMapModuleContext): any | false {
    if (mapper.filterType === FilterType.ExportsFilter) {
        if (mapper.filter.filter(ctx.exports)) {
            return ctx.exports;
        }

        const exports = ctx.exports;

        if (exports === null || (typeof exports !== 'object' && typeof exports !== 'function')) return false;

        for (const entry of Object.values(exports)) {
            if (mapper.filter.filter(entry)) {
                if (entry.retrieveModuleRoot) {
                    return ctx.exports;
                } else {
                    return entry;
                }
            }
        }
    } else {
        if (mapper.filter(ctx.factory)) {
            return ctx.exports;
        }
    }
}

export class MappedModuleBuilder {
    public mapped: Record<string, unknown> = {};

    mapProperty(exports: any, property?: string) {
        if (typeof exports !== 'object' && typeof exports !== 'function') return;

        if (property) {
            this.mapped[property] = exports;
        } else {
            this.mapped = exports;
        }
    }

    finish() {
        return this.mapped as MappedModule
    }
}

export class FullExportsFilterBuilder {
    public filter: ExportsFilter;
    public retrieveModuleRoot: boolean = false;

    constructor(filter: ExportsFilter) {
        this.filter = filter;
    }

    retrieveRoot(toggle?: boolean) {
        if (toggle !== undefined) {
            this.retrieveModuleRoot = toggle;
        } else {
            this.retrieveModuleRoot = true;
        }
        return this;
    }

    finish(): FullFilter<ExportsFilter> {
        return {
            filter: this.filter,
            retrieveModuleRoot: this.retrieveModuleRoot,
        }
    }
}

export type MappedModule = Record<string, unknown>;

export class VulpMap {
    public webpack: Webpack | undefined = undefined;
    public webpackPromise: Promise<Webpack>;
    public mappedModules: Map<string, MappedModule> = new Map();
    public mappers: Map<string, [PromiseWithResolvers<MappedModule>, Mapper]> = new Map();

    constructor(public promise: Promise<Webpack>) {
        this.webpackPromise = promise;
    }

    checkModule(module: WebpackCacheObject, factory: WebpackFactory) {
        const ctx = {
            exports: module.exports,
            factory: factory as WebpackFactory,
        }

        for (const [name, [promise, mapper]] of this.mappers) {
            const filtered = filterFromCtx(mapper, ctx);

            if (filtered) {
                const mapped = new MappedModuleBuilder();

                mapper.map(filtered, mapped);

                const finished = mapped.finish();

                this.mappedModules.set(name, finished);
                promise.resolve(finished);
                this.mappers.delete(name);
            }
        }
    }

    async checkModuleAsync(module: WebpackCacheObject) {
        const factory = (await this.retrieveWebpack()).webpackFactories[module.id];

        if (!factory) {
            throw Error(`Expected cached module ${module.id} to have a present factory in weboackFactories.`);
        }

        this.checkModule(module, factory);
    }

    async retrieveWebpack() {
        return this.webpack ??= await this.webpackPromise;
    }

    async registerMapper(name: string, mapper: Mapper) {
        const resolvers = Promise.withResolvers<MappedModule>();
        this.mappers.set(name, [resolvers, mapper]);

        return resolvers.promise;
    }

    async registerMapperAndSearch(name: string, mapper: Mapper) {
        let found ;

        if (this.webpack) {
            const webpack = this.webpack;

            for (const [id, cached] of Object.entries(webpack.webpackCache)) {
                const factory = webpack.webpackFactories[cached.id];

                if (!factory) {
                    throw Error(`Expected cached module ${id} to have a present factory in weboackFactories.`);
                }

                const ctx = {
                    exports: cached.exports,
                    factory: factory,
                };

                if (filterFromCtx(mapper, ctx)) {
                    const mapped = new MappedModuleBuilder();

                    mapper.map(ctx.exports, mapped);

                    const finished = mapped.finish();

                    this.mappedModules.set(name, finished);

                    found = finished;
                    break;
                }
            }
        }

        if (found) {
            return Promise.resolve(found);
        }

        return this.registerMapper(name, mapper);
    }

    getMapped(name: string) {
        return this.mappedModules.get(name);
    }
}

export type VulpMapModuleContext = {
    exports: WebpackCacheObject['exports'];
    factory: WebpackFactory;
};