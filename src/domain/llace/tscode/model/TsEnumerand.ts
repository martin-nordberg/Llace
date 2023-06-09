//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TsComments} from "./TsComments";

//---------------------------------------------------------------------------------------------------------------------

export class TsEnumerand {

    readonly comments: TsComments
    readonly name: string

    constructor(comments: TsComments, name: string) {
        this.comments = comments
        this.name = name
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
