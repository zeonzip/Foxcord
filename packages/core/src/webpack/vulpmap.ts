import { VulpMap, utils as vulputils } from "@foxcord/vulpmap";
import { webpackPromise } from "./hookWebpack";

export const vulpmap = new VulpMap(webpackPromise);
export const utils = vulputils;
