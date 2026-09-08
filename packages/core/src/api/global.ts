import { packageStore } from "../package/package";
import * as Modules from "../webpack/discord/modules";
import * as Stores from "../webpack/discord/stores";
import * as Ui from "../webpack/discord/ui";
import { webpack } from "../webpack/hookWebpack";

export function defineGlobal() {
	Object.defineProperty(window, "Foxcord", {
		value: {
			get webpackRequire() {
				return webpack?.webpackRequire;
			},
			get Stores() {
				return Stores;
			},
			get Modules() {
				return Modules;
			},
			get Ui() {
				return Ui;
			},
			get packages() {
				return packageStore.entriesMap;
			},
		},
	});

	// Shorthand for size optimized patches
	Object.defineProperty(window, "BSJD", {
		value: {
			get r() {
				return Modules.ReactJsxModule;
			},
			get p() {
				return packageStore.entriesMap;
			},
		},
	});
}
