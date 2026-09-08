export interface WebpackRequire {
	(module: number): WebpackCacheObject["exports"];
	m: WebpackModules;
	c: WebpackCache;
	p: string;
}

export type WebpackModules = Record<number, WebpackFactory>;
export type WebpackFactory = (
	moduleObj: WebpackCacheObject,
	exports: WebpackCacheObject["exports"],
	require: WebpackRequire,
) => void;
export type WebpackCache = Record<number, WebpackCacheObject>;
export interface WebpackCacheObject {
	id: number;
	loaded: boolean;
	exports: Object;
}

export type Webpack = {
	webpackCache: WebpackCache;
	webpackRequire: WebpackRequire;
	webpackFactories: WebpackModules;
};
