import type * as acorn from 'acorn';

export type VulpatchCtx = {
    astPatches: AstPatch[];
    regexPatches: RegexPatch[];
}

export enum PatchType {
    RegexPatch,
    AstPatch
}

export interface PatchBase {
    moduleMatch: string | RegExp;
    source?: string;
}

export type AstPatch = PatchBase & {
    processors: { processAst: (node: acorn.Program, markDirty: () => void) => void }[];
    type: PatchType.AstPatch;
};

export type RegexPatch = PatchBase & {
    replace: {
        replace: string | RegExp;
        with: string;
    }[];
    type: PatchType.RegexPatch;
}

export type UniformPatch = PatchBase & ({
    replace: {
        replace: RegExp;
        with: string;
    }[];
    type: PatchType.RegexPatch;
} | {
    processors: AstPatch['processors'];
    type: PatchType.AstPatch;
})