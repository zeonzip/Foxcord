import {
    createCategory,
    createCustom,
    createPanel,
    createSection,
    createSidebarItem,
} from '@foxcord/core/webpack/discord/menu';
import * as vulpatch from '@foxcord/vulpatch';
import { PatchType } from '@foxcord/vulpatch';
import { Button } from '@foxcord/core/webpack/discord/ui';
import {
    accessPackageRuntime,
    definePackage,
    type PackageInterface,
    packageStore,
} from '@foxcord/core/package/package';

import styles from './core.css';
import { StyleManager } from '@foxcord/core/webpack/discord/style';

const pluginName = 'Core';

export default definePackage({
    name: pluginName,
    core: true,
    load() {
        StyleManager.addStyle('coreStyles', styles);
    },
    unload() {
        StyleManager.removeStyle('coreStyles');
    },
    patches: [
        {
            moduleMatch: /analyticsKey:\s*"user_settings"/,
            processors: [
                {
                    processAst(ast, markDirty) {
                        vulpatch.walk({
                            ast,
                            node(node) {
                                if (node.type !== 'ObjectExpression') return;
                                const obj = node as vulpatch.parser.ObjectExpression;

                                const keyRecognition = vulpatch.getProp(obj, 'analyticsKey')?.value;
                                if (keyRecognition?.type !== 'Literal' || keyRecognition.value !== 'user_settings') return;

                                const layoutFn = vulpatch.getProp(obj, 'buildLayout')?.value;
                                if (layoutFn?.type !== 'ArrowFunctionExpression') return;

                                if (layoutFn.body.type !== 'ArrayExpression') return;
                                const arr = layoutFn.body;

                                const src = `${accessPackageRuntime(pluginName)}.pluginsItem()`;

                                arr.elements.splice(1, 0, vulpatch.createExpr(src));
                                markDirty();
                            }
                        });
                    }
                }
            ],
            type: PatchType.AstPatch
        },
    ],
    pluginsItem: () => {
        function PackageIcon(props: any) {
            const {
                    size: _,
                    width: _w,
                    height: _h,
                    color,
                    colorClass = '',
                    ...rest
                } = props;

            return (
                <svg
                    {...rest}
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill={typeof color === 'string' ? color : color.css}
                        d="M18 2C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H10V7C10 7.55228 10.4477 8 11 8H13C13.5523 8 14 7.55228 14 7V2H18Z"
                        className={colorClass}
                    />
                </svg>
            );
        }

        const custom = createCustom('packages_button', {
            Component: () => {
                packageStore.reactSubscribe();

                return <>
                    {packageStore.isPending && <h1 className={"paddedBottom"}>Packages enabled/disabled require a refresh of the Discord client to update it's status.</h1>}
                    {[...packageStore.entries].map(([k, v]) => <Package key={k} pack={v.package} status={v.toggled} toggle={() => packageStore.setToggled(v.package.name, !v.toggled)}></Package>)}
                </>
            },
            useSearchTerms: () => ['Packages'],
        });

        const category = createCategory('packages_category', {
            useTitle: () => "Packages:",
            buildLayout: () => [custom],
        });

        const panel = createPanel('packages_panel', {
            useTitle: () => 'Packages',
            buildLayout: () => [category],
        });

        const sidebar = createSidebarItem('packages_item', {
            useTitle: () => 'Packages',
            icon: PackageIcon,
            buildLayout: () => [panel],
        });

        return createSection('packages_section', {
            useTitle: () => 'Foxcord',
            buildLayout: () => [sidebar],
        });
    },
});

interface PackageProps {
    pack: PackageInterface;
    status: boolean;
    toggle: () => void;
}

function Package({ pack, status, toggle }: PackageProps) {
    return <div>
        <h1 className={"halfPaddedBottom"}>{`${pack.name}:`}</h1>
        <div className={"paddedBottom"}>
            <Button text={status ? "Disable" : "Enable"} variant={"secondary"} onClick = {toggle} disabled={pack.core === true}></Button>
        </div>
    </div>
}