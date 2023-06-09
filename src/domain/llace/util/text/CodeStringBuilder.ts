//
// (C) Copyright 2019-2022 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

export enum VerticalSpacing {
    NONE,
    MULTIPLE_LINES,
    WHITESPACE
}

//---------------------------------------------------------------------------------------------------------------------

/**
 * Provides utilities for indenting and trimming code as it is output piece by piece.
 */
export class CodeStringBuilder {

    constructor(
        indentWhiteSpace: string = "    "
    ) {
        this.#indentWhiteSpace = indentWhiteSpace
    }

    /** The code of the last line being output. */
    #currentLine = ""

    /** The current indentation level. */
    #indentationLevel = 0

    /** The white space corresponding to the current indentation level. */
    #indentSpaces = ""

    /** The block of white space to use for each level of indentation. */
    readonly #indentWhiteSpace: string

    /** The code output so far, except for the latest line under construction. */
    #output = ""

    /** Staged trailing documentation waiting to be written when the line is ended. */
    #trailingDocumentation: string[] = []

    /** A stack of vertical spacing values. */
    #verticalSpacing = [VerticalSpacing.NONE]

    ////

    /**
     * Moves the current line from its holding point to the string builder output.
     */
    #acceptCurrentLine() {

        // Move the current line into the finished output.
        this.#output += this.#currentLine.trimEnd()

        let trailingDocLines: string[] = []

        // Add the first line of trailing documentation if any.
        if (this.#trailingDocumentation.length > 0) {
            this.#output += this.#trailingDocumentation[0].trimEnd()
            trailingDocLines = this.#trailingDocumentation
        }

        // Start fresh for the next line.
        this.#currentLine = ""
        this.#trailingDocumentation = []

        if (trailingDocLines.length > 1) {
            this.indentedToCurrentLevel( outp => {
                for (let i = 1; i < trailingDocLines.length; i += 1) {
                    outp.append(trailingDocLines[i])
                    outp.appendNewLine()
                }
            })
        }

    }

    /**
     * Appends a given [snippet] to the output code. Handles indentation for new lines.
     */
    append(snippet: String) {

        let lineStartIndex = 0
        let lineEndIndex = snippet.indexOf('\n')

        while (true) {

            // Once no new line characters remain, complete simpler output then quit.
            if (lineEndIndex < 0) {
                const remainder = snippet.substring(lineStartIndex)
                this.#appendToCurrentLine(remainder)
                break
            }

            // Determine the next line of output.
            const line = snippet.substring(lineStartIndex, lineEndIndex)

            // Move things from the current line to the main string builder; clear out the current line.
            this.#appendToCurrentLine(line)

            // Move the current line into the finished output.
            this.#acceptCurrentLine()
            this.#output += '\n'

            // Advance to the next line.
            lineStartIndex = lineEndIndex + 1
            lineEndIndex = snippet.indexOf('\n', lineStartIndex)

        }

    }

    /**
     * Appends an explicit new line to the output.
     */
    appendNewLine() {
        this.append("\n")
    }

    /**
     * Appends an explicit new line to the output if [condition] is true.
     */
    appendNewLineIf(condition: Boolean) {
        if (condition) {
            this.append("\n")
        }
    }

    /**
     * Appends a [fragment] of code (known to have no new line characters) to the current line.
     */
    #appendToCurrentLine(fragment: String) {

        // Indent if the line is empty and the added code is not.
        if (this.#currentLine.length == 0 && fragment.trimEnd().length > 0) {
            this.#currentLine += this.#indentSpaces
            this.#currentLine += fragment.trimStart()
        } else {
            this.#currentLine += fragment
        }

    }

    appendVerticalSpacing() {

        switch (this.#verticalSpacing[this.#verticalSpacing.length-1]) {

            case VerticalSpacing.NONE:
                break

            case VerticalSpacing.MULTIPLE_LINES:
                if (this.#currentLine.length > 0) {
                    this.appendNewLine()
                }
                break

            case VerticalSpacing.WHITESPACE:
                if (this.#currentLine.length > 0) {
                    this.appendNewLine()
                }
                this.appendNewLine()
                break;

        }

    }

    /**
     * Converts the code builder output to a simple string.
     */
    getOutput(): string {

        let result = this.#output

        if (this.#currentLine.length > 0) {
            result += this.#currentLine.toString().trimEnd()
        }

        result = result.trimEnd() + '\n'

        return result

    }

    /**
     * Increments the indentation level by one for output occurring after this call.
     */
    #indent() {
        this.#indentationLevel += 1
        this.#indentSpaces += this.#indentWhiteSpace
    }

    /**
     * Executes the given [callback] with the indentation level increased by one.
     * @param callback the closure to call for indented output.
     */
    indented(callback: (b: CodeStringBuilder) => void): void {

        this.#indent()

        try {
            callback(this)
        } finally {
            this.#unindent()
        }

    }

    /**
     * Executes the given [callback] with the indentation level increased by one if the condition is true.
     * @param isIndented true if the output should actually be indented.
     * @param callback the closure to call for indented output.
     */
    indentedIf(isIndented: boolean, callback: (b: CodeStringBuilder) => void): void {

        if (isIndented) {

            this.#indent()

            try {
                callback(this)
            } finally {
                this.#unindent()
            }

        } else {
            callback(this)
        }

    }

    /**
     * Executes the given [callback] with the indentation level increased by one if there is currently vertical spacing.
     * @param callback the closure to call for indented output.
     */
    indentedIfVerticallySpaced(callback: (b: CodeStringBuilder) => void): void {

        if (this.#verticalSpacing[this.#verticalSpacing.length-1] != VerticalSpacing.NONE) {

            this.#indent()

            try {
                callback(this)
            } finally {
                this.#unindent()
            }

        } else {
            callback(this)
        }

    }

    /**
     * Executes the given [output] with the indentation level set to the current line ending point.
     * @param output the closure to call for indented output.
     */
    indentedToCurrentLevel(output: (b: CodeStringBuilder) => void) {

        const spaces = "                                                                                          "

        const originalIndentSpaces = this.#indentSpaces
        this.#indentSpaces = spaces.substring(0, Math.min(this.#currentLine.length, spaces.length))

        try {
            output(this)
        } finally {
            this.#indentSpaces = originalIndentSpaces
        }

    }

    /**
     * Resumes the prior vertical spacing level.
     */
    #popVerticalSpacing() {
        this.#verticalSpacing.pop()
    }

    /**
     * Switches to the given vertical spacing level.
     * @param verticalSpacing the new level
     */
    #pushVerticalSpacing(verticalSpacing: VerticalSpacing) {
        this.#verticalSpacing.push(verticalSpacing)
    }

    setTrailingDocumentation(trailingDocumentation: string[]) {
        this.#trailingDocumentation = trailingDocumentation
    }

    /**
     * Appends an explicit new line to the output if the current line is non-empty.
     */
    startOnNewLine() {

        if (this.#currentLine.length > 0) {
            this.append("\n")
        }

    }

    /**
     * Decrements the indentation level by one.
     */
    #unindent() {

        if (this.#indentationLevel <= 0) {
            throw new Error("Unindented too many times")
        }

        this.#indentationLevel -= 1

        this.#indentSpaces = ""
        for (let i = 1; i <= this.#indentationLevel; i += 1) {
            this.#indentSpaces += this.#indentWhiteSpace
        }

        if (this.#currentLine.trim().length == 0) {
            this.#currentLine = ""
        }

    }

    /**
     * Executes the given [callback] with the vertical spacing level set to at least the given value.
     * @param verticalSpacing the new vertical spacing level (but no lower than the current level)
     * @param callback the closure to call for vertically spaced output.
     */
    verticallySpaced(verticalSpacing: VerticalSpacing, callback: (b: CodeStringBuilder) => void): void {

        this.#pushVerticalSpacing(verticalSpacing)

        try {
            callback(this)
        } finally {
            this.#popVerticalSpacing()
        }

    }



}

//---------------------------------------------------------------------------------------------------------------------

