// PS: This is a module for handling stores for FOXCORD, and NOT for Discord flux stores.

import { React } from '@foxcord/core/webpack/discord/modules';

export abstract class FoxcordStore {
    private listeners = new Set<() => void>();
    private version = 0;

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => void this.listeners.delete(listener);
    }

    getVersion = () => {
        return this.version;
    }

    protected emit() {
        this.version++;
        this.listeners.forEach(listener => {listener()});
    }

    reactSubscribe() {
        React.useSyncExternalStore(this.subscribe, this.getVersion)
    }
}