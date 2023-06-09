//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

// https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html

import {LlaceParser} from "./LlaceParser";
import {LlaceScannerBuffer} from "../scanning/LlaceScannerBuffer";
import {LlaceToken, LlaceTokenType} from "../scanning/LlaceTokens";
import {
    LlaceArrayLiteralExpr,
    LlaceArrayTypeExpr,
    LlaceInfixOperationExpr,
    LlaceBinaryOperator,
    LlaceCharLiteralExpr,
    LlaceDateLiteralExpr,
    LlaceDateTimeLiteralExpr,
    LlaceExpression,
    LlaceIdentifierExpr,
    LlaceIntegerLiteralExpr,
    LlaceListTypeExpr,
    LlaceMapTypeExpr,
    LlaceOptionalExpr,
    LlaceParenthesizedExpr,
    LlaceSetTypeExpr,
    LlaceStringLiteralExpr,
    LlacePrefixOperationExpr,
    LlaceUnaryOperator,
    LlaceUuidLiteralExpr,
    LlaceLeadingDocumentationExpr,
    LlaceTrailingDocumentationExpr,
    LlaceFunctionCallExpr, LlaceMultilineStringLiteralExpr,
} from "../model/expressions/LlaceExpressions";
import {LlaceOrigin} from "../util/LlaceOrigin";
import {BindingPower} from "./BindingPower";

//---------------------------------------------------------------------------------------------------------------------

export class LlaceExpressionParser extends LlaceParser {

    constructor(
        scanner: LlaceScannerBuffer,
        fileName: string
    ) {
        super(scanner, fileName);
    }

    /**
     * Constructs an infix operator expression from given operator token [opToken], left-hand side [lhs],
     * and right-hand side [rhs].
     */
    #makeInfixExpression(
        lhs: LlaceExpression,
        operatorOrigin: LlaceOrigin,
        operator: LlaceBinaryOperator,
        rhs: LlaceExpression
    ): LlaceInfixOperationExpr {

        if (lhs instanceof LlaceInfixOperationExpr &&
            (lhs as LlaceInfixOperationExpr).operator === operator) {
            return new LlaceInfixOperationExpr(lhs.origin, operator, (lhs as LlaceInfixOperationExpr).operands.concat(rhs))
        }

        return new LlaceInfixOperationExpr(operatorOrigin, operator, [lhs, rhs])

    }

    /**
     * Parses an array literal: '[' x ',' y ',' z ']'
     * @param origin where the already consumed opening '[' occurred.
     */
    #parseArrayLiteral(origin: LlaceOrigin): LlaceArrayLiteralExpr {

        if (this.scanner.advanceTokenIfType(LlaceTokenType.RIGHT_BRACKET)) {
            return new LlaceArrayLiteralExpr(origin, [])
        }

        const elements: LlaceExpression[] = []
        while (true) {
            elements.push(this.#parseExpression(0))
            if (!this.scanner.advanceTokenIfType(LlaceTokenType.COMMA)) {
                break
            }
        }

        this.consumeType(LlaceTokenType.RIGHT_BRACKET)

        return new LlaceArrayLiteralExpr(origin, elements)

    }

    /**
     * Parses a Llace expression.
     */
    parseExpression(): LlaceExpression {
        return this.#parseExpression(0)
    }

    /**
     * Parses an expression until the next operator has a left binding power
     * lower than [minBindingPower] or the next token is not part of an expression.
     */
    #parseExpression(minBindingPower: number): LlaceExpression {

        let lhs = this.#parseLeftHandSide()

        while (true) {

            // Look ahead for an operator continuing the expression
            const opToken = this.scanner.peekToken()

            // Handle postfix operators ...
            const pBindingPower = postfixBindingPower.get(opToken.type)

            if (pBindingPower != null) {

                if (pBindingPower < minBindingPower) {
                    break
                }

                this.scanner.readToken()

                lhs = this.#parsePostfixExpression(opToken, lhs)

                continue

            }

            // Handle infix operators ...
            const bindingPower = infixBindingPower.get(opToken.type)

            if (bindingPower != null) {

                if (bindingPower.left < minBindingPower) {
                    break
                }

                this.scanner.readToken()

                const rhs = this.#parseExpression(bindingPower.right)

                lhs = this.#makeInfixExpression(lhs, opToken.origin, bindingPower.operator, rhs)

                continue

            }

            break

        }

        return lhs

    }

    /**
     * Parses the left-hand side of a larger expression. Handles identifiers, literals,
     * prefix operators, and parentheses.
     */
    #parseLeftHandSide(): LlaceExpression {

        const token = this.scanner.readToken()

        switch (token.type) {

            case LlaceTokenType.CHAR_LITERAL:
                return new LlaceCharLiteralExpr(token.origin, token.text)

            case LlaceTokenType.DASH:
                return this.#parsePrefixOperationExpression(token.origin, token.type, LlaceUnaryOperator.ArithmeticNegation)

            case LlaceTokenType.DATE_LITERAL:
                return new LlaceDateLiteralExpr(token.origin, token.text)

            case LlaceTokenType.DATETIME_LITERAL:
                return new LlaceDateTimeLiteralExpr(token.origin, token.text)

            case LlaceTokenType.IDENTIFIER:
                return new LlaceIdentifierExpr(token.origin, token.text)

            case LlaceTokenType.INTEGER_LITERAL:
                return new LlaceIntegerLiteralExpr(token.origin, token.text)

            case LlaceTokenType.LEADING_DOCUMENTATION: {
                const rawLines = token.text.split("\n")
                const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0)
                return new LlaceLeadingDocumentationExpr(token.origin, lines)
            }

            case LlaceTokenType.LEFT_BRACKET:
                return this.#parseArrayLiteral(token.origin)

            case LlaceTokenType.LEFT_PARENTHESIS:
                return this.#parseParenthesizedExpression(token.origin, LlaceTokenType.RIGHT_PARENTHESIS)

            case LlaceTokenType.MULTILINE_STRING:
                const rawLines = token.text.split("\n")
                const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0)
                return new LlaceMultilineStringLiteralExpr(token.origin, lines)

            case LlaceTokenType.NOT:
                return this.#parsePrefixOperationExpression(token.origin, token.type, LlaceUnaryOperator.LogicalNegation)

            case LlaceTokenType.STRING_LITERAL:
                return new LlaceStringLiteralExpr(token.origin, token.text)

            case LlaceTokenType.TRAILING_DOCUMENTATION: {
                const rawLines = token.text.split("\n")
                const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0)
                return new LlaceTrailingDocumentationExpr(token.origin, lines)
            }

            case LlaceTokenType.UUID_LITERAL:
                return new LlaceUuidLiteralExpr(token.origin, token.text)

            default:
                this.expectedType(
                    LlaceTokenType.CHAR_LITERAL,
                    LlaceTokenType.DASH,
                    LlaceTokenType.IDENTIFIER,
                    LlaceTokenType.INTEGER_LITERAL,
                    LlaceTokenType.STRING_LITERAL
                )

        }

    }

    /**
     * Parses a parenthesized expression after consuming the opening parenthesis.
     * @param origin the origin of the already consumed left parenthesis.
     * @param endingTokenType the token expected to end the sequence of expressions (right paren or eof).
     */
    #parseParenthesizedExpression(origin: LlaceOrigin, endingTokenType: LlaceTokenType): LlaceParenthesizedExpr {

        const items: LlaceExpression[] = []

        while (!this.scanner.peekTokenIsType(endingTokenType)) {
            // Parse one expression.
            items.push(this.#parseExpression(0))

            if (!this.scanner.advanceTokenIfType(LlaceTokenType.COMMA)) {
                break
            }
        }

        this.consumeType(endingTokenType)

        return new LlaceParenthesizedExpr(origin, items)

    }

    #parsePostfixExpression(opToken: LlaceToken, lhs: LlaceExpression): LlaceExpression {
        switch (opToken.type) {
            case LlaceTokenType.LEFT_BRACE:
                if (this.scanner.advanceTokenIfType(LlaceTokenType.RIGHT_BRACE)) {
                    return new LlaceSetTypeExpr(opToken.origin, lhs)
                }
                const keyType = this.parseExpression()
                this.consumeType(LlaceTokenType.RIGHT_BRACE)
                return new LlaceMapTypeExpr(opToken.origin, lhs, keyType)
            case LlaceTokenType.LEFT_BRACKET:
                if (this.scanner.advanceTokenIfType(LlaceTokenType.SEMICOLON)) {
                    this.consumeType(LlaceTokenType.RIGHT_BRACKET)
                    return new LlaceListTypeExpr(opToken.origin, lhs)
                }
                if (this.scanner.advanceTokenIfType(LlaceTokenType.RIGHT_BRACKET)) {
                    return new LlaceArrayTypeExpr(opToken.origin, lhs)
                }
                throw new Error("Array index expression not yet implemented")
            case LlaceTokenType.LEFT_PARENTHESIS:
                const args = this.#parseParenthesizedExpression(opToken.origin, LlaceTokenType.RIGHT_PARENTHESIS)
                return new LlaceFunctionCallExpr(opToken.origin, lhs, args)
            case LlaceTokenType.QUESTION_MARK:
                return new LlaceOptionalExpr(opToken.origin, lhs)
            default:
                throw new Error(`Unhandled postfix operator: ${opToken.type} - '${opToken.text}'.`)
        }
    }

    /**
     * Parses a non-empty sequence of code expected to be the items within a record literal, e.g. the top level
     * of a file.
     */
    parseParenthesizedItems(): LlaceParenthesizedExpr {
        return this.#parseParenthesizedExpression(this.scanner.peekToken().origin, LlaceTokenType.EOF)
    }

    /**
     * Parses a unary minus expression after the initial minus sign has been consumed.
     * @param origin the origin of the prefix operator
     * @param tokenType the prefix operator token type
     * @param operator the unary operator corresponding to the token
     */
    #parsePrefixOperationExpression(origin: LlaceOrigin, tokenType: LlaceTokenType, operator: LlaceUnaryOperator): LlacePrefixOperationExpr {
        const rightBindingPower = prefixBindingPower.get(tokenType)!
        const rhs = this.#parseExpression(rightBindingPower)
        return new LlacePrefixOperationExpr(origin, operator, rhs)
    }

}

//---------------------------------------------------------------------------------------------------------------------

/** Binding power pairs for infix operators. */
const infixBindingPower = new Map<LlaceTokenType, BindingPower>()

/** Binding powers for prefix operators. */
const prefixBindingPower = new Map<LlaceTokenType, number>()

/** Binding powers for postfix operators. */
const postfixBindingPower = new Map<LlaceTokenType, number>()

// Binding power table defining operator precedences
infixBindingPower.set(LlaceTokenType.COLON, new BindingPower(10, 20, LlaceBinaryOperator.Qualify))
infixBindingPower.set(LlaceTokenType.EQUALS, new BindingPower(10, 20, LlaceBinaryOperator.IntersectAssignValue))
infixBindingPower.set(LlaceTokenType.QUESTION_MARK_COLON, new BindingPower(10, 20, LlaceBinaryOperator.IntersectDefaultValue))

infixBindingPower.set(LlaceTokenType.AMPERSAND_AMPERSAND, new BindingPower(30, 40, LlaceBinaryOperator.IntersectLowPrecedence))

infixBindingPower.set(LlaceTokenType.VERTICAL_BAR, new BindingPower(50, 60, LlaceBinaryOperator.Union))

infixBindingPower.set(LlaceTokenType.AMPERSAND, new BindingPower(70, 80, LlaceBinaryOperator.Intersect))

infixBindingPower.set(LlaceTokenType.SYNTH_DOCUMENT, new BindingPower(90, 100, LlaceBinaryOperator.Document))

infixBindingPower.set(LlaceTokenType.OR, new BindingPower(110, 120, LlaceBinaryOperator.LogicOr))

infixBindingPower.set(LlaceTokenType.AND, new BindingPower(130, 140, LlaceBinaryOperator.LogicAnd))

prefixBindingPower.set(LlaceTokenType.NOT, 150)

infixBindingPower.set(LlaceTokenType.COMPARE, new BindingPower(170, 180, LlaceBinaryOperator.Compare))
infixBindingPower.set(LlaceTokenType.COMPARE_REVERSED, new BindingPower(170, 180, LlaceBinaryOperator.CompareReversed))

infixBindingPower.set(LlaceTokenType.EQUALS_EQUALS, new BindingPower(190, 200, LlaceBinaryOperator.Equality))
infixBindingPower.set(LlaceTokenType.GREATER_THAN, new BindingPower(190, 200, LlaceBinaryOperator.GreaterThan))
infixBindingPower.set(LlaceTokenType.GREATER_THAN_OR_EQUALS, new BindingPower(190, 200, LlaceBinaryOperator.GreaterThanOrEquals))
infixBindingPower.set(LlaceTokenType.LESS_THAN, new BindingPower(190, 200, LlaceBinaryOperator.LessThan))
infixBindingPower.set(LlaceTokenType.LESS_THAN_OR_EQUALS, new BindingPower(190, 200, LlaceBinaryOperator.LessThanOrEquals))

infixBindingPower.set(LlaceTokenType.IN, new BindingPower(210, 220, LlaceBinaryOperator.In))
infixBindingPower.set(LlaceTokenType.MATCHES, new BindingPower(210, 220, LlaceBinaryOperator.Match))
infixBindingPower.set(LlaceTokenType.NOT_MATCHES, new BindingPower(210, 220, LlaceBinaryOperator.NotMatch))

infixBindingPower.set(LlaceTokenType.DOT_DOT, new BindingPower(235, 236, LlaceBinaryOperator.Range))

infixBindingPower.set(LlaceTokenType.DASH, new BindingPower(230, 240, LlaceBinaryOperator.Subtract))
infixBindingPower.set(LlaceTokenType.PLUS, new BindingPower(230, 240, LlaceBinaryOperator.Add))

infixBindingPower.set(LlaceTokenType.ASTERISK, new BindingPower(250, 260, LlaceBinaryOperator.Multiply))
infixBindingPower.set(LlaceTokenType.SLASH, new BindingPower(250, 260, LlaceBinaryOperator.Divide))

prefixBindingPower.set(LlaceTokenType.DASH, 270)

infixBindingPower.set(LlaceTokenType.RIGHT_ARROW, new BindingPower(290, 300, LlaceBinaryOperator.FunctionCall))

infixBindingPower.set(LlaceTokenType.DOT, new BindingPower(310, 320, LlaceBinaryOperator.FieldReference))

postfixBindingPower.set(LlaceTokenType.LEFT_BRACE, 500)
postfixBindingPower.set(LlaceTokenType.LEFT_BRACKET, 500)
postfixBindingPower.set(LlaceTokenType.LEFT_PARENTHESIS, 500)
postfixBindingPower.set(LlaceTokenType.QUESTION_MARK, 500)

//---------------------------------------------------------------------------------------------------------------------

