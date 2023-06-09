//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TsComments} from "./TsComments";

//---------------------------------------------------------------------------------------------------------------------

export class TsField {

    readonly comments: TsComments
    readonly name: string
    readonly type: string

    constructor(comments: TsComments, name: string, type: string) {
        this.comments = comments
        this.name = name
        this.type = type
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
