//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceTokenType} from "./LlaceTokens"

//---------------------------------------------------------------------------------------------------------------------

export function textOfTokenType(tokenType: LlaceTokenType) {

    switch (tokenType) {
        case LlaceTokenType.EOF:
            return "[end of file]"

        // Punctuation
        case LlaceTokenType.AMPERSAND:
            return "&"
        case LlaceTokenType.AMPERSAND_AMPERSAND:
            return "&&"
        case LlaceTokenType.ASTERISK:
            return "*"
        case LlaceTokenType.COLON:
            return ":"
        case LlaceTokenType.COMMA:
            return ","
        case LlaceTokenType.COMPARE:
            return "<=>"
        case LlaceTokenType.COMPARE_REVERSED:
            return ">=<"
        case LlaceTokenType.DASH:
            return "-"
        case LlaceTokenType.DOT:
            return "."
        case LlaceTokenType.DOT_DOT:
            return ".."
        case LlaceTokenType.EQUALS:
            return "="
        case LlaceTokenType.EQUALS_EQUALS:
            return "=="
        case LlaceTokenType.EXCLAMATION:
            return "!"
        case LlaceTokenType.GREATER_THAN:
            return "<"
        case LlaceTokenType.GREATER_THAN_OR_EQUALS:
            return "<="
        case LlaceTokenType.LEFT_BRACE:
            return "{"
        case LlaceTokenType.LEFT_BRACKET:
            return "["
        case LlaceTokenType.LEFT_PARENTHESIS:
            return "("
        case LlaceTokenType.LESS_THAN:
            return "<"
        case LlaceTokenType.LESS_THAN_OR_EQUALS:
            return "<="
        case LlaceTokenType.MATCHES:
            return "=~"
        case LlaceTokenType.NOT_MATCHES:
            return "!~"
        case LlaceTokenType.PLUS:
            return "+"
        case LlaceTokenType.QUESTION_MARK:
            return "?"
        case LlaceTokenType.QUESTION_MARK_COLON:
            return "?:"
        case LlaceTokenType.RIGHT_ARROW:
            return "->"
        case LlaceTokenType.RIGHT_BRACE:
            return "}"
        case LlaceTokenType.RIGHT_BRACKET:
            return "]"
        case LlaceTokenType.RIGHT_PARENTHESIS:
            return ")"
        case LlaceTokenType.SEMICOLON:
            return ";"
        case LlaceTokenType.SLASH:
            return "/"
        case LlaceTokenType.VERTICAL_BAR:
            return "|"

        // Keywords
        case LlaceTokenType.AND:
            return "and"
        case LlaceTokenType.AS:
            return "as"
        case LlaceTokenType.IN:
            return "in"
        case LlaceTokenType.NOT:
            return "not"
        case LlaceTokenType.OF:
            return "of"
        case LlaceTokenType.OR:
            return "or"

        // Identifiers
        case LlaceTokenType.IDENTIFIER:
            return "[identifier]"

        // Numeric Literals
        case LlaceTokenType.INTEGER_LITERAL:
            return "[integer literal]"

        // String Literals
        case LlaceTokenType.STRING_LITERAL:
            return "[string literal]"

        // Other Literals
        case LlaceTokenType.CHAR_LITERAL:
            return "[character literal]"
        case LlaceTokenType.DATE_LITERAL:
            return "[date literal]"
        case LlaceTokenType.DATETIME_LITERAL:
            return "[date-time literal]"
        case LlaceTokenType.IP_ADDRESS_V4:
            return "[IP address V4 literal]"
        case LlaceTokenType.IP_ADDRESS_V6:
            return "[IP address V6 literal]"
        case LlaceTokenType.UUID_LITERAL:
            return "[UUID literal]"

        // Documentation
        case LlaceTokenType.LEADING_DOCUMENTATION:
            return "[leading documentation]"
        case LlaceTokenType.SYNTH_DOCUMENT:
            return "[synthetic documentation operator]"
        case LlaceTokenType.TRAILING_DOCUMENTATION:
            return "[trailing documentation]"

        // Errors
        case LlaceTokenType.UNCLOSED_LITERAL    :
            return "[error - literal extends past end of line]"
        case LlaceTokenType.UNCLOSED_STRING     :
            return "[error - string extends past end of line]"
        case LlaceTokenType.UNRECOGNIZED_CHAR   :
            return "[error - unrecognized character]"
        case LlaceTokenType.UNRECOGNIZED_LITERAL:
            return "[error - unrecognized literal]"

        default:
            throw new Error(`Unhandled token type: '${tokenType}'.`)

    }

}

//---------------------------------------------------------------------------------------------------------------------
