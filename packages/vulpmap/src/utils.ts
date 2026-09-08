import type { ExportsFilter, FactoryFilter } from "./index";

const fullFilterSym = Symbol("fullFilter.sym");

export function makeFullFilter(filter: ExportsFilter): ExportsFilter {
	if (Reflect.has(filter, fullFilterSym)) {
		throw Error(
			`Attempted to double wrap a full filter which can lead to undefined webpack crawling behaviour when dealing with circular dependencies.`,
		);
	}

	const fullFilter: ExportsFilter = (exports) => {
		if (filter(exports)) {
			return true;
		}

		if (
			exports === null ||
			(typeof exports !== "object" && typeof exports !== "function")
		)
			return false;

		for (const entry of Object.values(exports)) {
			if (filter(entry)) {
				return true;
			}
		}

		return false;
	};

	Object.defineProperty(fullFilter, fullFilterSym, {
		get() {
			return true;
		},
		enumerable: true,
		configurable: true,
	});

	return fullFilter;
}

export function isSearchableObj(obj: any) {
	return (typeof obj === "object" || typeof obj === "function") && obj !== null;
}

export const byPropsFilter =
	(...props: string[]): ExportsFilter =>
	(exports) =>
		isSearchableObj(exports) &&
		props.every((prop) => Reflect.has(exports, prop));

export const byFactoryCode =
	(match: string | RegExp): FactoryFilter =>
	(factory) => {
		const stringified = String(factory);

		if (typeof match === "string") {
			return stringified.includes(match);
		} else {
			return match.test(stringified);
		}
	};

export const byStoreName =
	(store: string): ExportsFilter =>
	(exports) =>
		exports?.constructor?.displayName === store;
