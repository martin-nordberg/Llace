//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {
    LlaceToken,
    LlaceTokenType,
} from "./LlaceTokens"
import type {ILlaceScanner} from "./ILlaceScanner";

//---------------------------------------------------------------------------------------------------------------------

export class LlaceMultilineStringHandlingScanner implements ILlaceScanner {

    #scanner: ILlaceScanner
    #tokenAhead1: LlaceToken | null
    #tokenAhead2: LlaceToken | null

    constructor(scanner: ILlaceScanner) {
        this.#scanner = scanner
        this.#tokenAhead1 = null
        this.#tokenAhead2 = null
    }

    isAtEof(): boolean {
        return false;
    }

    readToken(): LlaceToken {

        // If needed, read the next token from the inner scanner.
        if (this.#tokenAhead1 == null) {
            this.#tokenAhead1 = this.#scanner.readToken()
        }

        // Combine multiple back-ticked string lines into one multiline string.
        if (this.#tokenAhead1.type === LlaceTokenType.BACK_TICKED_STRING) {
            const lines = [this.#tokenAhead1.text]
            this.#tokenAhead2 = this.#scanner.readToken()

            while (this.#tokenAhead2.type === LlaceTokenType.BACK_TICKED_STRING &&
            this.#tokenAhead2.origin.line === this.#tokenAhead1.origin.line + 1) {
                lines.push(this.#tokenAhead2.text)
                this.#tokenAhead2 = this.#scanner.readToken()
            }

            this.#tokenAhead1 = new LlaceToken(LlaceTokenType.MULTILINE_STRING, lines.join("\n"), this.#tokenAhead1.origin)
        }

        // Advance the three level token buffer.
        const result = this.#tokenAhead1
        this.#tokenAhead1 = this.#tokenAhead2
        this.#tokenAhead2 = null

        return result

    }

}