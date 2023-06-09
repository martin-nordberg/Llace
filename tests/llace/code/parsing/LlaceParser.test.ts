import {describe, it, expect} from "vitest";

import fs from "fs";
import {CodeStringBuilder} from "../../../../src/domain/llace/util/text/CodeStringBuilder";
import {LlaceExpressionParser} from "../../../../src/domain/llace/code/parsing/LlaceExpressionParser";
import {LlaceScannerBuffer} from "../../../../src/domain/llace/code/scanning/LlaceScannerBuffer";
import {LlaceExpressionWriter} from "../../../../src/domain/llace/code/formatting/LlaceExpressionWriter";
import {LlaceScanner} from "../../../../src/domain/llace/code/scanning/LlaceScanner";
import {
    LlaceDocumentationHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceDocumentationHandlingScanner";
import {sExpression} from "../../../../src/domain/llace/code/model/core/S_Expressions";
import {
    LlaceMultilineStringHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceMultilineStringHandlingScanner";

describe('Parser', () => {

    let check = function(file: string) {
        const folder = "C:\\Users\\Martin Nordberg\\Documents\\Llace\\testdata\\llace\\code\\"

        const fileName = folder + file
        const code = fs.readFileSync(fileName, 'utf8')
            .replaceAll("\r\n", "\n")

        const scanner = new LlaceScanner(code, fileName)
        const docHandlingScanner = new LlaceDocumentationHandlingScanner(scanner)
        const mlStringHandlingScanner = new LlaceMultilineStringHandlingScanner(docHandlingScanner)
        const scanBuffer = new LlaceScannerBuffer(mlStringHandlingScanner)
        const parser = new LlaceExpressionParser(scanBuffer, fileName)

        const module = parser.parseParenthesizedItems()

        expect(module.items.length).toBeGreaterThan(0)

        // const sExpr = sExpression(module)
        // console.log(sExpr)

        const llaceOutput = new CodeStringBuilder()
        new LlaceExpressionWriter().writeUnparenthesizedExprItems(llaceOutput, module)
        const code2 = llaceOutput.getOutput()

        expect(code2).toEqual(code)

    }

    it('parses sample Llace arrays', () => {
        check("arrays.llace")
    })

    it('parses sample Llace functions', () => {
        check("functions.llace")
    })

    it('parses sample Llace functionTypes', () => {
        check("functionTypes.llace")
    })

    it('parses sample Llace lists', () => {
        check("lists.llace")
    })

    it('parses sample Llace maps', () => {
        check("maps.llace")
    })

    it('parses sample Llace methodTypes', () => {
        check("methodTypes.llace")
    })

    it('parses sample Llace options', () => {
        check("options.llace")
    })

    it('parses sample Llace records', () => {
        check("records.llace")
    })

    it('parses sample Llace sets', () => {
        check("sets.llace")
    })

})

