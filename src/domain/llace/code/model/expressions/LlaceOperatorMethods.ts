//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceBinaryOperator, LlaceUnaryOperator} from "./LlaceExpressions"

//---------------------------------------------------------------------------------------------------------------------

export function textOfBinaryOperator(operator: LlaceBinaryOperator) {

    switch (operator) {
        case LlaceBinaryOperator.Add:
            return " + "
        case LlaceBinaryOperator.Compare:
            return " <=> "
        case LlaceBinaryOperator.CompareReversed:
            return " >=< "
        case LlaceBinaryOperator.Divide:
            return " / "
        case LlaceBinaryOperator.Document:
            return " "
        case LlaceBinaryOperator.Equality:
            return " == "
        case LlaceBinaryOperator.FieldReference:
            return "."
        case LlaceBinaryOperator.FunctionCall:
            return " -> "
        case LlaceBinaryOperator.GreaterThan:
            return " > "
        case LlaceBinaryOperator.GreaterThanOrEquals:
            return " >= "
        case LlaceBinaryOperator.In:
            return " in "
        case LlaceBinaryOperator.Intersect:
            return " & "
        case LlaceBinaryOperator.IntersectAssignValue:
            return " = "
        case LlaceBinaryOperator.IntersectDefaultValue:
            return " ?: "
        case LlaceBinaryOperator.IntersectLowPrecedence:
            return " && "
        case LlaceBinaryOperator.Is:
            return " is "
        case LlaceBinaryOperator.LessThan:
            return " < "
        case LlaceBinaryOperator.LessThanOrEquals:
            return " <= "
        case LlaceBinaryOperator.LogicAnd:
            return " and "
        case LlaceBinaryOperator.LogicOr:
            return " or "
        case LlaceBinaryOperator.Match:
            return " =~ "
        case LlaceBinaryOperator.Multiply:
            return " * "
        case LlaceBinaryOperator.NotMatch:
            return " !~ "
        case LlaceBinaryOperator.Qualify:
            return ": "
        case LlaceBinaryOperator.Range:
            return ".."
        case LlaceBinaryOperator.Subtract:
            return " - "
        case LlaceBinaryOperator.Union:
            return " | "

        default:
            throw new Error(`Unhandled binary operator: '${operator}'.`)

    }

}

//---------------------------------------------------------------------------------------------------------------------

export function textOfUnaryOperator(operator: LlaceUnaryOperator) {

    switch (operator) {
        case LlaceUnaryOperator.ArithmeticNegation:
            return "-"

        case LlaceUnaryOperator.LogicalNegation:
            return "not "

        default:
            throw new Error(`Unhandled unary operator: '${operator}'.`)

    }

}

//---------------------------------------------------------------------------------------------------------------------
