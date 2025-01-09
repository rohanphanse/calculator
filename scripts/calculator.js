// Calculator 
// By: Rohan Phanse

// Calculator
class Calculator {
    constructor (params) {
        this.digits = params ? params.digits : 6
        this.angle = params ? params.angle : "rad"
        this.ans = null
        this.variables = {}
        this.functions = {}
        this.recursion = {}
    }

    // Parse raw expression into tokens
    parse(expression, options = {}) {
        const tokens = []
        // Standardize input by...
        // Removing all whitespace
        // Changing case to lower
        expression = expression.replace(/\s/g, "").toLowerCase()
        // Includes equals sign
        if (expression.includes("=")) {
            // Only 1 equals sign
            if ((expression.match(/=/g) || []).length === 1) {
                const before_equals = expression.split("=")[0]
                if (before_equals.includes("(") && before_equals.includes(")")) {
                    return this.declareFunction(expression)
                } else {
                    return this.declareVariable(expression)
                }
            } else {
                return "Variable assignment error"
            }
        }
        // Loop through string
        for (let i = 0; i < expression.length; i++) {
            let double_symbol = expression.substr(i, 2)
            // Symbol
            if (SYMBOLS.includes(expression[i]) || SYMBOLS.includes(double_symbol)) {
                if (SYMBOLS.includes(double_symbol)) {
                    tokens.push(double_symbol) 
                    i++
                } else {
                    tokens.push(expression[i])
                }
            // Number
            } else if (!isNaN(expression[i])) {
                const number = this.peek(expression, i, "number")
                tokens.push(+number)
                i += number.length - 1
            // Letter
            } else if (/^[a-z_]+$/i.test(expression[i])) {
                const string = this.peek(expression, i, "string")
                // Function parameter
                if (options?.functionParameters?.includes(string)) {
                    tokens.push(string)
                    i += string.length - 1
                // Operation
                } else if (string in OPERATIONS) {
                    tokens.push(string)
                    i += string.length - 1
                // Ans keyword
                } else if (string === "ans") {
                    if (typeof this.ans !== "string") {
                        tokens.push(string)
                        i += string.length - 1
                    } else {
                        return "Answer error"
                    }
                // Variable
                } else if (string in this.variables) {
                    tokens.push(this.variables[string])
                    i += string.length - 1
                } else if (string in this.functions) {
                    tokens.push(string)
                    i += string.length - 1
                } else {
                    return `Unknown string "${string}" at position ${i + 1}`
                }
            // Special characters
            } else if (["(", ")", "[", "]", ",", "@"].includes(expression[i])) {
                tokens.push(expression[i])
            // Unknown character
            } else {
                return `Unknown character "${expression[i]}" at position ${i + 1}`
            }
        }
        // Replace @ with Operation wrapper
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === "@") {
                if (i === tokens.length - 1 && !this.functions[tokens[i + 1]] && !OPERATIONS[tokens[i + 1]]) {
                    return "@ error"
                } 
                tokens[i + 1] = new Operation(tokens[i + 1])
                tokens.splice(i, 1)
            }
        }
        // Number parentheses and brackets
        for (const [a, b] of [["(", ")"], ["[", "]"]]) {
            let paren_counter = 1
            const error_message = a === "(" ? "Parenthesis error" : "Bracket error"
            if (tokens.includes(a) || tokens.includes(b)) {
                for (let i = 0; i < tokens.length; i++) {
                    // Closing parenthesis before opening parenthesis
                    if (paren_counter < 1) {
                        return error_message
                    }
                    if (tokens[i] === a) {
                        tokens[i] = `${tokens[i]}${paren_counter}`
                        paren_counter++
                    } else if (tokens[i] === b) {
                        paren_counter--
                        tokens[i] = `${tokens[i]}${paren_counter}`
                    }
                }
                // Different number of opening and closing parentheses
                if (paren_counter !== 1) {
                    return error_message
                }
            }
        }
        return tokens
    }

    // Peek ahead from given index in string and return substring which satisfies given criteria
    peek(string, index, type) {
        let length = 1
        // Check function determines if string fails a certain criteria
        let check = undefined
        switch (type) {
            case "number":
                check = n => isNaN(n)
                break
            case "string":
                check = e => !/^[a-z_]+$/i.test(e)
                break
        }
        while (index + length <= string.length) {
            length++
            if (check(string.substr(index, length))) {
                break
            }
        }
        return string.substr(index, length - 1)
    }

    // Declare variable 
    declareVariable(expression) {
        try {
            let [name, value] = expression.split("=")
            let status = 0
            // Name is alphabetic
            if (/^[a-z_]+$/i.test(name)) {
                // Name is an operation or keyword
                if (name in OPERATIONS || KEYWORDS.includes(name) || name in this.functions) {
                    return "Variable name taken"
                }
                status++
            }
            // Calculate variable value
            const result = this.calculate(value, { noAns: true, array: true })
            console.log(typeof result, Array.isArray(result))
            if (isFinite(result) || Array.isArray(result)) {
                status++
            } else {
                return "Variable value error"
            }
            // Variable name and value valid
            if (status === 2) {
                let redeclared = false
                if (name in this.variables) {
                    redeclared = true
                }
                this.variables[name] = result
                return `Variable ${name} ${redeclared ? "reassigned" : "declared"}`  
            } else {
                return "Variable assignment error"
            }
        } catch (err) {
            return "Variable assignment error"
        }
    }

    declareFunction(expression) {
        try {
            expression = expression.split("=")
            if (expression.length !== 2) {
                return "Function equals error"
            }
            if (!(count(expression[0], "(") === 1 
                && count(expression[0], ")") === 1 
                && expression[0].indexOf("(") < expression[0].indexOf(")")
            )) {
                return "Function parenthesis error"
            }

            const name = expression[0].slice(0, expression[0].indexOf("("))
            if (!/^[a-z_]+$/i.test(name)) {
                return "Function name error"
            }
            if (name in OPERATIONS || KEYWORDS.includes(name) || name in this.variables) {
                return "Function name taken"
            }
            const parameters = expression[0].slice(expression[0].indexOf("(") + 1, expression.indexOf(")")).split(",")
            if (!(parameters.filter(e => /^[a-z_]+$/i.test(e)).length === parameters.length && (new Set(parameters)).size === parameters.length)) {
                return "Function parameter error"
            }
            const value = this.parse(expression[1], { functionParameters: parameters })          
    
            if (typeof value === "string") {
                return "Function value error"
            } else {
                let redeclared = false
                if (name in this.functions) {
                    redeclared = true
                }
                this.functions[name] = {
                    parameters,
                    value,
                    string: `${name}(${parameters.join(",")}) = ${expression[1]}`
                }
                return `Function ${name} ${redeclared ? "re" : ""}declared`
            }
        } catch (err) {
            console.log(err)
            return "Function declaration error"
        }
    }

    // Initialize array
    initializeArray(tokens) {
        console.log("begin initializeArray", tokens)
        try {
            const array = []
            let start = 0
            let close = null
            for (let t = 0; t < tokens.length; t++) {
                if (typeof tokens[t] === "string" && tokens[t].startsWith("(")) {
                    close = `)${tokens[t].slice(1)}`
                }
                if (tokens[t] === close) {
                    close = null
                }
                if (tokens[t] === "," && close == null) {
                    array.push(tokens.slice(start, t))
                    start = t + 1
                } else if (t === tokens.length - 1) {
                    array.push(tokens.slice(start, t + 1))
                }
            }
            console.log("a", array)

            for (let a = 0; a < array.length; a++) {
                if (!Array.isArray(array[a][0])) {
                    const result = this.evaluate(array[a], { noAns: true, array: true })
                    console.log(typeof result)
                    console.log("arreval", array[a], "=>", result)
                    if (typeof result === "string") {
                        throw "Error"
                    } else {
                        array[a] = result
                    }
                } else {
                    array[a] = array[a][0]
                }
            }
            return array
        } catch (err) {
            console.log("error", err)
            return "Array error"
        }
    }

    evaluateFunction(tokens, index) {
        this.recursion[tokens[index]] = this.recursion?.[tokens[index]] ? this.recursion[tokens[index]] + 1 : 1
        if (this.recursion?.[tokens[index]] > 1000) {
            console.log(this.recursion)
            return "Recursion error"
        }
        console.log("recursion", this.recursion)
        try {
            console.log("evaluateFunction", tokens, index)
            const func = this.functions[tokens[index]]
            let parameters = tokens[index + 1]
            if (parameters.length > func.parameters.length || !Array.isArray(parameters)) {
                parameters = [parameters]
            }
            console.log("parameters", parameters)
            if (parameters.length !== func.parameters.length) {
                return `Function ${tokens[index]} > Parameter error`
            }
            const value = [...func.value]
            console.log("func.parameters", func.parameters)
            console.log("value", value)
            for (let v = 0; v < value.length; v++) {
                console.log(v)
                for (let p = 0; p < func.parameters.length; p++) {
                    console.log("v", value[v], "p", func.parameters[p])
                    if (value[v] === func.parameters[p]) {
                        value[v] = parameters[p]
                    }
                }
            }
            console.log("value", value)
            const result = this.evaluate(value, { noAns: true, array: true })
            console.log(result)
            if (typeof result === "string")
                return `Function ${tokens[index]} > ${result}`
            else {
                tokens.splice(index, 2, result)
                console.log("evaluateFunction tokens", tokens)
                return tokens
            }
        } catch (err) {
            return `Function ${tokens[index]} > Evaluation error`
        }
    }

    // Evaluate numerical result from tokens
    evaluate(tokens, options = {}) {
        console.log("begin evaluate()", tokens)
        // Replace ans with value
        if (typeof this.ans !== "string") {
            for (let t = 0; t < tokens.length; t++) {
                if (tokens[t] === "ans" ) {
                    tokens[t] = this.ans
                }
            }
        }
        // Create array where index represents level of parenthesis and value represents frequency
        const parentheses = []
        const brackets = []
        for (const t of tokens) {
            if (typeof t === "string" && t[0] === "(") {
                parentheses[+t.slice(1) - 1] = parentheses[+t.slice(1) - 1] ? parentheses[+t.slice(1) - 1] + 1 : 1
            }
            if (typeof t === "string" && t[0] === "[") {
                brackets[+t.slice(1) - 1] = brackets[+t.slice(1) - 1] ? brackets[+t.slice(1) - 1] + 1 : 1
            }
        }
        // Loop through each level of brackets in descending order
        for (let i = brackets.length - 1; i >= 0; i--) {
            // Loop through frequency of each level
            for (let j = 0; j < brackets[i]; j++) {
                for (let t = 0; t < tokens.length; t++) {
                    if (tokens[t] === `[${i + 1}`) {
                        const close = tokens.indexOf(`]${i + 1}`)
                        // Empty brackets
                        if (close - t === 1) {
                            tokens.splice(t, close - t + 1, [])
                            break
                        }
                        const array = this.initializeArray(tokens.slice(t + 1, close))
                        if (typeof array === "string") {
                            return array
                        } else {
                            tokens.splice(t, close - t + 1, array)
                        }
                        break
                    }
                }
            }
        }
         // Loop through each level of parentheses in descending order
        for (let i = parentheses.length - 1; i >= 0; i--) {
            for (let j = 0; j < parentheses[i]; j++) {
                for (let t = 0; t < tokens.length; t++) {
                    if (tokens[t] === `(${i + 1}`) {
                        const close = tokens.indexOf(`)${i + 1}`)
                        if (close - t === 1) {
                            // Previous token is math function, () => []
                            if (isMathFunction(tokens[t - 1]) || tokens[t - 1] in this.functions) {
                                tokens.splice(t, close - t + 1, [])
                            } else {
                                tokens.splice(t, close - t + 1, 0) // () -> 0
                            }
                        } else if (tokens.slice(t + 1, close).includes(",")) {
                            const array = this.initializeArray(tokens.slice(t + 1, close))
                            if (typeof array === "string") {
                                return array
                            } 
                            tokens.splice(t, close - t + 1, array)
                            console.log("array", tokens)
                        } else {
                            // Evaluate expression inside parentheses
                            const result = this.evaluateSingle(tokens.slice(t + 1, close))
                            if (typeof result === "string") {
                                return result      
                            }
                            tokens.splice(t, close - t + 1, result)
                            console.log("parens", tokens)
                        }
                        break
                    }
                }
            }
        }
        // No parentheses left
        // Single expression to be evaluated
        const result = this.evaluateSingle(tokens)
        console.log("evaluateSingle", result)
        if (typeof result !== "string" && !options?.noAns) {
            this.ans = result
        }
        const final_result = this.evaluateSingle(tokens, { round: true })
        if (Array.isArray(final_result) && !options?.array) {
            return JSON.stringify(final_result).replaceAll(",", ", ").replaceAll('"', "")
        } else {
            return final_result
        }
    }

    // Evaluate expression without parentheses
    evaluateSingle(tokens, options = {}) {
        if (tokens.length > 1) {
            // Count number of math functions
            let function_count = 0
            for (const t of tokens) {
                if (isMathFunction(t) || t in this.functions) {
                    function_count++
                }
            }

            while (function_count) {
                // Recount
                let calc_function_count = 0
                for (const t of tokens) {
                    if (isMathFunction(t) || t in this.functions) {
                        calc_function_count++
                    }
                }
                function_count = calc_function_count

                // Evaluate math functions
                for (let i = 0; i < tokens.length; i++) {
                    if (isMathFunction(tokens[i]) || tokens[i] in this.functions) {
                        tokens = tokens[i] in this.functions ? this.evaluateFunction(tokens, i) : this.operate(tokens, i)
                        if (typeof tokens === "string") {
                            return tokens
                        }
                    }
                }
            }

            // Add multiplication signs between adjacent numbers
            for (let t = 0; t < tokens.length - 1; t++) {
                if (!isNaN(tokens[t]) && !isNaN(tokens[t + 1])) {
                    tokens.splice(t + 1, 0, "*")
                }
            }
            
            // Evaluate operators
            while (tokens.length > 1) {
                tokens = this.evaluateOperator(tokens)
                if (typeof tokens === "string") {
                    return tokens
                }
            }
        }

        // One token to evaluate
        if (typeof tokens[0] === "number") {
            return options.round ? round(tokens[0], this.digits) : tokens[0]
        } else if (CONSTANTS.includes(tokens[0])) {
            return round(OPERATIONS[tokens[0]].func(), this.digits)
        } else if (tokens[0] in OPERATIONS) {
            return new String(OPERATIONS[tokens[0]].name)
        } else if (Array.isArray(tokens[0]) || tokens[0] instanceof String || tokens[0] instanceof Operation) {
            return tokens[0]
        } else if (tokens[0] in this.functions) {
            return new String(this.functions[tokens[0]].string)
        } else {
            return "Error"
        }
    }

    // Evaluate expression with operator/symbol
    evaluateOperator(tokens) {
        console.log("evaluateOperator", tokens)
        // Filter order of operations array so only used operations are present
        let used_operations = ORDER_OF_OPERATIONS.map(list => list.filter(e => tokens.includes(e))).filter(e => e.length)
        if (used_operations.length) {
            // Loop through lists in used operations
            for (let i = 0; i < used_operations.length; i++) {
                // Loop through elements of lists
                for (let j = 0; j < used_operations[i].length; j++) {
                    // Loop through tokens
                    for (let index = 0; index < tokens.length; index++) {
                        if (tokens[index] === used_operations[i][j]) {
                            return this.operate(tokens, index)
                        }
                    }
                }
            }
        } else {
            return "No operator error"
        }
    }

    // Perform operation given tokens and index
    operate(tokens, index, options) {
        let operation = OPERATIONS[tokens[index]]
        try {
            // Create parameters
            let params = operation.schema.map((i) => tokens[i + index])
            if (tokens[index] !== "type") {
                console.log("p", params)
                if (!LIST_OPERATIONS.includes(tokens[index])) {
                    params = params.flatMap((x) => x)
                } else if (params.length === 1 && !Array.isArray(params[0])) {
                    params = [params]
                }
            }
            console.log("p", params)
            if (params.length > operation.types.length) {
                return `${operation.name} error > type error: expected at most ${operation.types.length} parameter${operation.types.length !== 1 ? "s" : ""} but received ${params.length} parameters`
            }
            let param_types = get_param_types(params)
            if (!check_param_types(param_types, operation.types)) {
                // Try negation if parameter error for subtraction
                let fail = true
                if (tokens[index] === "-") {
                    console.log("negation")
                    operation = OPERATIONS["neg"]
                    params = operation.schema.map((i) => tokens[i + index])
                    param_types = get_param_types(params)
                    if (check_param_types(param_types, operation.types)) {
                        fail = false
                    }
                }
                if (fail) {
                    return `${operation.name} error > type error: expected "${operation.types.join(", ")}" but received "${param_types.join(", ")}"`
                }
            }

            // Convert angle for angle functions
            if (ANGLE_FUNCTIONS.includes(tokens[index]) && this.angle === "deg") {
                params = params.map(n => n * Math.PI / 180)
            }

            // Offset required if first parameter negative/before index
            const offset = operation.schema[0] < 0 ? operation.schema[0] : 0
            if (operation.calc) {
                params.push(this)
            }
            let result = operation.func(...params)
            if (typeof result === "number" && isNaN(result)) {
                return `${operation.name} error > NaN error`
            }
            // Angle inverse function
            if (ANGLE_INVERSE_FUNCTIONS.includes(tokens[index]) && this.angle === "deg") {
                result = result * 180 / Math.PI
            }
            // Delete old tokens and insert result token
            tokens.splice(index + offset, operation.schema.length + 1, result)
            return tokens
        } catch (err) {
            console.log("operate error", err)
            return `${operation.name} error`
        }
    }

    // Calculate numerical result from raw expression
    calculate(expression, options = {}) {
        this.recursion = {}
        const tokens = this.parse(expression)
        console.log("parse", tokens)
        if (Array.isArray(tokens)) {
            return this.evaluate(tokens, options)
        } else {
            return tokens
        }
    }
}

