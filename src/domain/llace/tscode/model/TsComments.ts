//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

export class TsComments {

    readonly lines: string[]

    constructor(lines: string[]) {
        this.lines = lines
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
