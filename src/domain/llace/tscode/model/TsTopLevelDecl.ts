//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

import type {TsField} from "./TsField"
import type {TsComments} from "./TsComments"
import type {TsEnumerand} from "./TsEnumerand";

export const TsTopLevelDecl$Tag = {
    TsClass: 0,
    TsEnumeration: 1,
    TsValue: 2
} as const

export type TsTopLevelDecl$Tag = typeof TsTopLevelDecl$Tag[keyof typeof TsTopLevelDecl$Tag];

export abstract class TsTopLevelDecl {

    readonly TsTopLevelDecl$Tag: TsTopLevelDecl$Tag
    readonly comments: TsComments
    readonly isExported: boolean
    readonly name: string

    protected constructor(
        TsTopLevelDecl$Tag: TsTopLevelDecl$Tag,
        comments: TsComments,
        isExported: boolean,
        name: string
    ) {
        this.TsTopLevelDecl$Tag = TsTopLevelDecl$Tag
        this.comments = comments
        this.isExported = isExported
        this.name = name
    }

}

/**
 * A record or option data class.
 */
export class TsClass extends TsTopLevelDecl {

    readonly baseClassName: string | null
    readonly baseClassFields: TsField[]
    readonly fields: TsField[]
    readonly isAbstract: boolean
    readonly tagValues: string[]

    constructor(
        comments: TsComments,
        isExported: boolean,
        name: string,
        isAbstract: boolean,
        baseClassName: string | null,
        baseClassFields: TsField[],
        fields: TsField[],
        tagValues: string[]
    ) {
        super(TsTopLevelDecl$Tag.TsClass, comments, isExported, name)
        this.isAbstract = isAbstract
        this.baseClassName = baseClassName
        this.baseClassFields = baseClassFields
        this.fields = fields
        this.tagValues = tagValues
    }

}

/**
 * Typescript class representing a Llace option type with only constant options.
 */
export class TsEnumeration extends TsTopLevelDecl {

    readonly enumerands: TsEnumerand[]

    constructor(
        comments: TsComments,
        isExported: boolean,
        name: string,
        enumerands: TsEnumerand[]
    ) {
        super(TsTopLevelDecl$Tag.TsEnumeration, comments, isExported, name)
        this.enumerands = enumerands
        Object.freeze(this)
    }

}

/**
 * A constant or variable.
 */
export class TsValue extends TsTopLevelDecl {

    readonly isConstant: boolean
    readonly initialValue: string

    constructor(
        comments: TsComments,
        isExported: boolean,
        name: string,
        isConstant: boolean,
        initialValue: string
    ) {
        super(TsTopLevelDecl$Tag.TsValue, comments, isExported, name)
        this.isConstant = isConstant
        this.initialValue = initialValue
    }

}


//---------------------------------------------------------------------------------------------------------------------

