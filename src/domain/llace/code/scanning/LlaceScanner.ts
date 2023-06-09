//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceOrigin} from "../util/LlaceOrigin"
import {
    LlaceToken,
    LlaceTokenType
} from "./LlaceTokens"
import {KEYWORDS_BY_TEXT} from "./LlaceKeywordMethods"
import {textOfTokenType} from "./LlaceTokenTypeMethods"
import type {ILlaceScanner} from "./ILlaceScanner";

//---------------------------------------------------------------------------------------------------------------------

export class LlaceScanner implements ILlaceScanner {
    readonly #input: string;
    readonly #fileName: string;
    #current: { charPos: number; line: number; column: number };
    #mark: { charPos: number; line: number; column: number };

    constructor(input: string, fileName: string) {
        this.#input = input
        this.#fileName = fileName

        this.#current = {line: 1, column: 1, charPos: 0}
        this.#mark = {line: 1, column: 1, charPos: 0}
    }

    /**
     * Tests whether the scanner has consumed all its input.
     * @return boolean
     */
    isAtEof() {
        return this.#current.charPos >= this.#input.length
    }

    #isDigit(ch: string) {
        return "0123456789".indexOf(ch) >= 0
    }

    #isIdentifierPart(ch: string) {
        // TODO: needs work
        const identifierPartChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"

        return identifierPartChars.indexOf(ch) >= 0
    }

    #isIdentifierStart(ch: string) {
        // TODO: needs work
        const identifierPartChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"

        return identifierPartChars.indexOf(ch) >= 0
    }

    #isWhiteSpace(ch: string) {
        // TODO: needs work
        const whiteSpaceChars = " \t\r\n"

        return whiteSpaceChars.indexOf(ch) >= 0
    }

    /**
     * Computes the origin of the mark to the current position.
     * @return {LlaceOrigin}
     */
    #originFromMark() {
        return new LlaceOrigin(this.#fileName, this.#mark.line, this.#mark.column, this.#current.charPos - this.#mark.charPos)
    }

    /**
     * Looks ahead to the next character without consuming it.
     * @return {string}
     */
    #peekChar() {

        if (this.#current.charPos >= this.#input.length) {
            return eofChar
        }

        return this.#input.charAt(this.#current.charPos)

    }

    /**
     * Reads the next character from the input.
     * @return {string}
     */
    #readChar() {

        if (this.#current.charPos >= this.#input.length) {
            return eofChar
        }

        const result = this.#input.charAt(this.#current.charPos)

        this.#current.charPos += 1

        this.#current.column += 1
        if (result === '\n') {
            this.#current.line += 1
            this.#current.column = 1
        }

        return result

    }

    /**
     * Finishes reading an identifier.
     */
    #readIdentifierOrKeyword() {

        // TODO: special treatment for trailing $

        let ch = this.#peekChar();
        while (this.#isIdentifierPart(ch) || ch === '-') {
            this.#readChar()
            ch = this.#peekChar()
        }

        const text = this.#textFromMark()

        // @ts-ignore
        const keyword = KEYWORDS_BY_TEXT.get(text)
        if (keyword != null) {
            return new LlaceToken(keyword, text, this.#originFromMark())
        }

        return new LlaceToken(LlaceTokenType.IDENTIFIER, text, this.#originFromMark())

    }

    /**
     * Finishes reading a numeric literal.
     */
    #readNumericLiteral() {

        let ch = this.#peekChar()
        while (this.#isDigit(ch)) {
            this.#readChar()
            ch = this.#peekChar()
        }

        // TODO: floating point
        // TODO: hexadecimal
        // TODO: binary
        // TODO: suffixes

        return new LlaceToken(LlaceTokenType.INTEGER_LITERAL, this.#textFromMark(), this.#originFromMark())

    }

    /**
     * Finishes reading a single-quoted literal.
     */
    #readSingleQuotedLiteral(): LlaceToken {

        let ch = this.#readChar()
        while (ch !== '\'') {

            if (ch === '\\') {
                // TODO: validate escapes here or elsewhere
                this.#readChar()
            }

            if (ch === '\r' || ch === '\n') {
                return new LlaceToken(LlaceTokenType.UNCLOSED_LITERAL, this.#textFromMark(), this.#originFromMark())
            }

            ch = this.#readChar()
        }

        const text = this.#textFromMark()
        const origin = this.#originFromMark()

        for (const [pattern, tokenType] of singleQuotedLiteralPatterns) {
            if (pattern.test(text)) {
                return new LlaceToken(tokenType, text, origin)
            }
        }

        return new LlaceToken(LlaceTokenType.UNRECOGNIZED_LITERAL, text, origin)

    }

    /**
     * Finishes reading a string literal.
     */
    #readStringLiteral() {

        let ch = this.#readChar()
        while (ch !== '"') {

            if (ch === '\\') {
                // TODO: validate escapes here or elsewhere
                this.#readChar()
            }

            if (ch === '\r' || ch === '\n') {
                return new LlaceToken(LlaceTokenType.UNCLOSED_STRING, this.#textFromMark(), this.#originFromMark())
            }

            ch = this.#readChar()
        }

        return new LlaceToken(LlaceTokenType.STRING_LITERAL, this.#textFromMark(), this.#originFromMark())

    }

    /**
     * Finishes reading a line-oriented token.
     */
    #readToEndOfLine(tokenType: LlaceTokenType) {

        let ch = this.#peekChar()
        while (ch !== '\n' && ch !== '\r' && ch !== eofChar) {
            this.#readChar()
            ch = this.#peekChar()
        }

        return new LlaceToken(tokenType, this.#textFromMark(), this.#originFromMark())

    }

    /**
     * Reads the next token from the input stream.
     * @return {LlaceToken}
     */
    readToken(): LlaceToken {

        // Ignore whitespace
        while (this.#isWhiteSpace(this.#peekChar())) {
            this.#readChar()
        }

        // Mark the start of the token
        this.#mark = {...this.#current}

        const ch = this.#readChar()

        // Numeric literal
        if (this.#isDigit(ch)) {
            return this.#readNumericLiteral()
        }

        // Back-ticked string - TODO
        if (ch === '`') {
            return this.#readToEndOfLine(LlaceTokenType.BACK_TICKED_STRING)
        }

        // String literal
        if (ch === '"') {
            return this.#readStringLiteral()
        }

        // Single quoted literal
        if (ch === '\'') {
            return this.#readSingleQuotedLiteral()
        }

        // End of input
        if (ch === eofChar) {
            return new LlaceToken(LlaceTokenType.EOF, "", this.#originFromMark())
        }

        // Handle three-character punctuation.
        if (this.#mark.charPos + 3 <= this.#input.length) {
            const threeCharToken = this.#input.substring(this.#mark.charPos, this.#mark.charPos + 3)
            if (threeCharTokens.has(threeCharToken)) {
                this.#readChar()
                this.#readChar()
                const tokenType = threeCharTokens.get(threeCharToken)!
                return new LlaceToken(tokenType, textOfTokenType(tokenType), this.#originFromMark())
            }
        }

        // Handle two-character punctuation.
        if (this.#mark.charPos + 2 <= this.#input.length) {
            const twoCharToken = this.#input.substring(this.#mark.charPos, this.#mark.charPos + 2)
            if (twoCharTokens.has(twoCharToken)) {
                this.#readChar()
                const tokenType = twoCharTokens.get(twoCharToken)!

                if (tokenType === LlaceTokenType.DOCUMENTATION) {
                    return this.#readToEndOfLine(tokenType)
                }

                return new LlaceToken(tokenType, textOfTokenType(tokenType), this.#originFromMark())
            }
        }

        // Handle single character punctuation where the token could have been two characters.
        if (singleCharTokens.has(ch)) {
            const tokenType = singleCharTokens.get(ch)!
            return new LlaceToken(tokenType, textOfTokenType(tokenType), this.#originFromMark())
        }

        // Identifier
        if (this.#isIdentifierStart(ch)) {
            return this.#readIdentifierOrKeyword()
        }

        // Unrecognized
        return new LlaceToken(LlaceTokenType.UNRECOGNIZED_CHAR, this.#textFromMark(), this.#originFromMark())

    }

    #textFromMark() {
        return this.#input.substring(this.#mark.charPos, this.#current.charPos)
    }

}

//---------------------------------------------------------------------------------------------------------------------

const eofChar = '\uFFFF'

//---------------------------------------------------------------------------------------------------------------------

const hexDigit = "[a-fA-F0-9]"

const day = "[0-9]{2}"
const hour = "[0-9]{2}"
const minute = "[0-9]{2}"
const month = "[0-9]{2}"
const second = "[0-9]{2}(\.[0-9]{1,6})?"
const timeZone = `([zZ]|[+-]${hour}(:${minute})?)`
const year = "([0-9]{4}|[+-][0-9]{4,10})"

const ipOctet = "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"
const ipV4 = `${ipOctet}\\.${ipOctet}\\.${ipOctet}\\.${ipOctet}`
const ipAddrSeg = `${hexDigit}{1,4}`
const ipAddrDual = `(${ipAddrSeg}:${ipAddrSeg}|${ipV4})`
const ipV6_6 = `(${ipAddrSeg}:){6}${ipAddrDual}`
const ipV6_5 = `::(${ipAddrSeg}:){5}${ipAddrDual}`
const ipV6_4 = `(${ipAddrSeg})?::(${ipAddrSeg}:){4}${ipAddrDual}`
const ipV6_3 = `((${ipAddrSeg}:)?${ipAddrSeg})?::(${ipAddrSeg}:){3}${ipAddrDual}`
const ipV6_2 = `((${ipAddrSeg}:){0,2}${ipAddrSeg})?::(${ipAddrSeg}:){2}${ipAddrDual}`
const ipV6_1 = `((${ipAddrSeg}:){0,3}${ipAddrSeg})?::(${ipAddrSeg}:)${ipAddrDual}`
const ipV6_0 = `((${ipAddrSeg}:){0,4}${ipAddrSeg})?::${ipAddrDual}`
const ipV6_a = `((${ipAddrSeg}:){0,5}${ipAddrSeg})?::${ipAddrSeg}`
const ipV6_b = `((${ipAddrSeg}:){0,6}${ipAddrSeg})?::`
const ipV6 = `(${ipV6_6}|${ipV6_5}|${ipV6_4}|${ipV6_3}|${ipV6_2}|${ipV6_1}|${ipV6_0}|${ipV6_a}|${ipV6_b})`

const singleQuotedLiteralPatterns = new Map<RegExp, LlaceTokenType>()
singleQuotedLiteralPatterns.set(new RegExp("^'([^\\\\]|\\\\t|\\\\r|\\\\n|\\\\'|\\\\\\\\)'$"), LlaceTokenType.CHAR_LITERAL)
singleQuotedLiteralPatterns.set(new RegExp(`^'${hexDigit}{8}-${hexDigit}{4}-${hexDigit}{4}-${hexDigit}{4}-${hexDigit}{12}'$`), LlaceTokenType.UUID_LITERAL)
singleQuotedLiteralPatterns.set(new RegExp(`^'${year}-${month}-${day}'$`), LlaceTokenType.DATE_LITERAL)
singleQuotedLiteralPatterns.set(new RegExp(`^'${year}-${month}-${day}T${hour}:${minute}(:${second})?${timeZone}'$`), LlaceTokenType.DATETIME_LITERAL)
singleQuotedLiteralPatterns.set(new RegExp(`^'${ipV4}'$`), LlaceTokenType.IP_ADDRESS_V4)
singleQuotedLiteralPatterns.set(new RegExp(`^'${ipV6}'$`), LlaceTokenType.IP_ADDRESS_V6)

//---------------------------------------------------------------------------------------------------------------------

const threeCharTokens = new Map<string, LlaceTokenType>()
threeCharTokens.set("===", LlaceTokenType.EQUALS_EQUALS_EQUALS)
threeCharTokens.set(">=<", LlaceTokenType.COMPARE_REVERSED)
threeCharTokens.set("<=>", LlaceTokenType.COMPARE)

//---------------------------------------------------------------------------------------------------------------------

const twoCharTokens = new Map<string, LlaceTokenType>()
twoCharTokens.set("&&", LlaceTokenType.AMPERSAND_AMPERSAND)
twoCharTokens.set("//", LlaceTokenType.DOCUMENTATION)
twoCharTokens.set("..", LlaceTokenType.DOT_DOT)
twoCharTokens.set("==", LlaceTokenType.EQUALS_EQUALS)
twoCharTokens.set(">=", LlaceTokenType.GREATER_THAN_OR_EQUALS)
twoCharTokens.set("<=", LlaceTokenType.LESS_THAN_OR_EQUALS)
twoCharTokens.set("=~", LlaceTokenType.MATCHES)
twoCharTokens.set("!~", LlaceTokenType.NOT_MATCHES)
twoCharTokens.set("?:", LlaceTokenType.QUESTION_MARK_COLON)
twoCharTokens.set("->", LlaceTokenType.RIGHT_ARROW)

//---------------------------------------------------------------------------------------------------------------------

const singleCharTokens = new Map<string, LlaceTokenType>()
singleCharTokens.set('&', LlaceTokenType.AMPERSAND)
singleCharTokens.set('*', LlaceTokenType.ASTERISK)
singleCharTokens.set(':', LlaceTokenType.COLON)
singleCharTokens.set(',', LlaceTokenType.COMMA)
singleCharTokens.set("-", LlaceTokenType.DASH)
singleCharTokens.set('.', LlaceTokenType.DOT)
singleCharTokens.set('=', LlaceTokenType.EQUALS)
singleCharTokens.set('!', LlaceTokenType.EXCLAMATION)
singleCharTokens.set(">", LlaceTokenType.GREATER_THAN)
singleCharTokens.set('{', LlaceTokenType.LEFT_BRACE)
singleCharTokens.set('[', LlaceTokenType.LEFT_BRACKET)
singleCharTokens.set('(', LlaceTokenType.LEFT_PARENTHESIS)
singleCharTokens.set("<", LlaceTokenType.LESS_THAN)
singleCharTokens.set('+', LlaceTokenType.PLUS)
singleCharTokens.set('?', LlaceTokenType.QUESTION_MARK)
singleCharTokens.set('}', LlaceTokenType.RIGHT_BRACE)
singleCharTokens.set(']', LlaceTokenType.RIGHT_BRACKET)
singleCharTokens.set(')', LlaceTokenType.RIGHT_PARENTHESIS)
singleCharTokens.set('/', LlaceTokenType.SLASH)
singleCharTokens.set(';', LlaceTokenType.SEMICOLON)
singleCharTokens.set('|', LlaceTokenType.VERTICAL_BAR)


//---------------------------------------------------------------------------------------------------------------------
