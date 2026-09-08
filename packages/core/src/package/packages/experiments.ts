import { PatchType } from "@foxcord/vulpatch";
import { definePackage } from "../package";

export default definePackage({
	name: "Experiments",
	patches: [
		{
			moduleMatch: /static\s*displayName\s*=\s*"DeveloperExperimentStore"/,
			replace: [
				{
					replace: /(isDeveloper:\{[^,]*,get:\(\)=>)([^,]*)/,
					with: "$1true",
				},
			],
			type: PatchType.RegexPatch,
		},
	],
});
