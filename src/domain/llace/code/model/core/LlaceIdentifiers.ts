// # Identifiers and qualified identifiers in Llace code.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceOrigin} from "../../util/LlaceOrigin"

//---------------------------------------------------------------------------------------------------------------------

// Variant type representing an optional identifier.
// TODO: Evolve to just "LlaceIdentifier?"
export const LlaceOptIdentifier$Tag = {

    // Null object implementation when an optional identifier is not present.
    LlaceNoIdentifier: 0,

    // A single name identifier.
    LlaceIdentifier: 1,

} as const

export type LlaceOptIdentifier$Tag = typeof LlaceOptIdentifier$Tag[keyof typeof LlaceOptIdentifier$Tag]

//---------------------------------------------------------------------------------------------------------------------

// Variant type representing an optional identifier.
// TODO: Evolve to just "LlaceIdentifier?"
export abstract class LlaceOptIdentifier {

    readonly LlaceOptIdentifier$Tag: LlaceOptIdentifier$Tag

    protected constructor(
        LlaceOptIdentifier$Tag: LlaceOptIdentifier$Tag,
    ) {
        this.LlaceOptIdentifier$Tag = LlaceOptIdentifier$Tag
    }

}

//---------------------------------------------------------------------------------------------------------------------

// Null object implementation when an optional identifier is not present.
export class LlaceNoIdentifier extends LlaceOptIdentifier {

    constructor(
    ) {
        super(
            LlaceOptIdentifier$Tag.LlaceNoIdentifier,
        )
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// A single name identifier.
export class LlaceIdentifier extends LlaceOptIdentifier {

    readonly origin: LlaceOrigin
    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceOptIdentifier$Tag.LlaceIdentifier,
        )
        this.origin = origin
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// sequence of identifiers connected by periods.
export class LlaceQualifiedIdentifier {

    // The individual identifiers making up the qualified identifier.
    readonly entries: LlaceIdentifier[]

    // The origin of the identifier.
    readonly origin: LlaceOrigin

    constructor(
        entries: LlaceIdentifier[],
        origin: LlaceOrigin,
    ) {
        this.entries = entries
        this.origin = origin
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
