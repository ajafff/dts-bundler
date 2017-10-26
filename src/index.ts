import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export function bundle(entry: string): string {
    const filesSeen = new Set<string>();
    const imports = new Map<string, Set<string>>();

    const result: string[] = []

    function processFile(fileName: string) {
        if (filesSeen.has(fileName))
            return;
        filesSeen.add(fileName);

        const sourceFile = ts.createSourceFile(fileName, fs.readFileSync(fileName, 'utf8'), ts.ScriptTarget.ES5);
        for (const statement of sourceFile.statements) {
            if (ts.isImportDeclaration(statement) && statement.importClause !== undefined) {
                if (!ts.isStringLiteral(statement.moduleSpecifier))
                    continue;

                if (ts.isExternalModuleNameRelative(statement.moduleSpecifier.text)) {
                    processFile(path.resolve(path.dirname(fileName), statement.moduleSpecifier.text) + '.d.ts');
                } else if (statement.importClause.namedBindings !== undefined &&
                        ts.isNamedImports(statement.importClause.namedBindings)){
                    if (!imports.has(statement.moduleSpecifier.text))
                        imports.set(statement.moduleSpecifier.text, new Set())
                    const specifiers = imports.get(statement.moduleSpecifier.text)!;
                    for (const binding of statement.importClause.namedBindings.elements) {
                        specifiers.add(binding.name.text);
                    }
                }
            } else if (ts.isExportDeclaration(statement) &&
                    statement.moduleSpecifier !== undefined &&
                    ts.isStringLiteral(statement.moduleSpecifier) &&
                    (ts as any).isExternalModuleNameRelative(statement.moduleSpecifier.text)) {
                processFile(path.resolve(path.dirname(fileName), statement.moduleSpecifier.text) + '.d.ts');
            } else {
                result.push(statement.getFullText(sourceFile).trim());
            }
        }
    }

    processFile(path.resolve(entry));

    imports.forEach((specifiers, moduleName) => {
        result.push(`import {${Array.from(specifiers).join(', ')}} from '${moduleName}'`);
    });

    return result.join('\n');
}
