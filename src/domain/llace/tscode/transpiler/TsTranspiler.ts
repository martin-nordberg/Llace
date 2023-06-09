//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {TsModule} from "../model/TsModule"
import {TsTopLevelDecl} from "../model/TsTopLevelDecl"
import {TsImport} from "../model/TsImport"
import {
    LlaceArrayLiteralExpr,
    LlaceBinaryOperationExpr,
    LlaceBinaryOperator,
    LlaceExpression,
    LlaceIdentifierExpr, LlaceParenthesizedExpr
} from "../../code/model/expressions/LlaceExpressions";
import {TsComments} from "../model/TsComments";

//---------------------------------------------------------------------------------------------------------------------

export class TsTranspiler {

    #convertNamespaceToPath(field: LlaceExpression): string[] {

        if (field instanceof LlaceIdentifierExpr) {
            return [field.name]
        }

        if (field instanceof LlaceBinaryOperationExpr && field.operator === LlaceBinaryOperator.FieldReference) {
            const result = this.#convertNamespaceToPath(field.lhs)
            return result.concat(this.#convertNamespaceToPath(field.rhs))
        }

        throw new Error("Invalid expression type within namespace value.");

    }

    #mapImport(modulePath: string[], importPath: string[]): TsImport {

        let path: string[] = []

        let i=0
        while (i < importPath.length - 1 && i<modulePath.length-1 && importPath[i] === modulePath[i] ) {
            i += 1
        }

        for (let j=0; j<modulePath.length-1-i; j+=1) {
            path.push("..")
        }

        if (path.length == 0) {
            path.push(".")
        }

        while (i < importPath.length - 1 ) {
            path.push(importPath[i])
            i += 1
        }

        return new TsImport(importPath[importPath.length - 1], path)

    }

    #mapNewImports(modulePath: string[], arrayLiteral: LlaceArrayLiteralExpr): TsImport[] {

        const result: TsImport[] = []

        const elements = arrayLiteral.elements

        for (let element of elements) {
            const importPath = this.#convertNamespaceToPath(element)
            result.push(this.#mapImport(modulePath, importPath))
        }

        return result

    }

    /**
     * Maps a Llace record literal of type "module" to a Typescript module.
     */
    mapNewModule(module: LlaceParenthesizedExpr) {

        const moduleField = module.items[0]

        // Process the namespace.
        let modulePath: string[] = []
        // for (let field of (moduleField.value as LlaceRecordLiteralExpr).fields) {
        //     if (field.key.name === "namespace") {
        //         modulePath = this.#convertNamespaceToPath((field as LlaceValueOnlyRecordField).value)
        //         break
        //     }
        // }
        // modulePath.push(moduleField.key.name)

        // Process the imports.
        const imports: TsImport[] = []
        // for (let field of (moduleField.value as LlaceRecordLiteralExpr).fields) {
        //     if (field.key.name === "imports") {
        //         this.#mapNewImports(modulePath, (field as LlaceValueOnlyRecordField).value as LlaceArrayLiteralExpr).forEach(i => imports.push(i))
        //         break
        //     }
        // }

        // Process the declarations.
        const declarations: TsTopLevelDecl[] = []
        // for (let field of (moduleField.value as LlaceRecordLiteralExpr).fields) {
        //     if (field.LlaceRecordField$Tag === LlaceRecordField$Tag.LlaceTypeAliasRecordField) {
        //         new TsTypeTranspiler().mapNewTypeDecl(field as LlaceTypeAliasRecordField).forEach(d => declarations.push(d))
        //     }
        // }

        return new TsModule(new TsComments(["Comments TODO"]), imports, modulePath, declarations)

    }

}

//---------------------------------------------------------------------------------------------------------------------
