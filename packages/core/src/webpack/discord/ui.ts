import { FilterType } from "@foxcord/vulpmap";
import { utils, vulpmap } from "../vulpmap";

export var Button: any;

vulpmap
	.registerMapperAndSearch("UI/Button", {
		filterType: FilterType.FactoryFilter,
		filter: utils.byFactoryCode("buttonChildren,"),
		map(found, mapped) {
			mapped.mapProperty(found[Object.keys(found)[0] as PropertyKey]);
		},
	})
	.then((mapped) => (Button = mapped));
