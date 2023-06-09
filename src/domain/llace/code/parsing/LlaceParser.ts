//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

import {LlaceToken, LlaceTokenType} from "../scanning/LlaceTokens";
import {textOfTokenType} from "../scanning/LlaceTokenTypeMethods";
import {LlaceScannerBuffer} from "../scanning/LlaceScannerBuffer";

/**
 * Abstract recursive descent parser for Llace.
 */
export class LlaceParser {

    protected readonly scanner: LlaceScannerBuffer;
    protected readonly fileName: string;

    constructor(scanner: LlaceScannerBuffer, fileName: string) {
        this.scanner = scanner
        this.fileName = fileName
    }

    /**
     * Consumes and returns the next token, requiring it to be of given [tokenType].
     */
    consumeType(tokenType: LlaceTokenType): LlaceToken {
        return this.scanner.readTokenIfType(tokenType) ?? this.expectedType(tokenType)
    }

    /**
     * Throws a failure for not reading a token that has one of the expected [tokenTypes].
     */
    expectedType(...tokenTypes: LlaceTokenType[]): never {

        const prefix = "Expected one of ("
        const unexpectedToken = this.scanner.peekToken()
        const location = `at ${unexpectedToken.origin.fileName}(${unexpectedToken.origin.line},${unexpectedToken.origin.column})`
        const suffix = `). Instead saw ${textOfTokenType(unexpectedToken.type)} '${unexpectedToken.text}' ${location}.`

        const tkText = tokenTypes.map(t => textOfTokenType(t))
        throw new Error(prefix + tkText.join(",") + suffix)

    }

}

//---------------------------------------------------------------------------------------------------------------------
