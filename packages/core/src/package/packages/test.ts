import { definePackage } from "@foxcord/core/package/package";

export default definePackage({
	name: "Test",
	load() {
		console.log("loaded!");
	},
	unload() {
		console.log("unload!");
	},
});
