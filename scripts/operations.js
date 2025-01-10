// Order of operations
const ORDER_OF_OPERATIONS = [
    ["!"],              // Unary operations
    ["^", "%"],         // Exponentiation and modulus
    ["/", "*"],         // Division then multiplication
    ["-"],        // Sutraction, negation, and then addition
    ["+"],
    ["~", "&", "|"],
    ["<<", ">>"],
]

// Subsets
const CONSTANTS = ["pi", "e", "tau", "phi", "inf"]
const SYMBOLS = ["+", "-", "*", "/", "^", "!", "%", "<<", ">>", "&", "|", "~"]
const ANGLE_FUNCTIONS = ["sin", "cos", "tan", "csc", "sec", "cot"]
const ANGLE_INVERSE_FUNCTIONS = ["arcsin", "arccos", "arctan"]
const KEYWORDS = ["ans", "clear", "help", "save"]
const LIST_OPERATIONS = ["mean", "median", "sd", "sum", "len"]

// Types
const TN = "number"
const TS = "string"
const TOR = (t1, t2) => `${t1} | ${t2}`
const TL = (t) => `list[${t}]`
const TA = "any"
const TF = "function"
const TO = (t) => `optional[${t}]`
const TI = "invalid"
const bases = { "0b": 2, "0x": 16, "0o": 8 }

// Operations
const OPERATIONS = {
    "+": {
        name: "Addition",
        func: (a, b) => a + b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "-": {
        name: "Subtraction",
        func: (a, b) => a - b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
        
    },
    "neg": {
        name: "Negation",
        func: (n) => n * -1,
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "*": {
        name: "Multiplication",
        func: (a, b) => a * b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "/": {
        name: "Division",
        func: (a, b) => a / b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "^": {
        name: "Exponentiation",
        func: (a, b) => a ** b,
        schema: [-1, 1],
        vars: ["base", "exponent"],
        types: [TN, TN]
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
        schema: [-1],
        vars: ["x"],
        types: [TN]
    },
    "%": {
        name: "Modulus",
        func: (a, b) => a % b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "mod": {
        name: "Modulus",
        func: (a, b) => a % b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "&": {
        name: "Bitwise and",
        func: (a, b) => a & b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "|": {
        name: "Bitwise or",
        func: (a, b) => a | b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "~": {
        name: "Bitwise negation",
        func: (n) => ~n,
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "xor": {
        name: "Bitwise exclusive or",
        func: (a, b) => a ^ b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    ">>": {
        name: "Right shift",
        func: (a, b) => a >> b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "<<": {
        name: "Left shift",
        func: (a, b) => a << b,
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "round": {
        name: "Round",
        func: (n, p = 0) => Math.round(n * 10 ** p) / (10 ** p),
        schema: [1],
        vars: ["x", "precision"],
        types: [TN, TO(TN)]
    },
    "floor": {
        name: "Floor",
        func: (n) => Math.floor(n),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "ceil": {
        name: "Ceiling",
        func: (n) => Math.ceil(n),
        schema: [1],
        vars: ["number"],
        types: [TN]
    },
    "pi": {
        name: "Pi",
        func: () => Math.PI,
        schema: [],
        vars: [],
        types: []
    },
    "e": {
        name: "Euler's number",
        func: () => Math.E,
        schema: [],
        vars: [],
        types: []
    },
    "phi": {
        name: "Phi",
        func: () => (1 + Math.sqrt(5)) / 2,
        schema: [],
        vars: [],
        types: []
    },
    "inf": {
        name: "Infinity",
        func: () => Infinity,
        schema: [],
        vars: [],
        types: []
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
        schema: [1],
        vars: ["base", "x"],
        types: [TN, TO(TN)]
    },
    "ln": {
        name: "Natural Logarithm",
        func: (x) => Math.log(x),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "sin": {
        name: "Sine",
        func: (theta) => Math.sin(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "cos": {
        name: "Cosine",
        func: (theta) => Math.cos(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "tan": {
        name: "Tangent",
        func: (theta) => Math.tan(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "csc": {
        name: "Cosecant",
        func: (theta) => 1 / Math.sin(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "sec": {
        name: "Secant",
        func: (theta) => 1 / Math.cos(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "cot": {
        name: "Cotangent",
        func: (theta) => 1 / Math.tan(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "arcsin": {
        name: "Inverse sine",
        func: (theta) => Math.asin(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "arccos": {
        name: "Inverse cosine",
        func: (theta) => Math.acos(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "arctan": {
        name: "Inverse tangent",
        func: (theta) => Math.atan(theta),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "abs": {
        name: "Absolute value",
        func: (n) => Math.abs(n),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "min": {
        name: "Minimum",
        func: (...nums) => Math.min(...nums),
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "max": {
        name: "Maximum",
        func: (...nums) => Math.max(...nums),
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "sqrt": {
        name: "Square root",
        func: (n) => Math.sqrt(n),
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "sum": {
        name: "Sum",
        func: (nums) => nums.reduce((a, b) => a + b),
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "mean": {
        name: "Mean",
        func: (nums) => mean(nums),
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
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
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "sd": {
        name: "Standard deviation",
        func: (nums) => {
            const m = mean(nums)
            return Math.sqrt(mean(nums.map((n) => {
                return (n - m) ** 2
            })))
        },
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "bin": {
        name: "Decimal to binary",
        func: (n) => {
            return new String("0b" + n.toString(2))
        },
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "hex": {
        name: "Decimal to hexadecimal",
        func: (n) => {
            return new String("0x" + n.toString(16))
        },
        schema: [1],
        vars: ["number"],
        vars: ["x"],
        types: [TN]
    },
    "oct": {
        name: "Decimal to octal",
        func: (n) => {
            return new String("0o" + n.toString(8))
        },
        schema: [1],
        vars: ["number"],
        vars: ["x"],
        types: [TN]
    },
    "dec": {
        name: "Convert to decimal",
        func: (n, radix = 10) => {
            n = n.toString()
            for (const base in bases) {
                if (n.toString().startsWith(base)) {
                    n = n.slice(2)
                    radix = bases[base]
                    break
                }
            }
            return parseInt(n, radix)
        },
        schema: [1],
        vars: ["x", "radix"],
        types: [TOR(TN, TS), TO(TN)]
    },
    "quad": {
        name: "Solve quadratic in form of f(x) = ax^2 + bx + c = 0",
        func: (f, calc) => {
            const p = calc.functions[f.op].parameters
            const v = calc.functions[f.op].value
            if (p.length !== 1) {
                return `Expected ${f.op} to have only one parameter`
            } 
            if (count(v, p[0]) !== 2) {
                return `Expected form of ${f.op}(x) = a${p[0]}^2 + b${p[0]} + c = 0. Use zeros as needed e.g. f(x) = 4x^2 - 0x - 16...`
            }
            const L = v.length
            let a = 1
            if (typeof v[0] === "number") {
                a = v[0]
            } else if (v[0] === "-") {
                a = -1
                if (typeof v[1] === "number") {
                    a *= v[1]
                }
            }
            const i = v.indexOf("^")
            let b = 1
            if (v[i + 2] === "-") {
                b = -1
            }
            if (typeof v[i + 3] === "number") {
                b *= v[i + 3]
            } 
            let c = v[L - 1] * (v[L - 2] === "-" ? -1 : 1)
            const result = solve_quadratic(a, b, c).map((x) => round(x, calc.digits))
            if (result.length === 2) {
                return new String(`x = ${result[0]} or x = ${result[1]}`)
            } else if (result.length === 1) {
                return new String(`x = ${result[0]}`)
            } else {
                return new String("No real solutions")
            }
        }, 
        schema: [1],
        vars: ["f"],
        types: [TF],
        calc: true
    },
    "cubic": {
        name: "Solve cubic in form of ax^3 + bx^2 + cx + d = 0",
        func: (a, b, c, d) => solve_cubic(a, b, c, d),
        schema: [1],
        vars: ["a", "b", "c", "d"],
        types: [TN, TN, TN, TN]
    },
    "range": {
        name: "Inclusive range",
        func: (a, b) => {
            let range = []
            if (!b) {
                b = a
                a = 1
            }
            for (let n = a; n <= b; n++) {
                range.push(n)
            }
            return range
        },
        schema: [1],
        vars: ["start", "end"],
        types: [TN, TO(TN)]
    },
    "map": {
        name: "Map",
        func: (list, func, calc) => {
            let output = []
            for (const e of list) {
                let tokens = [func.op, [e]]
                let result = calc.evaluate(tokens, { noAns: true })
                if (typeof result === "string") {
                    return result
                }
                output.push(result)
            }
            return output
        },
        schema: [1],
        vars: ["x", "f"],
        types: [TL(TA), TF],
        calc: true,
        example: "Example:\nf(x) = x^2\nmap(range(1, 5), @f)\nOutput: [1, 4, 9, 16, 25]"
    },
    "reduce": {
        name: "Reduce",
        func: (list, func, calc) => {
            if (list.length === 0) {
                return list
            }
            let acc = list[0]
            for (let i = 1; i < list.length; i++) {
                let tokens
                if (func.op in calc.functions) {
                    tokens = [func.op, [acc, list[i]]]
                } else if (OPERATIONS[func.op]) {
                    const e = OPERATIONS[func.op]
                    if (e.schema.length == 2 && e.schema[0] === -1) {
                        tokens = [acc, func.op, list[i]]
                    } else {
                        tokens = [func.op, [acc, list[i]]]
                    }
                }
                let result = calc.evaluate(tokens, { noAns: true })
                if (typeof result === "string") {
                    return result
                }
                acc = result
            }
            return acc
        },
        schema: [1],
        vars: ["x", "f"],
        types: [TL(TA), TF],
        calc: true,
    },
    "type": {
        name: "Type check",
        func: (x) => {
            return new String(get_param_types([x])[0])
        },
        schema: [1],
        vars: ["x"],
        types: [TA]
    },
    "get": {
        name: "Get element or sublist from list",
        func: (list, start, end) => {
            if (end !== undefined) {
                return list.slice(start - 1, end)
            } else {
                return list[start - 1]
            }
        },
        schema: [1],
        vars: ["x", "start", "end"],
        types: [TL(TA), TN, TO(TN)],
        example: "Example: get(range(1, 5), 3) -> 3\nget(range(1, 5), 2, 4) -> [2, 3, 4]"
    },
    "len": {
        name: "List length",
        func: (list) => {
            return list.length
        },
        schema: [1],
        vars: ["x"],
        types: [TL(TA)]
    },
    "def": {
        name: "View function definition",
        func: (f, calc) => {
            if (f.op in calc.functions) {
                let fs = calc.functions[f.op].string
                while (fs.includes("@") && fs.charAt(fs.indexOf("@") + 1) !== "(") {
                    const index = fs.indexOf("@")
                    let name = fs.slice(fs.indexOf("@"))
                    name = name.slice(0, name.indexOf("("))
                    fs = fs.slice(0, index) + calc.functions[name].string + fs.slice(index + name.length)
                }
                return new String(fs)
            } else {
                return "Def error > can only view user-defined functions"
            }
        },
        schema: [1],
        vars: ["func"],
        types: [TF],
        calc: true
    }
}

const HELP = {
    "@": {
        name: "Lambda function",
        schema: [1],
        vars: ["(...params) = value"],
        types: [TF],
        example: "Example: map(range(1, 5), @(x) = x^2)"
    },
    "clear": {
        name: "Clear calculator",
        schema: [],
        vars: [],
        types: []
    },
    "help": {
        name: "Help",
        schema: [1],
        vars: ["func"],
        types: [TF]
    },
    "ans": {
        name: "Answer - stored result of last calculation",
        schema: [],
        vars: [],
        types: []
    },
    "save": {
        name: "Save user-defined function",
        schema: [1],
        vars: ["func"],
        types: [TF]
    }
}

// Determine if string is name of math function 
// Math function - in OPERATIONS but not a symbol
function isMathFunction(e) {
    return isNaN(e) && e in OPERATIONS && !SYMBOLS.includes(e)
}

// Operation wrapper class
class Operation {
    constructor(op) {
        this.op = op
    }

    toString() {
        return `${this.op}`
    }
}

function get_param_types(params) {
    const type_list = []
    for (const p of params) {
        if (typeof p === "number") {
            type_list.push(TN)
        } else if (p instanceof String) {
            type_list.push(TS)
        } else if (Array.isArray(p)) {
            const types = p.map((t) => get_param_types([t])[0])
            // console.log("types", types)
            if (types.every((t) => t === types[0])) {
                type_list.push(TL(types[0]))
            } else {
                type_list.push(TL(TA))
            }
        } else if (p instanceof Operation) {
            type_list.push(TF)
        } else {
            type_list.push(TI)
        }
    }
    return type_list
}

function check_param_types(param_types, correct_types) {
    // console.log("check_param_types", param_types, correct_types)
    if (correct_types.length === 1 && correct_types[0] === TA) {
        return true
    }
    let valid = 0
    for (let i = 0; i < correct_types.length; i++) {
        let ct = correct_types[i]
        let pt = i < param_types.length ? param_types[i] : null
        // OR
        if (ct.includes("|")) {
            ct = ct.split("|").map((e) => e.trim())
            for (const t of ct) {
                if (t === pt) {
                    valid++
                    continue
                }
            }
        } else if (ct.startsWith("optional")) {
            const open = ct.indexOf("[")
            const close = ct.lastIndexOf("]")
            if (pt === null || pt === ct.slice(open + 1, close)) {
                valid++
            }
        } else if (ct === TL(TA)) {
            if (pt.startsWith("list")) {
                valid++
            }
        } else {
            if (pt === ct) {
                valid++
            }
        }
    }
    // console.log(valid, correct_types.length)
    return valid === correct_types.length
}