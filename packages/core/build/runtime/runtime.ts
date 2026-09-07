import type { PackageInterface } from '@/package/package';

declare global {
    interface Window {
        BSJD: {
            r: any;
            p: Map<string, PackageInterface>;
        }
    }
}

export function jsx(...args) {
    return window.BSJD.r.jsx(...args);
}

export function jsxs(...args) {
    return window.BSJD.r.jsxs(...args);
}

export const Fragment = Symbol.for("react.fragment");

export namespace JSX {
    export type Element = {}
    export interface IntrinsicElements {
        [tag: string]: any;
    }
    export interface ElementChildrenAttribute {
        children: {};
    }

    export interface IntrinsicAttributes {
        key?: any;
    }
}