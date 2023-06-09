//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

//---------------------------------------------------------------------------------------------------------------------

import {LlaceBinaryOperator} from "../model/expressions/LlaceExpressions";

/**
 * A pair of integers representing left and right binding power for Pratt parser decisions.
 */
export class BindingPower {
    readonly left: number;
    readonly operator: LlaceBinaryOperator
    readonly right: number;

    constructor(left: number, right: number, operator: LlaceBinaryOperator) {
        this.left = left
        this.right = right
        this.operator = operator
        Object.freeze(this)
    }
}

//---------------------------------------------------------------------------------------------------------------------

