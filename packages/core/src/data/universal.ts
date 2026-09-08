import { retrieveObject, storePackages } from "@/data/web.ts";
import { packageStore } from "@/package/package.ts";

export function savePackages() {
	storePackages(packageStore);
}

export function retrieveSavedPackages() {
	return retrieveObject().plugins;
}
