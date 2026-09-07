import { FilterType, FullExportsFilterBuilder } from '@foxcord/vulpmap';
import { utils, vulpmap } from '../vulpmap';

type ReactModule = typeof import('react');

export type JsxFunc = (element: string, body: any, props?: any) => object;

type JsxModule = {
    jsx: JsxFunc;
    jsxs: JsxFunc;
    Fragment: symbol;
};
export var ReactJsxModule: JsxModule;
vulpmap.registerMapperAndSearch(
    "React/JsxModule",
    {
        map(found, builder) {
            builder.mapProperty(found);
        },
        filterType: FilterType.ExportsFilter,
        filter: new FullExportsFilterBuilder(utils.byPropsFilter("jsxs", "jsx", "Fragment"))
            .retrieveRoot(true)
            .finish(),
    }
).then(mapped => ReactJsxModule = mapped as unknown as JsxModule);

export var React: ReactModule;
vulpmap.registerMapperAndSearch(
    "React/React",
    {
        map(found, builder) {
            builder.mapProperty(found);
        },
        filterType: FilterType.ExportsFilter,
        filter: new FullExportsFilterBuilder(utils.byPropsFilter("useEffect", "useReducer", "useState", "useMemo"))
            .retrieveRoot(false)
            .finish(),
    }
).then(mapped => React = mapped as ReactModule);