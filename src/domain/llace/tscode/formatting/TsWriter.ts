//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {CodeStringBuilder} from "../../util/text/CodeStringBuilder"
import type {TsModule} from "../model/TsModule"
import type {TsTopLevelDecl} from "../model/TsTopLevelDecl";
import {
    TsClass,
    TsEnumeration,
    TsTopLevelDecl$Tag, TsValue
} from "../model/TsTopLevelDecl";
import type {TsComments} from "../model/TsComments";

//---------------------------------------------------------------------------------------------------------------------

export class TsWriter {

    writeModule(output: CodeStringBuilder, tsModule: TsModule) {

        this.#writeComments(output, tsModule.comments, false)

        output.appendNewLineIf(tsModule.imports.length > 0)

        for (let immport of tsModule.imports) {
            output.append(`import {${immport.name}} from "${immport.path.join("/")}"\n`)
        }

        for (let declaration of tsModule.declarations) {
            this.#writeHorizontalRule(output)
            this.#writeTopLevelDecl(output, declaration)
        }

        this.#writeHorizontalRule(output)

    }

    #writeClass(output: CodeStringBuilder, clazz: TsClass) {

        // Class name & attributes
        output.append("export")
        if (clazz.isAbstract) {
            output.append(" abstract")
        }
        output.append(` class ${clazz.name}`)
        if (clazz.baseClassName !== null) {
            output.append(` extends ${clazz.baseClassName}`)
        }
        output.append(` {\n\n`)

        output.indented(outp => {

            // Fields
            for (let field of clazz.fields) {
                this.#writeComments(outp, field.comments, field !== clazz.fields[0])
                outp.append(`readonly ${field.name}: ${field.type}\n`)
            }

            if (clazz.fields.length > 0) {
                outp.append("\n")
            }

            // Constructor
            if (clazz.isAbstract) {
                outp.append("protected ")
            }
            outp.append("constructor(\n")

            outp.indented( outp => {
                for (let field of clazz.baseClassFields.slice(clazz.tagValues.length)) {
                    outp.append(`${field.name}: ${field.type},\n`)
                }
                for (let field of clazz.fields) {
                    outp.append(`${field.name}: ${field.type},\n`)
                }
            })

            outp.append(") {\n")

            outp.indented( outp => {
                // Super call
                if (clazz.baseClassName !== null) {
                    outp.append("super(\n")
                    outp.indented( outp => {
                        for (let tagValue of clazz.tagValues) {
                            outp.append(`${tagValue},\n`)
                        }
                        for (let field of clazz.baseClassFields.slice(clazz.tagValues.length)) {
                            outp.append(`${field.name},\n`)
                        }
                    })
                    outp.append(")\n")
                }

                // Field initialization
                for (let field of clazz.fields) {
                    outp.append(`this.${field.name} = ${field.name}\n`)
                }

                // Freeze
                if (!clazz.isAbstract) {
                    outp.append("Object.freeze(this)\n")
                }
            })


            outp.append("}\n")

        })

        output.append("\n}")

    }

    #writeComments(output: CodeStringBuilder, tsComments: TsComments, addLineBefore: boolean) {

        output.appendNewLineIf(addLineBefore && tsComments.lines.length > 0)

        for (let line of tsComments.lines) {
            output.append(line)
            output.appendNewLine()
        }

    }

    #writeEnumeration(output: CodeStringBuilder, enumeration: TsEnumeration) {

        output.append(`export const ${enumeration.name} = {\n`)

        output.indented(outp => {

            let i = 0
            for (let enumerand of enumeration.enumerands) {
                this.#writeComments(outp, enumerand.comments, true)
                outp.append(`${enumerand.name}: ${i++},\n`)
            }

        })

        output.append(`\n} as const\n\n`)

        output.append(`export type ${enumeration.name} = typeof ${enumeration.name}[keyof typeof ${enumeration.name}]`)
        // TODO: type

    }

    #writeHorizontalRule(output: CodeStringBuilder) {
        output.append("\n//---------------------------------------------------------------------------------------------------------------------\n\n")
    }

    #writeTopLevelDecl(output: CodeStringBuilder, declaration: TsTopLevelDecl) {

        this.#writeComments(output, declaration.comments, false)

        switch (declaration.TsTopLevelDecl$Tag) {
            case TsTopLevelDecl$Tag.TsClass:
                this.#writeClass(output, declaration as TsClass)
                break
            case TsTopLevelDecl$Tag.TsEnumeration:
                this.#writeEnumeration(output, declaration as TsEnumeration)
                break
            case TsTopLevelDecl$Tag.TsValue:
                this.#writeValue(output, declaration as TsValue)
                break
            default:
                output.append("TODO")
                break
        }

        output.appendNewLine()
    }

    #writeValue(output: CodeStringBuilder, value: TsValue) {

        if (value.isExported) {
            output.append("export ")
        }

        if (value.isConstant) {
            output.append("const ")
        }

        output.append(`${value.name} = ${value.initialValue}`)

    }
}

//---------------------------------------------------------------------------------------------------------------------
