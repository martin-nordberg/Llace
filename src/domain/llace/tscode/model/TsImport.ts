//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

export class TsImport {

    readonly name: string
    readonly path: string[]

    constructor(name: string, path: string[]) {
        this.name = name
        this.path = path
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
