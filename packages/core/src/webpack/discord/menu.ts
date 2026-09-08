export type MenuBase = {
	key: string;
	type: ComponentType;
};

export type SidebarItem = {
	useTitle: () => string;
	icon: any;
	buildLayout: () => (MenuBase & Panel)[];
};

export enum ComponentType {
	ROOT = 0,
	SECTION = 1,
	SIDEBAR_ITEM = 2,
	PANEL = 3,
	SPLIT = 4,
	CATEGORY = 5,
	ACCORDION = 6,
	LIST = 7,
	RELATED = 8,
	CARD = 9,
	FIELD_SET = 10,
	NESTED_PANEL_NAVIGATOR = 11,
	STATIC = 12,
	BUTTON = 13,
	TOGGLE = 14,
	SLIDER = 15,
	SELECT = 16,
	RADIO = 17,
	NAVIGATOR = 18,
	CUSTOM = 19,
}

export function createSidebarItem(id: string, sidebarObject: SidebarItem) {
	return constructMenu(id, ComponentType.SIDEBAR_ITEM, sidebarObject);
}

export type Panel = {
	useTitle: () => string;
	buildLayout: () => (MenuBase & Category)[];
};

export function createPanel(id: string, panelObject: Panel) {
	return constructMenu(id, ComponentType.PANEL, panelObject);
}

export type Category = {
	useTitle?: () => string;
	buildLayout: () => any[];
};

export function createCategory(id: string, panelObject: Category) {
	return constructMenu(id, ComponentType.CATEGORY, panelObject);
}

export type Custom = {
	[key: string]: any;
};

export function createCustom(id: string, customObject: Custom) {
	return constructMenu(id, ComponentType.CUSTOM, customObject);
}

export type Section = {
	useTitle?: () => string;
	buildLayout: () => (SidebarItem & MenuBase)[];
	hoisted?: boolean;
	hideTitle?: boolean;
};

export function createSection(id: string, sectionObject: Section) {
	return constructMenu(id, ComponentType.SECTION, sectionObject);
}

export function constructMenu<T>(
	id: string,
	componentId: ComponentType,
	obj: T,
): MenuBase & T {
	return {
		...obj,
		key: id,
		type: componentId,
	};
}
