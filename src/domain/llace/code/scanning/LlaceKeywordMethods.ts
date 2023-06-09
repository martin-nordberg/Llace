//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {LlaceTokenType} from "./LlaceTokens"

//---------------------------------------------------------------------------------------------------------------------

export const KEYWORDS_BY_TEXT = new Map<string, LlaceTokenType>()
KEYWORDS_BY_TEXT.set("and", LlaceTokenType.AND)
KEYWORDS_BY_TEXT.set("as", LlaceTokenType.AS)
KEYWORDS_BY_TEXT.set("in", LlaceTokenType.IN)
KEYWORDS_BY_TEXT.set("is", LlaceTokenType.IS)
KEYWORDS_BY_TEXT.set("not", LlaceTokenType.NOT)
KEYWORDS_BY_TEXT.set("of", LlaceTokenType.OF)
KEYWORDS_BY_TEXT.set("or", LlaceTokenType.OR)
KEYWORDS_BY_TEXT.set("to", LlaceTokenType.TO)

//---------------------------------------------------------------------------------------------------------------------

