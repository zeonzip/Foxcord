import type { Webpack } from '@/webpack/types.ts';

function createPromise<T>(): {
    promise: Promise<T>,
    resolvers: PromiseWithResolvers<T>
} {
    const resolvers = Promise.withResolvers<T>();

    return {
        promise: resolvers.promise,
        resolvers
    }
}

export const webpackPromise = createPromise<Webpack>();
export const discordDomReadyPromise = createPromise<void>();

export function registerPromises() {
    const resolve = () => {
        discordDomReadyPromise.resolvers.resolve();

        document.removeEventListener("DOMContentLoaded", resolve);
    };

    document.addEventListener("DOMContentLoaded", resolve);
}