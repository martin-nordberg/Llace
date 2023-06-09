//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TsImport} from "./TsImport";
import type {TsTopLevelDecl} from "./TsTopLevelDecl";
import type {TsComments} from "./TsComments";

//---------------------------------------------------------------------------------------------------------------------

export class TsModule {

    readonly comments: TsComments
    readonly imports: TsImport[]
    readonly path: string[]
    readonly declarations: TsTopLevelDecl[]

    constructor(
        comments: TsComments,
        imports: TsImport[],
        path: string[],
        declarations: TsTopLevelDecl[]
    ) {
        this.comments = comments
        this.imports = imports
        this.path = path
        this.declarations = declarations
        Object.freeze(this)
    }


    // fun srcPath(srcRoot: Path): Path {
    //
    //     var result = srcRoot
    //
    //     val entries = packageName.split(".")
    //     entries.forEach { entry ->
    //         result= result.resolve(entry)
    //     }
    //
    //     return result.resolve(name + ".java")
    //
    // }

}

//---------------------------------------------------------------------------------------------------------------------
