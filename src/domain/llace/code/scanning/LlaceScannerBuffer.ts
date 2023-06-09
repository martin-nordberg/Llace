//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceToken, LlaceTokenType} from "./LlaceTokens";
import type {ILlaceScanner} from "./ILlaceScanner";

//---------------------------------------------------------------------------------------------------------------------

export class LlaceScannerBuffer {
    #scanner: ILlaceScanner;
    #nextToken: LlaceToken;

    constructor(scanner: ILlaceScanner) {
        this.#scanner = scanner
        this.#nextToken = this.#scanner.readToken()
    }

    /**
     * Reads the next token if it is of the given [tokenType].
     */
    advanceTokenIfType(tokenType: LlaceTokenType): boolean {
        const result = this.#nextToken
        if (result.type === tokenType) {
            this.#nextToken = this.#scanner.readToken()
            return true
        }
        return false
    }

    /**
     * Tests whether the lexer has more input to consume.
     */
    hasUnconsumedInput(): boolean {
        return !this.#scanner.isAtEof()
    }

    /**
     * Reads the next token without consuming it.
     */
    peekToken() : LlaceToken {
        return this.#nextToken
    }

    /**
     * Tests whether the next token to be read has a given [tokenType].
     */
    peekTokenIsType(tokenType: LlaceTokenType): boolean {
        const result = this.#nextToken
        return result.type === tokenType
    }

    /**
     * Reads and consumes the next token.
     */
    readToken(): LlaceToken {
        const result = this.#nextToken
        this.#nextToken = this.#scanner.readToken()
        return result
    }

    /**
     * Reads the next token if it is of the given [tokenType].
     */
    readTokenIfType(tokenType: LlaceTokenType): LlaceToken|null {
        const result = this.#nextToken
        if (result.type === tokenType) {
            this.#nextToken = this.#scanner.readToken()
            return result
        }
        return null
    }

}

//---------------------------------------------------------------------------------------------------------------------
