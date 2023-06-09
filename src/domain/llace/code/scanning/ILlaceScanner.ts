//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceToken} from "./LlaceTokens"

//---------------------------------------------------------------------------------------------------------------------

export interface ILlaceScanner {
    /**
     * Tests whether the scanner has consumed all its input.
     * @return boolean
     */
    isAtEof(): boolean

    /**
     * Reads the next token from the input stream.
     * @return {LlaceToken}
     */
    readToken(): LlaceToken

}

//---------------------------------------------------------------------------------------------------------------------

