export function log(data: any) {
	printLvl("LOG", data);
}

export function warn(data: any) {
	printLvl("WARN", data);
}

export function error(data: any) {
	printLvl("ERROR", data);
}

export function throwingError(data: any) {
	printLvl("ERROR", data);
	throw Error(data);
}

export function printLvl(lvl: string, data: any) {
	console.log(`[Foxcord : ${lvl}]: ${data}`);
}
