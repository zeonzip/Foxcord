import { FilterType, FullExportsFilterBuilder } from "@foxcord/vulpmap";
import { utils, vulpmap } from "../vulpmap";

const findStore = (store: string) =>
	vulpmap.registerMapperAndSearch(`Store/${store}`, {
		filterType: FilterType.ExportsFilter,
		filter: new FullExportsFilterBuilder(utils.byStoreName(store))
			.retrieveRoot(false)
			.finish(),
		map(found, builder) {
			builder.mapProperty(found);
		},
	});

export var UserStore: any;
findStore("UserStore").then((module) => (UserStore = module));
