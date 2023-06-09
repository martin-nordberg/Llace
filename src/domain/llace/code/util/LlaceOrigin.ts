// # Data types related to token origins.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

// A record of where a parsed item originated.
export class LlaceOrigin {

    // The name of the source file.
    readonly fileName: string

    // The line in the file (1-based).
    readonly line: number

    // The column in the file (1-based).
    readonly column: number

    // The length of the token.
    readonly length: number

    constructor(
        fileName: string,
        line: number,
        column: number,
        length: number,
    ) {
        this.fileName = fileName
        this.line = line
        this.column = column
        this.length = length
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
