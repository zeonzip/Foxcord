import type { ObjectExpression, Property } from "acorn";
import * as acorn from "acorn";
import { generate } from "astring";
import { walk as eswalk } from "estree-walker";
import type { VulpatchCtx } from "./types.js";

export * as parser from "acorn";
export * from "./types";

export function applyPatches(
	factoryCode: string,
	ctx: VulpatchCtx,
	options: acorn.Options = {
		ecmaVersion: "latest",
	},
) {
	let ast;

	let modifedFactory = `({${factoryCode}})`;

	for (const rgxPatch of ctx.regexPatches) {
		if (
			typeof rgxPatch.moduleMatch === "string"
				? factoryCode.includes(rgxPatch.moduleMatch)
				: rgxPatch.moduleMatch.test(factoryCode)
		) {
			for (const replace of rgxPatch.replace) {
				modifedFactory = modifedFactory.replace(replace.replace, replace.with);
			}
		}
	}

	let astDirty = false;

	if (ctx.astPatches.length !== 0) {
		ast = acorn.parse(modifedFactory, options);

		for (const astPatch of ctx.astPatches) {
			if (
				typeof astPatch.moduleMatch === "string"
					? factoryCode.includes(astPatch.moduleMatch)
					: astPatch.moduleMatch.test(factoryCode)
			) {
				for (const patch of astPatch.processors) {
					patch.processAst(ast, () => {
						astDirty = true;
					});
				}
			}
		}
	}

	if (astDirty && ast) {
		if (ast.body[0]?.type !== "ExpressionStatement") {
			throw Error("Expected expression, found other.");
		}

		return `(${generate(ast.body[0].expression)})`;
	}

	return modifedFactory;
}

export function walk(obj: {
	ast: acorn.Program;
	node: (node: acorn.Node, parent: acorn.Node | null) => void;
}) {
	eswalk(obj.ast as any, {
		enter(nod, par) {
			obj.node(nod as acorn.Node, par as acorn.Node);
		},
	});
}

export function getProp(obj: ObjectExpression, prop: string) {
	return obj.properties.find(
		(p) =>
			p.type === "Property" &&
			!p.computed &&
			((p.key.type === "Identifier" && p.key.name === prop) ||
				(p.key.type === "Literal" && p.key.value === prop)),
	) as Property | undefined;
}

export function createExpr(
	exprString: string,
	options: acorn.Options = {
		ecmaVersion: "latest",
	},
) {
	return acorn.parseExpressionAt(exprString, 0, options);
}
