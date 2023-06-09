//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {describe, it, expect} from "vitest";
import {CodeStringBuilder} from "../../../../src/domain/llace/util/text/CodeStringBuilder";
import {LlaceScannerBuffer} from "../../../../src/domain/llace/code/scanning/LlaceScannerBuffer";
import {LlaceExpressionParser} from "../../../../src/domain/llace/code/parsing/LlaceExpressionParser";
import {LlaceExpressionWriter} from "../../../../src/domain/llace/code/formatting/LlaceExpressionWriter";
import {sExpression} from "../../../../src/domain/llace/code/model/core/S_Expressions";
import {LlaceScanner} from "../../../../src/domain/llace/code/scanning/LlaceScanner";
import {
    LlaceDocumentationHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceDocumentationHandlingScanner";
import {
    LlaceMultilineStringHandlingScanner
} from "../../../../src/domain/llace/code/scanning/LlaceMultilineStringHandlingScanner";

describe('Parser', () => {
    it('parses and formats expressions', () => {

        const expressions = new Map<string, string>()
        expressions.set("1", "(intliteral 1)")
        expressions.set("x", "(identifier x)")
        expressions.set("1234", "(intliteral 1234)")
        expressions.set("abc", "(identifier abc)")
        expressions.set("x + 1", "(+ (identifier x) (intliteral 1))")
        expressions.set("q - 4", "(- (identifier q) (intliteral 4))")
        expressions.set("a - b + 3", "(+ (- (identifier a) (identifier b)) (intliteral 3))")
        expressions.set("a + b + 3", "(+ (identifier a) (identifier b) (intliteral 3))")
        expressions.set("1 * 2", "(* (intliteral 1) (intliteral 2))")
        expressions.set("x + 3 * g", "(+ (identifier x) (* (intliteral 3) (identifier g)))")
        expressions.set("a + b / 2 - c", "(- (+ (identifier a) (/ (identifier b) (intliteral 2))) (identifier c))")
        expressions.set("-a", "(- (identifier a))")
        expressions.set("-2 * a - b * -r", "(- (* (- (intliteral 2)) (identifier a)) (* (identifier b) (- (identifier r))))")
        expressions.set("a.b.c", "(. (identifier a) (identifier b) (identifier c))")
        expressions.set("x.y + z.q", "(+ (. (identifier x) (identifier y)) (. (identifier z) (identifier q)))")
        expressions.set("\"s\"", "(stringliteral \"s\")")
        expressions.set("\"string tied in a knot\"", "(stringliteral \"string tied in a knot\")")
        expressions.set("'c'", "(charliteral 'c')")
        expressions.set("'abcdef01-1234-abcd-CDEF-1234567890Ab'", "(uuidliteral 'abcdef01-1234-abcd-CDEF-1234567890Ab')")
        expressions.set("'2023-01-01'", "(dateliteral '2023-01-01')")
        expressions.set("'2023-01-01T12:00:00.123456Z'", "(datetimeliteral '2023-01-01T12:00:00.123456Z')")

        expressions.set("(x + 5)", "(parenthesized (+ (identifier x) (intliteral 5)))")
        expressions.set("((x + 5) / 3)", "(parenthesized (/ (parenthesized (+ (identifier x) (intliteral 5))) (intliteral 3)))")

        expressions.set("()", "(parenthesized )")
        expressions.set("(x: int && 5)", "(parenthesized (: (identifier x) (&& (identifier int) (intliteral 5))))")
        expressions.set("(x: int && 5, y: string && \"s\")", "(parenthesized (: (identifier x) (&& (identifier int) (intliteral 5))) (: (identifier y) (&& (identifier string) (stringliteral \"s\"))))")

        expressions.set("a and b", "(and (identifier a) (identifier b))")
        expressions.set("a and b or c", "(or (and (identifier a) (identifier b)) (identifier c))")
        expressions.set("a and not b", "(and (identifier a) (not (identifier b)))")
        expressions.set("not a or b", "(or (not (identifier a)) (identifier b))")

        expressions.set("1 == 2", "(== (intliteral 1) (intliteral 2))")
        expressions.set("1 + 1 == 2 / 1", "(== (+ (intliteral 1) (intliteral 1)) (/ (intliteral 2) (intliteral 1)))")
        expressions.set("1 + 1 < 2 / 1", "(< (+ (intliteral 1) (intliteral 1)) (/ (intliteral 2) (intliteral 1)))")
        expressions.set("1 + 1 <= 2 / 1", "(<= (+ (intliteral 1) (intliteral 1)) (/ (intliteral 2) (intliteral 1)))")
        expressions.set("1 + 1 >= 2 / 1", "(>= (+ (intliteral 1) (intliteral 1)) (/ (intliteral 2) (intliteral 1)))")

        expressions.set("1 <=> 2", "(<=> (intliteral 1) (intliteral 2))")
        expressions.set("1 >=< 2", "(>=< (intliteral 1) (intliteral 2))")

        expressions.set("x =~ y", "(=~ (identifier x) (identifier y))")
        expressions.set("x !~ y", "(!~ (identifier x) (identifier y))")

        expressions.set("f(x: 0)", "(call (identifier f) (parenthesized (: (identifier x) (intliteral 0))))")
        expressions.set("(a: f(x: 0))", "(parenthesized (: (identifier a) (call (identifier f) (parenthesized (: (identifier x) (intliteral 0))))))")

        expressions.set("1..9", "(.. (intliteral 1) (intliteral 9))")
        expressions.set("x in 1..9", "(in (identifier x) (.. (intliteral 1) (intliteral 9)))")

        expressions.set("x is Widget", "(is (identifier x) (identifier Widget))")

        for (let code of expressions.keys()) {
            const fileName = `[[${code}]]`

            const scanner = new LlaceScanner(code, fileName)
            const docHandlingScanner = new LlaceDocumentationHandlingScanner(scanner)
            const mlStringHandlingScanner = new LlaceMultilineStringHandlingScanner(docHandlingScanner)
            const scanBuffer = new LlaceScannerBuffer(mlStringHandlingScanner)
            const parser = new LlaceExpressionParser(scanBuffer, fileName)

            const expression = parser.parseExpression()

            expect(sExpression(expression)).toEqual(expressions.get(code))

            const output = new CodeStringBuilder()
            new LlaceExpressionWriter().writeExpression(output, expression)
            const code2 = output.getOutput()

            expect(code2).toEqual(code + "\n")
        }

    })

})

//---------------------------------------------------------------------------------------------------------------------

