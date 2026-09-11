import { VulpMap, utils as vulputils } from "@foxcord/vulpmap";
import { webpackPromise } from "./discord/promises";

export const vulpmap = new VulpMap(webpackPromise.promise);
export const utils = vulputils;
