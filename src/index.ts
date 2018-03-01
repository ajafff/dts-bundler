import * as ts from 'typescript';

export function bundle(entry: string) {
    const program = ts.createProgram([entry], {});
    const checker = program.getTypeChecker();
    const file = program.getSourceFile(entry)!;
    const moduleSymbol = checker.getSymbolAtLocation(file)!;
    const exports = checker.getExportsOfModule(moduleSymbol);
    const transformer: ts.TransformerFactory<ts.Node> = (context) => (rootNode) => {
        if (ts.isVariableDeclaration(rootNode)) {
            rootNode = ts.createVariableStatement(
                [ts.createToken(ts.SyntaxKind.ExportKeyword), ts.createToken(ts.SyntaxKind.DeclareKeyword)],
                ts.createVariableDeclarationList([rootNode], rootNode.parent!.flags),
            )
        }
        return ts.visitNode(rootNode, function visit(node) {
            node = ts.visitEachChild(node, visit, context);
            if (ts.isArrayTypeNode(node)) {
                node = ts.createTypeReferenceNode('Array', [unwrapParens(node.elementType)]);
            } else if (ts.isFunctionTypeNode(node) || ts.isConstructorTypeNode(node)) {
                node = ts.createTypeLiteralNode([ts[node.kind === ts.SyntaxKind.FunctionType ? 'createCallSignature' : 'createConstructSignature'](node.typeParameters && node.typeParameters.slice(), node.parameters.slice(), node.type)]);
            } else if (ts.isParenthesizedTypeNode(node)) {
                if (ts.isTypeLiteralNode(node.type)) {
                    node = node.type;
                }
            }
            return node;
        });
    }
    const printer = ts.createPrinter();
    for (let e of exports.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log();
        if (e.flags & ts.SymbolFlags.Alias)
            e = checker.getAliasedSymbol(e);
        if (!e.declarations)
            continue;
        for (const d of e.declarations.sort((a, b) => a.kind - b.kind || a.pos - b.pos)) {
            const sourceFile = d.getSourceFile();
            if (program.isSourceFileFromExternalLibrary(sourceFile))
                continue;
            const transformed = ts.transform(d, [transformer]).transformed[0];
            console.log(printer.printNode(ts.EmitHint.Unspecified, transformed, sourceFile));
        }
    }
}

function unwrapParens(type: ts.TypeNode) {
    while (ts.isParenthesizedTypeNode(type))
        type = type.type;
    return type;
}

bundle(process.argv[2]);
