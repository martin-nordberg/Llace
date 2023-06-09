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

export class LlaceDocumentationHandlingScanner implements ILlaceScanner {

    #scanner: ILlaceScanner
    #tokenAhead1: LlaceToken
    #tokenAhead2: LlaceToken | null
    #tokenAhead3: LlaceToken | null

    constructor(scanner: ILlaceScanner) {
        this.#scanner = scanner
        this.#tokenAhead1 = this.#scanner.readToken()

        if (this.#tokenAhead1.type === LlaceTokenType.DOCUMENTATION) {

            // Combine multiple sequential documentation lines into one leading documentation.
            const lines = [this.#tokenAhead1.text]
            this.#tokenAhead3 = this.#scanner.readToken()

            while (this.#tokenAhead3.type === LlaceTokenType.DOCUMENTATION &&
            this.#tokenAhead3.origin.line === this.#tokenAhead1.origin.line + 1) {
                lines.push(this.#tokenAhead3.text)
                this.#tokenAhead3 = this.#scanner.readToken()
            }

            this.#tokenAhead1 = new LlaceToken(LlaceTokenType.LEADING_DOCUMENTATION, lines.join("\n"), this.#tokenAhead1.origin)

            this.#tokenAhead2 = new LlaceToken(LlaceTokenType.SYNTH_DOCUMENT, " ", this.#tokenAhead1.origin)
        } else {
            this.#tokenAhead2 = null
            this.#tokenAhead3 = null
        }


    }

    isAtEof(): boolean {
        return false;
    }

    readToken(): LlaceToken {

        // If needed, read the next token from the inner scanner.
        if (this.#tokenAhead2 == null) {
            this.#tokenAhead2 = this.#scanner.readToken()
        }

        // Combine multiple documentation lines into one leading documentation.
        if (this.#tokenAhead2.type === LlaceTokenType.DOCUMENTATION) {
            const lines = [this.#tokenAhead2.text]
            this.#tokenAhead3 = this.#scanner.readToken()

            while (this.#tokenAhead3.type === LlaceTokenType.DOCUMENTATION &&
            this.#tokenAhead3.origin.line === this.#tokenAhead2.origin.line + 1) {
                lines.push(this.#tokenAhead3.text)
                this.#tokenAhead3 = this.#scanner.readToken()
            }

            this.#tokenAhead2 = new LlaceToken(LlaceTokenType.LEADING_DOCUMENTATION, lines.join("\n"), this.#tokenAhead2.origin)
        }


        // Convert to trailing documentation after other tokens on the same line except '|'.
        if (this.#tokenAhead2.type === LlaceTokenType.LEADING_DOCUMENTATION &&
            this.#tokenAhead1.origin.line === this.#tokenAhead2.origin.line &&
            this.#tokenAhead1.type != LlaceTokenType.VERTICAL_BAR) {
            this.#tokenAhead2 = new LlaceToken(
                LlaceTokenType.TRAILING_DOCUMENTATION,
                this.#tokenAhead2.text,
                this.#tokenAhead2.origin
            )
        }

        if (this.#tokenAhead2.type === LlaceTokenType.TRAILING_DOCUMENTATION) {

            if (this.#tokenAhead1.type === LlaceTokenType.COMMA || this.#tokenAhead1.type === LlaceTokenType.SEMICOLON) {
                // Reorder trailing documentation as if it came before a comma or semicolon.
                const temp = this.#tokenAhead2
                this.#tokenAhead2 = this.#tokenAhead1
                this.#tokenAhead1 = temp

                // Return a synthetic operator token to feed the Pratt parser.
                return new LlaceToken(LlaceTokenType.SYNTH_DOCUMENT, " ", this.#tokenAhead1.origin)
            }

            if (this.#tokenAhead1.type !== LlaceTokenType.SYNTH_DOCUMENT) {
                // Insert a synthetic operator token to feed the Pratt parser next time through.
                const result = this.#tokenAhead1
                this.#tokenAhead1 = new LlaceToken(LlaceTokenType.SYNTH_DOCUMENT, " ", this.#tokenAhead2.origin)
                return result
            }

        }

        // Advance the three level token buffer.
        const result = this.#tokenAhead1
        this.#tokenAhead1 = this.#tokenAhead2

        // Insert a synthetic operator after a leading documentation token.
        if (this.#tokenAhead1.type === LlaceTokenType.LEADING_DOCUMENTATION) {
            this.#tokenAhead2 = new LlaceToken(LlaceTokenType.SYNTH_DOCUMENT, " ", this.#tokenAhead1.origin)
        } else {
            this.#tokenAhead2 = this.#tokenAhead3
            this.#tokenAhead3 = null
        }

        return result

    }

}