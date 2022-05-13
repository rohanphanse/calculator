// Calculator 
// By: Rohan Phanse


// General functions

// Mean
function mean(nums) {
    return nums.reduce((a, b) => a + b) / nums.length
}

// Round
function round(n, p = 0) {
    return Math.round(n * 10 ** p) / (10 ** p)
}

// Operations
const OPERATIONS = {
    "+": {
        name: "Addition",
        func: (a, b) => a + b,
        schema: [-1, 1]
    },
    "-": {
        name: "Subtraction",
        func: (a, b) => a - b,
        schema: [-1, 1]
    },
    "neg": {
        name: "Subtraction",
        func: (n) => n * -1,
        schema: [1]
    },
    "*": {
        name: "Multiplication",
        func: (a, b) => a * b,
        schema: [-1, 1]
    },
    "/": {
        name: "Division",
        func: (a, b) => a / b,
        schema: [-1, 1]
    },
    "^": {
        name: "Exponentiation",
        func: (a, b) => a ** b,
        schema: [-1, 1]
    },
    "!": {
        name: "Factorial",
        func: (n) => {
            let value = 1
            for (let i = 2; i <= n; i++) {
                value *= i
            }
            return value
        },
        schema: [-1]
    },
    "%": {
        name: "Modulus",
        func: (a, b) => a % b,
        schema: [-1, 1]
    },
    "mod": {
        name: "Modulus",
        func: (a, b) => a % b,
        schema: [-1, 1]
    },
    "round": {
        name: "Round",
        func: (n, p = 0) => Math.round(n * 10 ** p) / (10 ** p),
        schema: [1]
    },
    "floor": {
        name: "Floor",
        func: (n) => Math.floor(n),
        schema: [1]
    },
    "ceil": {
        name: "Ceiling",
        func: (n) => Math.ceil(n),
        schema: [1]
    },
    "pi": {
        name: "Pi",
        func: () => Math.PI,
        schema: []
    },
    "tau": {
        name: "Tau",
        func: () => 2 * Math.PI,
        schema: []
    },
    "e": {
        name: "Euler's number",
        func: () => Math.E,
        schema: []
    },
    "phi": {
        name: "Phi",
        func: () => (1 + Math.sqrt(5)) / 2,
        schema: []
    },
    "inf": {
        name: "inf",
        func: () => Infinity,
        schema: []
    },
    "log": {
        name: "Logarithm",
        func: (b, x) => {
            if (x) {
                return Math.log(x) / Math.log(b)
            } else {
                return Math.log(b) / Math.log(10)
            }
        },
        schema: [1]
    },
    "ln": {
        name: "Natural Logarithm",
        func: (x) => Math.log(x),
        schema: [1]
    },
    "sin": {
        name: "Sine",
        func: (theta) => Math.sin(theta),
        schema: [1]
    },
    "cos": {
        name: "Cosine",
        func: (theta) => Math.cos(theta),
        schema: [1]
    },
    "tan": {
        name: "Tangent",
        func: (theta) => Math.tan(theta),
        schema: [1]
    },
    "csc": {
        name: "Cosecant",
        func: (theta) => 1 / Math.sin(theta),
        schema: [1]
    },
    "sec": {
        name: "Secant",
        func: (theta) => 1 / Math.cos(theta),
        schema: [1]
    },
    "cot": {
        name: "Cotangent",
        func: (theta) => 1 / Math.tan(theta),
        schema: [1]
    },
    "arcsin": {
        name: "Arcsine",
        func: (theta) => Math.asin(theta),
        schema: [1]
    },
    "arccos": {
        name: "Arccosine",
        func: (theta) => Math.acos(theta),
        schema: [1]
    },
    "arctan": {
        name: "Arctangent",
        func: (theta) => Math.atan(theta),
        schema: [1]
    },
    "abs": {
        name: "Absolute value",
        func: (n) => Math.abs(n),
        schema: [1]
    },
    "min": {
        name: "Minimum",
        func: (nums) => Math.min(...nums),
        schema: [1]
    },
    "max": {
        name: "Maximum",
        func: (nums) => Math.max(...nums),
        schema: [1]
    },
    "sqrt": {
        name: "Square root",
        func: (n) => Math.sqrt(n),
        schema: [1]
    },
    "sum": {
        name: "Sum",
        func: (nums) => nums.reduce((a, b) => a + b),
        schema: [1]
    },
    "mean": {
        name: "Mean",
        func: (nums) => mean(nums),
        schema: [1]
    },
    "median": {
        name: "Median",
        func: (nums) => {
            if (nums.length > 1) {
                nums.sort((a, b) => a - b)
                if (nums.length % 2 === 0) {
                    return (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2
                } else {
                    return nums[Math.floor(nums.length / 2)]
                }
            } else {
                return nums[0]
            }
        },
        schema: [1]
    },
    "sd": {
        name: "Standard deviation",
        func: (nums) => {
            const m = mean(nums)
            return Math.sqrt(mean(nums.map((n) => {
                return (n - m) ** 2
            })))
        },
        schema: [1]
    },
    "bin": {
        name: "Binary",
        func: (n) => {
            const binary = []
            
            if (n > 0) {
                while (n > 0) {
                    binary.unshift(n % 2)
                    n = Math.floor(n / 2)
                } 
                return binary.join("")
            } else if (n === 0) {
                return 0
            }
        },
        schema: [1]
    },
    "dec": {
        name: "Decimal",
        func: (n) => {
            let decimal = 0
            const digits = n.toString().split().reverse()
            for (let i = 0; i < digits.length; i++) {
                decimal += (2 ** i) * +digits[i] 
            }
            return decimal
        },
        schema: [1]
    },
    "derivative": {
        name: "Derivative",
        func: (x, f, precision = 6) => {
            const run = 10 ** (-1 * precision) 
            const rise = f(x + run) - f(x)
            return round(rise / run, precision)
        }
    }
}

// Order of operations
const ORDER_OF_OPERATIONS = [
    ["!"],      // Unary operations
    ["^", "%"], // Exponentiation and modulus
    ["/", "*"], // Division then multiplication
    ["-", "+"]  // Sutraction, negation, and then addition
]

// Subsets
const CONSTANTS = ["pi", "e", "tau", "phi", "inf"]
const SYMBOLS = ["+", "-", "*", "/", "^", "!", "%"]
const ANGLE_FUNCTIONS = ["sin", "cos", "tan", "csc", "sec", "cot"]
const ANGLE_INVERSE_FUNCTIONS = ["arcsin", "arccos", "arctan"]
const KEYWORDS = ["ans", "def"]
const LIST_OPERATIONS = ["mean", "median", "sd", "sum"]

// Determine if string is name of math function 
// Math function - in OPERATIONS but not a symbol
function isMathFunction(e) {
    return isNaN(e) && e in OPERATIONS && !SYMBOLS.includes(e)
}

// Count occurences in array or string
function count(array, value) {
    let counter = 0
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            counter++
        }
    }
    return counter
}


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
        expression = expression.replace(/\s/g,"").toLowerCase()
        
        // Includes one instance of "def"
        if (expression.split("def").length - 1 === 1 && expression.slice(0, 3) === "def") {
            return this.declareFunction(expression)
        // Includes equals sign
        } else if (expression.includes("=")) {
            // Only 1 equals sign
            if ((expression.match(/=/g) || []).length === 1) {
                return this.declareVariable(expression)
            } else {
                return "Variable assignment error"
            }
   
        }
        
        // Loop through string
        for (let i = 0; i < expression.length; i++) {
            // Symbol
            if (SYMBOLS.includes(expression[i])) {
                tokens.push(expression[i])
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
                    if (typeof this.ans === "number") {
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
            // Parenthesis or square brackets
            } else if (["(", ")", "[", "]"].includes(expression[i])) {
                tokens.push(expression[i])
            // Comma
            } else if (expression[i] === ",") {
                tokens.push(expression[i])
            // Unknown character
            } else {
                return `Unknown character "${expression[i]}" at position ${i + 1}`
            }
        }

        // Number parentheses and brackets
        let paren_counter = 1
        let bracket_counter = 1

        if (tokens.includes("(") || tokens.includes(")")) {
            for (let i = 0; i < tokens.length; i++) {
                // Closing parenthesis before opening parenthesis
                if (paren_counter < 1) {
                    return "Parenthesis error"
                }
                if (tokens[i] === "(") {
                    tokens[i] = `${tokens[i]}${paren_counter}`
                    paren_counter++
                } else if (tokens[i] === ")") {
                    paren_counter--
                    tokens[i] = `${tokens[i]}${paren_counter}`
                }
            }

            // Different number of opening and closing parentheses
            if (paren_counter !== 1) {
                return "Parenthesis error"
            }
        }

        if (tokens.includes("[") || tokens.includes("]")) {
            for (let i = 0; i < tokens.length; i++) {
                // Closing bracket before opening bracket
                if (bracket_counter < 1) {
                    return "Bracket error"
                }
                if (tokens[i] === "[") {
                    tokens[i] = `${tokens[i]}${bracket_counter}`
                    bracket_counter++
                } else if (tokens[i] === "]") {
                    bracket_counter--
                    tokens[i] = `${tokens[i]}${bracket_counter}`
                }
            }
            
            // Different number of opening and closing brackets
            if (bracket_counter !== 1) {
                return "Bracket error"
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
        // Loop through string until end
        while (index + length <= string.length) {
            length++
            // Check if substring fails
            if (check(string.substr(index, length))) {
                break
            }
        }
        // Return substring from index to accumulated length - 1
        return string.substr(index, length - 1)
    }

    // Declare variable given raw expression
    declareVariable(expression) {
        try {
            let [name, value] = expression.split("=")
            let status = 0

            // Name is alphabetic
            if (/^[a-z_]+$/i.test(name)) {
                // Name is an operation or keyword
                if (name in OPERATIONS || KEYWORDS.includes(name || name in this.functions) ) {
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
                // Reassign variable
                if (name in this.variables) {
                    this.variables[name] = result
                    return `Variable ${name} reassigned`
                // Declare variable
                } else {
                    this.variables[name] = result
                    return `Variable ${name} declared`
                }  
            } else {
                return "Variable assignment error"
            }
        } catch (err) {
            return "Variable assignment error"
        }
    }

    declareFunction(expression) {
        try {
            expression = expression.slice(3).split("=")
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
        try {
            const array = []
            let start = 0
            for (let t = 0; t < tokens.length; t++) {
                if (tokens[t] === ",") {
                    array.push(tokens.slice(start, t))
                    start = t + 1
                } else if (t === tokens.length - 1) {
                    array.push(tokens.slice(start, t + 1))
                }
            }
            for (let a = 0; a < array.length; a++) {
                if (!Array.isArray(array[a][0])) {
                    const result = this.evaluate(array[a], { noAns: true })
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
            return "Array error"
        }
    }

    evaluateFunction(tokens, index) {
        this.recursion[tokens[index]] = this.recursion?.[tokens[index]] ? this.recursion[tokens[index]] + 1 : 1
        if (this.recursion?.[tokens[index]] > 10) {
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
    
    // Parentheses test case
    // (1 (2 (3 )3 (3 )3 )2 (2 )2 )1 (1 )1
    // (5 * ((4 + 3) / 2 - (3 - 4 / 2) * 10) / (10 / 9)) * 100

    // Evaluate numerical result from tokens
    evaluate(tokens, options = {}) {
        // Replace ans with value
        if (typeof this.ans === "number") {
            for (let t = 0; t < tokens.length; t++) {
                if (tokens[t] === "ans" ) {
                    tokens[t] = this.ans
                }
            }
        }

        // Brackets
        const brackets = []
        for (const t of tokens) {
            if (typeof t === "string" && t[0] === "[") {
                brackets[+t.slice(1) - 1] = brackets[+t.slice(1) - 1] ? brackets[+t.slice(1) - 1] + 1 : 1
            }
        }
        console.log("Bracket counter", brackets)

        // Create array where index represents level of parenthesis and value represents frequency
        const parentheses = []
        for (const t of tokens) {
            if (typeof t === "string" && t[0] === "(") {
                parentheses[+t.slice(1) - 1] = parentheses[+t.slice(1) - 1] ? parentheses[+t.slice(1) - 1] + 1 : 1
            }
        }
        console.log("Parenthesis counter", parentheses)

        // Loop through each level of brackets
        for (let i = brackets.length - 1; i >= 0; i--) {
            // Loop through frequency of each level
            for (let j = 0; j < brackets[i]; j++) {
                // Loop through tokens
                for (let t = 0; t < tokens.length; t++) {
                    // Opening bracket
                    if (tokens[t] === `[${i + 1}`) {
                        // Closing bracket
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
        
        // Loop through each level of parentheses
        for (let i = parentheses.length - 1; i >= 0; i--) {
            // Loop through frequency of each level
            for (let j = 0; j < parentheses[i]; j++) {
                // Loop through tokens
                for (let t = 0; t < tokens.length; t++) {
                    // Opening parenthesis
                    if (tokens[t] === `(${i + 1}`) {
                        // Closing parenthesis
                        const close = tokens.indexOf(`)${i + 1}`)
                        // Empty parenthesis
                        if (close - t === 1) {
                            // Previous token is math function
                            if (isMathFunction(tokens[t - 1]) || tokens[t - 1] in this.functions) {
                                // () -> null
                                tokens.splice(t, close - t + 1, [])
                            } else {
                                // () -> 0
                                tokens.splice(t, close - t + 1, 0)
                            }
                            break
                        } else if (tokens.slice(t + 1, close).includes(",")) {
                            const array = this.initializeArray(tokens.slice(t + 1, close))
                            if (typeof array === "string") {
                                return array
                            } else {
                                tokens.splice(t, close - t + 1, array)
                            }
                            console.log("array", tokens)
                            break
                        }

                        // Evaluate expression inside parentheses
                        const result = this.evaluateSingle(tokens.slice(t + 1, close))
                        // Error
                        if (typeof result === "string") {
                            return result      
                        } else {
                            tokens.splice(t, close - t + 1, result)
                        }
                        console.log("parens", tokens)
                        break
                    }
                }
            }
        }

        // No parentheses left
        // Single expression to be evaluated
        const result = this.evaluateSingle(tokens)
        console.log("evaluateSingle", result)
        if (typeof result === "number" && !options?.noAns) {
            this.ans = result
        }
        const final_result = this.evaluateSingle(tokens, { round: true })
        if (Array.isArray(final_result) && !options?.array) {
            return JSON.stringify(final_result).replaceAll(",", ", ")
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
            return OPERATIONS[tokens[0]].name
        } else if (Array.isArray(tokens[0])) {
            return tokens[0]
        } else if (tokens[0] in this.functions) {
            return this.functions[tokens[0]].string
        }
        else {
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

            if (!LIST_OPERATIONS.includes(tokens[index])) {
                params = params.flat(1)
                if (params.filter(x => typeof x === "number").length !== params.length) {
                    // Try negation if parameter error for subtraction
                    if (tokens[index] === "-") {
                        console.log("negation")
                        operation = OPERATIONS["neg"]
                        params = operation.schema.map((i) => tokens[i + index])
                        if (params.filter(x => typeof x === "number").length !== params.length) {
                            throw "Error"
                        }
                    } else {
                        throw "Error"
                    }
                }
            } else if (params.length === 1 && !Array.isArray(params[0])) {
                params = [params]
            }

            // Convert angle for angle functions
            if (ANGLE_FUNCTIONS.includes(tokens[index]) && this.angle === "deg") {
                params = params.map(n => n * Math.PI / 180)
            }

            // Offset required if first parameter negative/before index
            const offset = operation.schema[0] < 0 ? operation.schema[0] : 0
            let result = operation.func(...params)
            if (isNaN(result)) {
                return `${operation.name} domain error`
            }
            // Angle inverse function
            if (ANGLE_INVERSE_FUNCTIONS.includes(tokens[index]) && this.angle === "deg") {
                result = result * 180 / Math.PI
            }
            // Delete old tokens and insert result token
            tokens.splice(index + offset, operation.schema.length + 1, result)
            return tokens
        } catch (err) {
            console.log(err)
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

