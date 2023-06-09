// # Data types related to Llace token scanning.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceOrigin} from "../util/LlaceOrigin"

//---------------------------------------------------------------------------------------------------------------------

// An enumeration of Llace token types.
export const LlaceTokenType = {

    EOF: 0, // Artificial indicator of end of file
    AMPERSAND: 1, // "&"
    AMPERSAND_AMPERSAND: 2, // "&&"
    AND: 3, // "and"
    AS: 4, // "as"
    ASTERISK: 5, // "*"
    BACK_TICKED_STRING: 6, // "`" to end of line
    CHAR_LITERAL: 7, // "[character literal]"
    COLON: 8, // ":"
    COMMA: 9, // ","
    COMPARE: 10, // "<=>"
    COMPARE_REVERSED: 11, // ">=<"
    DASH: 12, // "-"
    DATE_LITERAL: 13, // "[date literal]"
    DATETIME_LITERAL: 14, // "[date-time literal]"
    DOCUMENTATION: 15,
    DOT: 16, // "."
    DOT_DOT: 17, // ".."
    DOT_DOT_DOT: 18, // "..."
    EQUALS: 19, // "="
    EQUALS_EQUALS: 20, // "=="
    EQUALS_EQUALS_EQUALS: 21, // "==="
    EXCLAMATION: 22, // '!'
    GREATER_THAN: 23, // '>'
    GREATER_THAN_OR_EQUALS: 24, // '>='
    IDENTIFIER: 25, // Alphanumeric name
    INTEGER_LITERAL: 26, // "[integer literal]"
    IN: 27, // "in"
    IP_ADDRESS_V4: 28, // "[IP address V4 literal]"
    IP_ADDRESS_V6: 29, // "[IP address V6 literal]"
    IS: 30, // "is"
    LEADING_DOCUMENTATION: 31, // '`' to end of line [with no expression earlier on the same line]
    LEFT_BRACE: 32, // "{"
    LEFT_BRACKET: 33, // "["
    LEFT_PARENTHESIS: 34, // "("
    LESS_THAN: 35, // '<'
    LESS_THAN_OR_EQUALS: 36, // '<='
    MATCHES: 37, // '=~'
    MULTILINE_STRING: 38, // multiple lines of back-ticked strings
    NOT: 39, // 'not'
    NOT_MATCHES: 40, // '!~'
    OF: 41, // "of"
    OR: 42, // "or"
    PLUS: 43, // "+"
    QUESTION_MARK: 44, // "?"
    QUESTION_MARK_COLON: 45, // "?:"
    RIGHT_ARROW: 46, // "->"
    RIGHT_BRACE: 47, // "}"
    RIGHT_BRACKET: 48, // "]"
    RIGHT_PARENTHESIS: 49, // ")"
    SEMICOLON: 50, // ";"
    SLASH: 51, // "/"
    STRING_LITERAL: 52, // "[string literal]"
    SYNTH_DOCUMENT: 53, // synthetic token to represent documentation as an operator
    TO: 54, // "to"
    TRAILING_DOCUMENTATION: 55, // '`' to end of line [with part of an expression earlier on the same line]
    UNCLOSED_LITERAL: 56, // "[error - literal extends past end of line]"
    UNCLOSED_STRING: 57, // "[error - string extends past end of line]"
    UNRECOGNIZED_CHAR: 58, // "[error - unrecognized character]"
    UNRECOGNIZED_LITERAL: 59, // "[error - unrecognized literal]"
    UUID_LITERAL: 60, // "[UUID literal]"
    VERTICAL_BAR: 61, // "|"

} as const

export type LlaceTokenType = typeof LlaceTokenType[keyof typeof LlaceTokenType]

//---------------------------------------------------------------------------------------------------------------------

// An abstract token occurring at line [line] and column [column] (both 1-based) in its source file.
export class LlaceToken {

    readonly type: LlaceTokenType
    readonly text: string
    readonly origin: LlaceOrigin

    public constructor(
        type: LlaceTokenType,
        text: string,
        origin: LlaceOrigin,
    ) {
        this.type = type
        this.text = text
        this.origin = origin
    }

}

//---------------------------------------------------------------------------------------------------------------------
