//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {CodeStringBuilder, VerticalSpacing} from "../../util/text/CodeStringBuilder";
import {
    LlaceArrayLiteralExpr,
    LlaceArrayTypeExpr,
    LlaceInfixOperationExpr,
    LlaceBinaryOperator,
    LlaceCharLiteralExpr,
    LlaceDateLiteralExpr,
    LlaceDateTimeLiteralExpr,
    LlaceExpression,
    LlaceExpression$Tag,
    LlaceIdentifierExpr,
    LlaceIntegerLiteralExpr,
    LlaceListTypeExpr,
    LlaceMapTypeExpr,
    LlaceOptionalExpr,
    LlaceParenthesizedExpr,
    LlaceSetTypeExpr,
    LlaceStringLiteralExpr,
    LlacePrefixOperationExpr,
    LlaceUuidLiteralExpr,
    LlaceLeadingDocumentationExpr,
    LlaceTrailingDocumentationExpr, LlaceFunctionCallExpr,
} from "../model/expressions/LlaceExpressions";
import {textOfBinaryOperator, textOfUnaryOperator} from "../model/expressions/LlaceOperatorMethods";

//---------------------------------------------------------------------------------------------------------------------

export class LlaceExpressionWriter {

    #findSubExpressions(expression: LlaceExpression): LlaceExpression[] {

        switch (expression.LlaceExpression$Tag) {
            case LlaceExpression$Tag.LlaceArrayLiteralExpr:
                return (expression as LlaceArrayLiteralExpr).elements
            case LlaceExpression$Tag.LlaceArrayTypeExpr:
                return [(expression as LlaceArrayTypeExpr).itemType]
            case LlaceExpression$Tag.LlaceFunctionCallExpr:
                return [(expression as LlaceFunctionCallExpr).functionReference, (expression as LlaceFunctionCallExpr).argument]
            case LlaceExpression$Tag.LlaceInfixOperationExpr:
                return (expression as LlaceInfixOperationExpr).operands
            case LlaceExpression$Tag.LlaceListTypeExpr:
                return [(expression as LlaceListTypeExpr).itemType]
            case LlaceExpression$Tag.LlaceMapTypeExpr:
                return [(expression as LlaceMapTypeExpr).itemType, (expression as LlaceMapTypeExpr).keyType]
            case LlaceExpression$Tag.LlaceOptionalExpr:
                return [(expression as LlaceOptionalExpr).lhs]
            case LlaceExpression$Tag.LlaceParenthesizedExpr:
                return (expression as LlaceParenthesizedExpr).items
            case LlaceExpression$Tag.LlaceSetTypeExpr:
                return [(expression as LlaceSetTypeExpr).itemType]
            case LlaceExpression$Tag.LlacePrefixOperationExpr:
                return [(expression as LlacePrefixOperationExpr).rhs]

            case LlaceExpression$Tag.LlaceCharLiteralExpr:
            case LlaceExpression$Tag.LlaceDateLiteralExpr:
            case LlaceExpression$Tag.LlaceDateTimeLiteralExpr:
            case LlaceExpression$Tag.LlaceIdentifierExpr:
            case LlaceExpression$Tag.LlaceIntegerLiteralExpr:
            case LlaceExpression$Tag.LlaceLeadingDocumentationExpr:
            case LlaceExpression$Tag.LlaceMultilineStringLiteralExpr:
            case LlaceExpression$Tag.LlaceStringLiteralExpr:
            case LlaceExpression$Tag.LlaceTrailingDocumentationExpr:
            case LlaceExpression$Tag.LlaceUuidLiteralExpr:
                return []

            default:
                throw new Error(`Unhandled expression type: ${expression.LlaceExpression$Tag}`)
        }

    }

    /**
     * Determines how much vertical spacing to use for an expression.
     */
    #getItemSpacing(expression: LlaceExpression): VerticalSpacing {

        const items = this.#findSubExpressions(expression)

        let result = (items.length > 2) ? VerticalSpacing.MULTIPLE_LINES : VerticalSpacing.NONE

        if (expression.LlaceExpression$Tag === LlaceExpression$Tag.LlaceInfixOperationExpr &&
            (expression as LlaceInfixOperationExpr).operator === LlaceBinaryOperator.Document) {

            const tag = (expression as LlaceInfixOperationExpr).operands[0].LlaceExpression$Tag
            if (tag === LlaceExpression$Tag.LlaceLeadingDocumentationExpr) {
                return VerticalSpacing.WHITESPACE
            }
            result = VerticalSpacing.MULTIPLE_LINES
        }

        for (let item of items) {

            const subResult = this.#getItemSpacing(item)

            if (subResult === VerticalSpacing.WHITESPACE) {
                return VerticalSpacing.WHITESPACE
            }

            if (subResult === VerticalSpacing.MULTIPLE_LINES) {
                result = VerticalSpacing.MULTIPLE_LINES
            }

        }

        return result

    }

    #writeArrayLiteralExpr(output: CodeStringBuilder, expression: LlaceArrayLiteralExpr) {

        output.append("[")

        let delimiter = ""
        for (let element of expression.elements) {
            output.append(delimiter)
            delimiter = ", "
            this.writeExpression(output, element)
        }

        output.append("]")

    }

    #writeCommaSeparatedExpressions(output: CodeStringBuilder, expressions: LlaceExpression[]) {

        let delimiter = ""

        for (let expression of expressions) {

            if (delimiter.length > 0) {
                output.append(delimiter)
                output.appendVerticalSpacing()
            } else {
                delimiter = ", "
            }

            this.writeExpression(output, expression)

        }

        output.appendVerticalSpacing()

    }

    #writeDocumentExpr(output: CodeStringBuilder, operands: LlaceExpression[]) {

        for (let operand of operands) {
            this.writeExpression(output, operand)
        }

    }

    writeExpression(output: CodeStringBuilder, expression: LlaceExpression) {

        switch (expression.LlaceExpression$Tag) {
            case LlaceExpression$Tag.LlaceArrayLiteralExpr:
                this.#writeArrayLiteralExpr(output, (expression as LlaceArrayLiteralExpr))
                break
            case LlaceExpression$Tag.LlaceArrayTypeExpr:
                this.writeExpression(output, (expression as LlaceArrayTypeExpr).itemType)
                output.append("[]")
                break
            case LlaceExpression$Tag.LlaceInfixOperationExpr:
                const expr = expression as LlaceInfixOperationExpr
                if (expr.operator === LlaceBinaryOperator.Union) {
                    this.#writeUnionExpr(output, expr)
                } else if (expr.operator === LlaceBinaryOperator.Document) {
                    this.#writeDocumentExpr(output, expr.operands)
                } else {
                    this.#writeInfixExpr(output, expr.operator, expr.operands)
                }
                break
            case LlaceExpression$Tag.LlaceCharLiteralExpr:
                output.append((expression as LlaceCharLiteralExpr).text)
                break
            case LlaceExpression$Tag.LlaceDateLiteralExpr:
                output.append((expression as LlaceDateLiteralExpr).text)
                break
            case LlaceExpression$Tag.LlaceDateTimeLiteralExpr:
                output.append((expression as LlaceDateTimeLiteralExpr).text)
                break
            case LlaceExpression$Tag.LlaceFunctionCallExpr:
                this.writeExpression(output, (expression as LlaceFunctionCallExpr).functionReference)
                this.#writeParenthesizedExpr(output, (expression as LlaceFunctionCallExpr).argument)
                break
            case LlaceExpression$Tag.LlaceIdentifierExpr:
                output.append((expression as LlaceIdentifierExpr).name)
                break
            case LlaceExpression$Tag.LlaceIntegerLiteralExpr:
                output.append((expression as LlaceIntegerLiteralExpr).text)
                break
            case LlaceExpression$Tag.LlaceLeadingDocumentationExpr:
                for (let line of (expression as LlaceLeadingDocumentationExpr).lines) {
                    output.append(line)
                    output.appendNewLine()
                }
                break
            case LlaceExpression$Tag.LlaceListTypeExpr:
                this.writeExpression(output, (expression as LlaceListTypeExpr).itemType)
                output.append("[;]")
                break
            case LlaceExpression$Tag.LlaceMapTypeExpr:
                this.writeExpression(output, (expression as LlaceMapTypeExpr).itemType)
                output.append("{")
                this.writeExpression(output, (expression as LlaceMapTypeExpr).keyType)
                output.append("}")
                break
            case LlaceExpression$Tag.LlaceMultilineStringLiteralExpr:
                output.indentedToCurrentLevel( outp => {
                    for (let line of (expression as LlaceLeadingDocumentationExpr).lines) {
                        outp.append(line)
                        outp.appendNewLine()
                    }
                })
                break
            case LlaceExpression$Tag.LlaceOptionalExpr:
                this.writeExpression(output, (expression as LlaceOptionalExpr).lhs)
                output.append("?")
                break
            case LlaceExpression$Tag.LlaceParenthesizedExpr:
                this.#writeParenthesizedExpr(output, expression as LlaceParenthesizedExpr)
                break
            case LlaceExpression$Tag.LlacePrefixOperationExpr:
                output.append(textOfUnaryOperator((expression as LlacePrefixOperationExpr).operator))
                this.writeExpression(output, (expression as LlacePrefixOperationExpr).rhs)
                break
            case LlaceExpression$Tag.LlaceSetTypeExpr:
                this.writeExpression(output, (expression as LlaceSetTypeExpr).itemType)
                output.append("{}")
                break
            case LlaceExpression$Tag.LlaceStringLiteralExpr:
                output.append((expression as LlaceStringLiteralExpr).text)
                break
            case LlaceExpression$Tag.LlaceTrailingDocumentationExpr:
                const lines = (expression as LlaceTrailingDocumentationExpr).lines.map(line => "  " + line)
                output.setTrailingDocumentation(lines)
                break
            case LlaceExpression$Tag.LlaceUuidLiteralExpr:
                output.append((expression as LlaceUuidLiteralExpr).text)
                break
            default:
                throw new Error(`Unhandled expression type: ${expression.LlaceExpression$Tag}`)
        }

    }

    #writeInfixExpr(output: CodeStringBuilder, operator: LlaceBinaryOperator, operands: LlaceExpression[]) {

        this.writeExpression(output, operands[0])

        for (let i = 1; i < operands.length; i += 1) {

            output.append(textOfBinaryOperator(operator))

            this.writeExpression(output, operands[i])

        }

    }

    #writeParenthesizedExpr(output: CodeStringBuilder, expression: LlaceParenthesizedExpr) {

        output.append("(")

        let verticalSpacing = this.#getItemSpacing(expression)

        output.verticallySpaced(verticalSpacing, outp => {

            output.appendVerticalSpacing()

            outp.indentedIfVerticallySpaced(outpt => {
                this.#writeCommaSeparatedExpressions(outpt, expression.items)
            })

        })

        output.append(")")

    }

    #writeUnionExpr(output: CodeStringBuilder, expression: LlaceInfixOperationExpr) {

        let delimiter = ""

        let verticalSpacing = this.#getItemSpacing(expression)

        output.verticallySpaced(verticalSpacing, outp => {

            for (let operand of expression.operands) {

                outp.appendVerticalSpacing()

                outp.indentedIfVerticallySpaced(outpt => {
                    outpt.append(delimiter)
                    delimiter = " | "
                    this.writeExpression(outpt, operand)
                })

            }

        })

    }

    writeUnparenthesizedExprItems(output: CodeStringBuilder, expression: LlaceParenthesizedExpr) {

        let verticalSpacing = this.#getItemSpacing(expression)

        output.appendNewLine()

        output.verticallySpaced(verticalSpacing, outpt => {
            this.#writeCommaSeparatedExpressions(outpt, expression.items)
        })

    }

}

//---------------------------------------------------------------------------------------------------------------------
