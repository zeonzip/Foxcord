import { PatchType } from "@foxcord/vulpatch";
import { definePackage } from "../package";

export default definePackage({
	name: "Privacy",
	patches: [
		// Prevents tracking client mod usage
		{
			moduleMatch:
				/return\s+(?=[\w$.!=|\s]*\bBdApi\b)(?=[\w$.!=|\s]*\bVencord\b)null\s*!=\s*[\w$]+(?:\.[\w$]+)+(?:\s*\|\|\s*null\s*!=\s*[\w$]+(?:\.[\w$]+)+)*/,
			replace: [
				{
					replace:
						/return\s+(?=[\w$.!=|\s]*\bBdApi\b)(?=[\w$.!=|\s]*\bVencord\b)null\s*!=\s*[\w$]+(?:\.[\w$]+)+(?:\s*\|\|\s*null\s*!=\s*[\w$]+(?:\.[\w$]+)+)*/,
					with: "return false",
				},
			],
			type: PatchType.RegexPatch,
		},
		// prevents pesky "science" logging
		{
			moduleMatch: /static\s*displayName\s*=\s*"AnalyticsTrackingStore"/,
			replace: [
				{
					replace:
						/\.(?:handleConnectionOpen|handleConnectionClosed|handleFingerprint|handleTrack|handleSetAnalyticsToken)\s*=\s*function\s*([^)]*\))\s*{/g,
					with: "$&return;",
				},
			],
			type: PatchType.RegexPatch,
		},
	],
});
