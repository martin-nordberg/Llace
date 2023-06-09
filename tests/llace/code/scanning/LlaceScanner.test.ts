import {describe, it, expect} from "vitest";

import {LlaceTokenType} from "../../../../src/domain/llace/code/scanning/LlaceTokens"
import {LlaceScanner} from "../../../../src/domain/llace/code/scanning/LlaceScanner";
import fs from "fs";

describe('Scanner', () => {
    it('scans a simple sequence', () => {
        const code = "type E is option A, B, or \n C"

        const scanner = new LlaceScanner(code, "specific_variant.llace")

        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IS)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.COMMA)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.COMMA)
        expect(scanner.readToken().type).toBe(LlaceTokenType.OR)
        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.EOF)
    })

    it('scans a special case', () => {
        const code = "entries"

        const scanner = new LlaceScanner(code, "entries.llace")

        expect(scanner.readToken().type).toBe(LlaceTokenType.IDENTIFIER)
        expect(scanner.readToken().type).toBe(LlaceTokenType.EOF)
    })

    it('checks how maps work', () => {
        const singleCharTokens = new Map<string, LlaceTokenType>()
        singleCharTokens.set('&', LlaceTokenType.AMPERSAND)
        singleCharTokens.set('*', LlaceTokenType.ASTERISK)

        expect(singleCharTokens.has("entries")).toBeFalsy()
    })

    it('scans sample Llace files', () => {

        const files = [
            "arrays.llace",
            "functionTypes.llace",
            "lists.llace",
            "maps.llace",
            "records.llace",
            "sets.llace",
            "options.llace"
        ]

        const folder = "C:\\Users\\Martin Nordberg\\Documents\\Llace\\testdata\\llace\\code\\"

        for (let file of files) {
            const code = fs.readFileSync(folder + file, 'utf8')

            const scanner = new LlaceScanner(code, "specific_variant.llace")

            let token
            do {
                token = scanner.readToken()
            } while(token.type !== LlaceTokenType.EOF)
        }
    })
})

