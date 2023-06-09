//
// (C) Copyright 2019-2023 Martin E. Nordberg III
// Apache 2.0 License
//


//---------------------------------------------------------------------------------------------------------------------

import {
    LlaceCharLiteralExpr,
    LlaceDateLiteralExpr,
    LlaceDateTimeLiteralExpr,
    LlaceIdentifierExpr,
    LlaceIntegerLiteralExpr,
    LlaceParenthesizedExpr,
    LlaceStringLiteralExpr,
    LlaceInfixOperationExpr,
    LlacePrefixOperationExpr,
    LlaceUuidLiteralExpr,
    LlaceOptionalExpr,
    LlaceArrayTypeExpr,
    LlaceListTypeExpr,
    LlaceSetTypeExpr,
    LlaceMapTypeExpr, LlaceLeadingDocumentationExpr, LlaceTrailingDocumentationExpr, LlaceFunctionCallExpr
} from "../expressions/LlaceExpressions";
import {LlaceIdentifier, LlaceNoIdentifier, LlaceQualifiedIdentifier} from "./LlaceIdentifiers";
import {textOfBinaryOperator, textOfUnaryOperator} from "../expressions/LlaceOperatorMethods";

//---------------------------------------------------------------------------------------------------------------------

export function sExpression(item: any) {
    return s(item)
}

//---------------------------------------------------------------------------------------------------------------------

function s(item: any): String {

    if (item instanceof LlaceArrayTypeExpr) return `(arraytype ${s(item.itemType)})`
    if (item instanceof LlaceCharLiteralExpr) return `(charliteral ${item.text})`
    if (item instanceof LlaceDateLiteralExpr) return `(dateliteral ${item.text})`
    if (item instanceof LlaceDateTimeLiteralExpr) return `(datetimeliteral ${item.text})`
    if (item instanceof LlaceFunctionCallExpr) return `(call ${s(item.functionReference)} ${s(item.argument)})`
    if (item instanceof LlaceIdentifierExpr) return `(identifier ${item.name})`
    if (item instanceof LlaceInfixOperationExpr) return `(${textOfBinaryOperator(item.operator).trim()} ${ss(item.operands)})`
    if (item instanceof LlaceIntegerLiteralExpr) return `(intliteral ${item.text})`
    if (item instanceof LlaceLeadingDocumentationExpr) return `(leadingdoc)`
    if (item instanceof LlaceListTypeExpr) return `(listtype ${s(item.itemType)})`
    if (item instanceof LlaceMapTypeExpr) return `(maptype ${s(item.itemType)} ${s(item.keyType)})`
    if (item instanceof LlaceNoIdentifier) return `(NoIdentifier)`
    if (item instanceof LlaceOptionalExpr) return `(optional ${s(item.lhs)})`
    if (item instanceof LlaceParenthesizedExpr) return `(parenthesized ${ss(item.items)})`
    if (item instanceof LlacePrefixOperationExpr) return `(${textOfUnaryOperator(item.operator).trim()} ${s(item.rhs)})`
    if (item instanceof LlaceQualifiedIdentifier) return `(QualifiedIdentifier ${ss(item.entries)})`
    if (item instanceof LlaceSetTypeExpr) return `(settype ${s(item.itemType)})`
    if (item instanceof LlaceStringLiteralExpr) return `(stringliteral ${item.text})`
    if (item instanceof LlaceTrailingDocumentationExpr) return `(trailingdoc)`
    if (item instanceof LlaceUuidLiteralExpr) return `(uuidliteral ${item.text})`
    console.log(item)
    throw new Error(`Unknown LlaceItem type: ${item.itemType}.`)

}

//---------------------------------------------------------------------------------------------------------------------

function ss(items: any[]) {
    return items.map(item => s(item)).join(` `)
}

//---------------------------------------------------------------------------------------------------------------------


