//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {describe, it, expect} from "vitest";
import {CodeStringBuilder} from "../../../../src/domain/llace/util/text/CodeStringBuilder";
import {LlaceScannerBuffer} from "../../../../src/domain/llace/code/scanning/LlaceScannerBuffer";
import {sExpression} from "../../../../src/domain/llace/code/model/core/S_Expressions";
import {LlaceExpressionParser} from "../../../../src/domain/llace/code/parsing/LlaceExpressionParser";
import {LlaceExpressionWriter} from "../../../../src/domain/llace/code/formatting/LlaceExpressionWriter";
import {LlaceScanner} from "../../../../src/domain/llace/code/scanning/LlaceScanner";
import {
    LlaceDocumentationHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceDocumentationHandlingScanner";
import {
    LlaceMultilineStringHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceMultilineStringHandlingScanner";

describe('Parser', () => {
    it('parses and formats expressions', () => {

        const types = new Map<string, string>()
        types.set("string", "(identifier string)")

        types.set("string | number", "(| (identifier string) (identifier number))")
        types.set("    string\n    | number\n    | boolean", "(| (identifier string) (identifier number) (identifier boolean))")
        types.set("Wild & Free", "(& (identifier Wild) (identifier Free))")
        types.set("Boring | Wild & Free", "(| (identifier Boring) (& (identifier Wild) (identifier Free)))")
        types.set("Wild & Free | Boring", "(| (& (identifier Wild) (identifier Free)) (identifier Boring))")

        types.set("int -> string", "(-> (identifier int) (identifier string))")

        types.set("Q?", "(optional (identifier Q))")
        types.set("Q? | P", "(| (optional (identifier Q)) (identifier P))")
        types.set("Q | P?", "(| (identifier Q) (optional (identifier P)))")

        types.set("string[]", "(arraytype (identifier string))")
        types.set("string[][]", "(arraytype (arraytype (identifier string)))")

        types.set("string[;]", "(listtype (identifier string))")
        types.set("string[][;]", "(listtype (arraytype (identifier string)))")

        types.set("string{}", "(settype (identifier string))")

        types.set("string{int}", "(maptype (identifier string) (identifier int))")

        for (let code of types.keys()) {
            const fileName = `[[${code}]]`

            const scanner = new LlaceScanner(code, fileName)
            const docHandlingScanner = new LlaceDocumentationHandlingScanner(scanner)
            const mlStringHandlingScanner = new LlaceMultilineStringHandlingScanner(docHandlingScanner)
            const scanBuffer = new LlaceScannerBuffer(mlStringHandlingScanner)
            const parser = new LlaceExpressionParser(scanBuffer, fileName)

            const type = parser.parseExpression()

            expect(sExpression(type)).toEqual(types.get(code))

            const output = new CodeStringBuilder()
            new LlaceExpressionWriter().writeExpression(output, type)
            const code2 = output.getOutput()

            expect(code2).toEqual(code + "\n")
        }

    })

})

//---------------------------------------------------------------------------------------------------------------------

