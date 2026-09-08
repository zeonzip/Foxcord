import type { PackageEntry, PackageStore } from "@/package/package.ts";

const currInstance = retrieveObject();
const objectKey = "foxcord-data";

type StorageObject = {
	plugins?: Map<string, PackageEntry>;
};

export function storePackages(store: PackageStore) {
	currInstance.plugins = store.entriesMap;
}

export function updateSave() {
	localStorage.setItem(objectKey, JSON.stringify(prepareJson(currInstance)));
}

export function retrieveObject(): StorageObject {
	const retrieved = localStorage.getItem(objectKey);

	if (!retrieved) {
		return {};
	}

	return objectify(JSON.parse(retrieved as string));
}

function objectify(data: any): StorageObject {
	if (data.plugins) {
		const origPlugins = data.plugins;

		data.plugins = new Map(Object.entries(origPlugins));
	}

	return data;
}

function prepareJson(data: StorageObject) {
	return {
		...data,
		plugins: data.plugins ? Object.fromEntries(data.plugins) : undefined,
	};
}
