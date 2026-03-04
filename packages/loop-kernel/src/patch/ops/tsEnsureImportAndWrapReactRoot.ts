import { parse as babelParse } from '@babel/parser';
import recast from 'recast';
import type { OperationResult, TsEnsureImportAndWrapReactRootOperation } from '@loop-kit/loop-contracts';
import type { OperationHandler } from './runtime.js';

const b = recast.types.builders;
const n = recast.types.namedTypes;

function parseTsx(source: string): any {
    return recast.parse(source, {
        parser: {
            parse(input: string) {
                return babelParse(input, {
                    sourceType: 'module',
                    plugins: ['typescript', 'jsx'],
                });
            },
        },
    });
}

function ensureImport(program: any, importSource: string, importName: string): boolean {
    let changed = false;
    let importDecl: any;

    for (const statement of program.body as any[]) {
        if (n.ImportDeclaration.check(statement) && statement.source.value === importSource) {
            importDecl = statement;
            break;
        }
    }

    if (!importDecl) {
        importDecl = b.importDeclaration(
            [b.importSpecifier(b.identifier(importName), b.identifier(importName))],
            b.stringLiteral(importSource),
        );
        program.body.unshift(importDecl);
        changed = true;
    } else {
        const hasSpecifier = (importDecl.specifiers ?? []).some(
            (specifier: any) =>
                n.ImportSpecifier.check(specifier) &&
                n.Identifier.check(specifier.imported) &&
                specifier.imported.name === importName,
        );

        if (!hasSpecifier) {
            importDecl.specifiers = importDecl.specifiers ?? [];
            importDecl.specifiers.push(
                b.importSpecifier(b.identifier(importName), b.identifier(importName)),
            );
            changed = true;
        }
    }

    return changed;
}

function wrapRenderArgument(program: any, wrapperName: string): boolean {
    let changed = false;

    recast.types.visit(program, {
        visitCallExpression(path) {
            const node = path.node as any;
            if (
                n.MemberExpression.check(node.callee) &&
                n.Identifier.check(node.callee.property) &&
                node.callee.property.name === 'render' &&
                node.arguments.length > 0
            ) {
                const arg = node.arguments[0] as any;
                if (!arg || (!n.JSXElement.check(arg) && !n.JSXFragment.check(arg))) {
                    return false;
                }

                if (n.JSXElement.check(arg) && n.JSXIdentifier.check(arg.openingElement.name)) {
                    if (arg.openingElement.name.name === wrapperName) {
                        return false;
                    }
                }

                const wrapped = b.jsxElement(
                    b.jsxOpeningElement(b.jsxIdentifier(wrapperName), []),
                    b.jsxClosingElement(b.jsxIdentifier(wrapperName)),
                    [arg],
                );

                node.arguments[0] = wrapped;
                changed = true;
                return false;
            }

            this.traverse(path);
            return undefined;
        },
    });

    return changed;
}

export const tsEnsureImportAndWrapReactRootHandler: OperationHandler<TsEnsureImportAndWrapReactRootOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const current = await runtime.readCurrentContent(operation.path);
    if (!current) {
        return {
            opId: operation.opId,
            status: 'failed',
            changedFiles: [],
            diagnostics: [
                {
                    id: 'patch.ts_missing_file',
                    severity: 'error',
                    message: `Cannot patch missing TS file ${operation.path}`,
                    evidence: { path: operation.path },
                },
            ],
        };
    }

    const ast = parseTsx(current);
    const program = ast.program as any;

    const importChanged = ensureImport(program, operation.importSource, operation.importName);
    const wrapChanged = wrapRenderArgument(program, operation.wrapperName);

    if (!importChanged && !wrapChanged) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    const next = recast.print(ast).code;
    await runtime.setFileContent(operation.path, next);

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.path],
        diagnostics: [],
    };
};
