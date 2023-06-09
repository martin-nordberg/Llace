// # Identifiers and qualified identifiers in Llace code.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceOrigin} from "../../util/LlaceOrigin"

//---------------------------------------------------------------------------------------------------------------------

// The operator type of a binary operator expression
export const LlaceBinaryOperator = {
    Add: 0,
    Compare: 1,
    CompareReversed: 2,
    Divide: 3,
    Document: 4,
    Equality: 5,
    FieldReference: 6,
    FunctionCall: 7,
    GreaterThan: 8,
    GreaterThanOrEquals: 9,
    In: 10,
    Intersect: 11,
    IntersectAssignValue: 12,
    IntersectDefaultValue: 13,
    IntersectLowPrecedence: 14,
    LessThan: 15,
    LessThanOrEquals: 16,
    LogicAnd: 17,
    LogicOr: 18,
    Match: 19,
    Multiply: 20,
    NotMatch: 21,
    Qualify: 22,
    Range: 23,
    Subtract: 24,
    Union: 25,
} as const

export type LlaceBinaryOperator = typeof LlaceBinaryOperator[keyof typeof LlaceBinaryOperator]

//---------------------------------------------------------------------------------------------------------------------

// Unary operators
export const LlaceUnaryOperator = {
    ArithmeticNegation: 0,
    LogicalNegation: 1,
} as const

export type LlaceUnaryOperator = typeof LlaceUnaryOperator[keyof typeof LlaceUnaryOperator]

//---------------------------------------------------------------------------------------------------------------------

// Hierarchy of expression types
export const LlaceExpression$Tag = {

    // '[' x ',' y ',' z ']'
    LlaceArrayLiteralExpr: 0,

    // itemType '[' ']'
    LlaceArrayTypeExpr: 1,

    // 'x'
    LlaceCharLiteralExpr: 2,

    // '2023-01-01'
    LlaceDateLiteralExpr: 3,

    // '2023-01-01T12:00:00Z'
    LlaceDateTimeLiteralExpr: 4,

    // f '(' key1 ':' value1 ',' key2 ':' value2 ')'
    LlaceFunctionCallExpr: 5,

    // name
    LlaceIdentifierExpr: 6,

    // lhs op rhs op ...
    LlaceInfixOperationExpr: 7,

    // 123
    LlaceIntegerLiteralExpr: 8,

    // "//" text to end of line [nothing before the "//" on the first line]
    LlaceLeadingDocumentationExpr: 9,

    // itemType '[' ';' ']'
    LlaceListTypeExpr: 10,

    // itemType '{' keyType '}'
    LlaceMapTypeExpr: 11,

    // "`" to end of line
    LlaceMultilineStringLiteralExpr: 12,

    // X '?'
    LlaceOptionalExpr: 13,

    // '(' inner ')'
    LlaceParenthesizedExpr: 14,

    // '-' rhs
    LlacePrefixOperationExpr: 15,

    // itemType '{' '}'
    LlaceSetTypeExpr: 16,

    // "abc"
    LlaceStringLiteralExpr: 17,

    // "//" text to end of line [something before the "//" on the first line]
    LlaceTrailingDocumentationExpr: 18,

    // '12345678-1234-1234-1234-1234567890AB'
    LlaceUuidLiteralExpr: 19,

} as const

export type LlaceExpression$Tag = typeof LlaceExpression$Tag[keyof typeof LlaceExpression$Tag]

//---------------------------------------------------------------------------------------------------------------------

// Hierarchy of expression types
export abstract class LlaceExpression {

    readonly LlaceExpression$Tag: LlaceExpression$Tag
    readonly origin: LlaceOrigin

    protected constructor(
        LlaceExpression$Tag: LlaceExpression$Tag,
        origin: LlaceOrigin
    ) {
        this.LlaceExpression$Tag = LlaceExpression$Tag
        this.origin = origin
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '[' x ',' y ',' z ']'
export class LlaceArrayLiteralExpr extends LlaceExpression {

    readonly elements: LlaceExpression[]

    constructor(
        origin: LlaceOrigin,
        elements: LlaceExpression[],
    ) {
        super(
            LlaceExpression$Tag.LlaceArrayLiteralExpr,
            origin
        )
        this.elements = elements
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// itemType '[' ']'
export class LlaceArrayTypeExpr extends LlaceExpression {

    readonly itemType: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        itemType: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlaceArrayTypeExpr,
            origin
        )
        this.itemType = itemType
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// `sdfg sdfg sdfg sdgf
export class LlaceLeadingDocumentationExpr extends LlaceExpression {

    readonly lines: string[]

    constructor(
        origin: LlaceOrigin,
        lines: string[],
    ) {
        super(
            LlaceExpression$Tag.LlaceLeadingDocumentationExpr,
            origin,
        )
        this.lines = lines
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// `sdfg sdfg sdfg sdgf
export class LlaceTrailingDocumentationExpr extends LlaceExpression {

    readonly lines: string[]

    constructor(
        origin: LlaceOrigin,
        lines: string[],
    ) {
        super(
            LlaceExpression$Tag.LlaceTrailingDocumentationExpr,
            origin,
        )
        this.lines = lines
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// 'x'
export class LlaceCharLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceCharLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '2023-01-01'
export class LlaceDateLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceDateLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '2023-01-01T12:00:00Z'
export class LlaceDateTimeLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceDateTimeLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// f(x:1)
export class LlaceFunctionCallExpr extends LlaceExpression {

    readonly functionReference: LlaceExpression
    readonly argument: LlaceParenthesizedExpr

    constructor(
        origin: LlaceOrigin,
        functionReference: LlaceExpression,
        argument: LlaceParenthesizedExpr,
    ) {
        super(
            LlaceExpression$Tag.LlaceFunctionCallExpr,
            origin,
        )
        this.functionReference = functionReference
        this.argument = argument
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// name
export class LlaceIdentifierExpr extends LlaceExpression {

    readonly name: string

    constructor(
        origin: LlaceOrigin,
        name: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceIdentifierExpr,
            origin,
        )
        this.name = name
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// lhs op rhs
export class LlaceInfixOperationExpr extends LlaceExpression {

    readonly operator: LlaceBinaryOperator
    readonly operands: LlaceExpression[]

    constructor(
        origin: LlaceOrigin,
        operator: LlaceBinaryOperator,
        operands: LlaceExpression[],
    ) {
        super(
            LlaceExpression$Tag.LlaceInfixOperationExpr,
            origin,
        )
        this.operator = operator
        this.operands = operands
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// 123
export class LlaceIntegerLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceIntegerLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// itemType '[' ';' ']'
export class LlaceListTypeExpr extends LlaceExpression {

    readonly itemType: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        itemType: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlaceListTypeExpr,
            origin,
        )
        this.itemType = itemType
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// itemType '{' keyType '}'
export class LlaceMapTypeExpr extends LlaceExpression {

    readonly itemType: LlaceExpression
    readonly keyType: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        itemType: LlaceExpression,
        keyType: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlaceMapTypeExpr,
            origin,
        )
        this.itemType = itemType
        this.keyType = keyType
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// ` sdfg sdfg sdfg sdgf
export class LlaceMultilineStringLiteralExpr extends LlaceExpression {

    readonly lines: string[]

    constructor(
        origin: LlaceOrigin,
        lines: string[],
    ) {
        super(
            LlaceExpression$Tag.LlaceMultilineStringLiteralExpr,
            origin,
        )
        this.lines = lines
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// X '?'
export class LlaceOptionalExpr extends LlaceExpression {

    readonly lhs: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        lhs: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlaceOptionalExpr,
            origin,
        )
        this.lhs = lhs
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '(' inner ')'
export class LlaceParenthesizedExpr extends LlaceExpression {

    readonly items: LlaceExpression[]

    constructor(
        origin: LlaceOrigin,
        items: LlaceExpression[],
    ) {
        super(
            LlaceExpression$Tag.LlaceParenthesizedExpr,
            origin,
        )
        this.items = items
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// itemType '{' '}'
export class LlaceSetTypeExpr extends LlaceExpression {

    readonly itemType: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        itemType: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlaceSetTypeExpr,
            origin,
        )
        this.itemType = itemType
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// "abc"
export class LlaceStringLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceStringLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '-' rhs
export class LlacePrefixOperationExpr extends LlaceExpression {

    readonly operator: LlaceUnaryOperator
    readonly rhs: LlaceExpression

    constructor(
        origin: LlaceOrigin,
        operator: LlaceUnaryOperator,
        rhs: LlaceExpression,
    ) {
        super(
            LlaceExpression$Tag.LlacePrefixOperationExpr,
            origin,
        )
        this.operator = operator
        this.rhs = rhs
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------

// '12345678-1234-1234-1234-1234567890AB'
export class LlaceUuidLiteralExpr extends LlaceExpression {

    readonly text: string

    constructor(
        origin: LlaceOrigin,
        text: string,
    ) {
        super(
            LlaceExpression$Tag.LlaceUuidLiteralExpr,
            origin,
        )
        this.text = text
        Object.freeze(this)
    }

}

//---------------------------------------------------------------------------------------------------------------------
