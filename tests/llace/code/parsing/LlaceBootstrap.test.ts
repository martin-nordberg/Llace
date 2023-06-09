//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//


//---------------------------------------------------------------------------------------------------------------------

import {describe, it, expect} from "vitest";

import fs from "fs";
import {CodeStringBuilder} from "../../../../src/domain/llace/util/text/CodeStringBuilder";
import {TsWriter} from "../../../../src/domain/llace/tscode/formatting/TsWriter";
import {LlaceExpressionParser} from "../../../../src/domain/llace/code/parsing/LlaceExpressionParser";
import {LlaceScannerBuffer} from "../../../../src/domain/llace/code/scanning/LlaceScannerBuffer";
import {LlaceExpressionWriter} from "../../../../src/domain/llace/code/formatting/LlaceExpressionWriter";
import {TsTranspiler} from "../../../../src/domain/llace/tscode/transpiler/TsTranspiler";
import {LlaceScanner} from "../../../../src/domain/llace/code/scanning/LlaceScanner";
import {
    LlaceDocumentationHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceDocumentationHandlingScanner";
import {LlaceTokenType} from "../../../../src/domain/llace/code/scanning/LlaceTokens";
import {
    LlaceMultilineStringHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceMultilineStringHandlingScanner";

describe('Bootstrap', () => {

    const check = function(fileName: string) {

        const llaceSrcRoot = "C:\\Users\\Martin Nordberg\\Documents\\LLace\\src\\"
        const tsSrcRoot = "C:\\Users\\Martin Nordberg\\Documents\\LLace\\src\\"

        const filePath = llaceSrcRoot + fileName
        const code = fs.readFileSync(filePath, 'utf8')
            .replaceAll("\r\n", "\n")

        const scanner = new LlaceScanner(code, fileName)
        const docHandlingScanner = new LlaceDocumentationHandlingScanner(scanner)
        const mlStringHandlingScanner = new LlaceMultilineStringHandlingScanner(docHandlingScanner)
        const scanBuffer = new LlaceScannerBuffer(mlStringHandlingScanner)
        const parser = new LlaceExpressionParser(scanBuffer, fileName)

        const module = parser.parseParenthesizedItems()

        expect(module.items.length).toBeGreaterThan(0)

        const llaceOutput = new CodeStringBuilder()
        new LlaceExpressionWriter().writeUnparenthesizedExprItems(llaceOutput, module)
        const code2 = llaceOutput.getOutput()

        expect(code2).toEqual(code)

        const tsModule = new TsTranspiler().mapNewModule(module)

        const tsOutput = new CodeStringBuilder()
        new TsWriter().writeModule(tsOutput, tsModule)
        const tsCode = tsOutput.getOutput()

        const outPath = tsSrcRoot + tsModule.path.join("/") + ".tsgen"
        fs.writeFileSync(outPath, tsCode)

    }

    it('generates its own code for LlaceIdentifiers', () => {
        check("domain\\llace\\code\\model\\core\\LlaceIdentifiers.llace")
    })

    it('generates its own code for LlaceExpressions', () => {
        check("domain\\llace\\code\\model\\expressions\\LlaceExpressions.llace")
    })

    it('generates its own code for LlaceTokens', () => {
        check("domain\\llace\\code\\scanning\\LlaceTokens.llace")
    })

    it('generates its own code for LlaceOrigin', () => {
        check("domain\\llace\\code\\util\\LlaceOrigin.llace")
    })

})

//---------------------------------------------------------------------------------------------------------------------

