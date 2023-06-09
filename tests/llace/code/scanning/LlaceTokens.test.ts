
import { describe, it, expect } from "vitest"

import { LlaceTokenType} from "../../../../src/domain/llace/code/scanning/LlaceTokens"
import {textOfTokenType} from "../../../../src/domain/llace/code/scanning/LlaceTokenTypeMethods"

describe('Tokens', () => {
    it('have correct text', () => {
        expect(textOfTokenType(LlaceTokenType.ASTERISK)).toBe("*")
        expect(textOfTokenType(LlaceTokenType.EOF)).toBe("[end of file]")
        expect(textOfTokenType(LlaceTokenType.IDENTIFIER)).toBe("[identifier]")
    })
})

