// Units
const UNITS = ["km", "meter", "cm", "mm", "um", "nm", "ft", "mi", "kg", "gram", "mg", "lb", "oz", "se", "mn", "hr", "ms", "day", "yr", "ly", "wk", "joule", "cal", "kcal", "au", "kjoule", "ev", "byte", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb", "m3", "cm3", "liter", "gal", "ml", "ft3", "in", "kel", "cel", "far"]
const UNIT_NAMES = { "km": "Kilometer", "meter": "Meter", "cm": "Centimeter", "mm": "Millimeter", "um": "Micrometer", "nm": "Nanometer", "ft": "Foot", "mi": "Mile", "kg": "Kilogram", "gram": "Gram", "mg": "Milligram", "lb": "Pound", "oz": "Ounce", "se": "Second", "mn": "Minute", "hr": "Hour", "ms": "Millisecond", "day": "Day", "yr": "Year", "ly": "Light Year", "wk": "Week", "joule": "Joule", "cal": "Calorie", "kcal": "Kilocalorie", "au": "Astronomical Unit", "kjoule": "Kilojoule", "ev": "Electron Volt", "byte": "Byte", "kb": "Kilobyte", "mb": "Megabyte", "gb": "Gigabyte", "tb": "Terabyte", "pb": "Petabyte", "eb": "Exabyte", "zb": "Zettabyte", "yb": "Yottabyte", "m3": "Cubic Meter", "cm3": "Cubic Centimer", "liter": "Liter", "gal": "Gallon", "ml": "Milliiter", "ft3": "Cubic Foot", "in": "Inch", "kel": "Kelvin", "cel": "Celcius", "far": "Fahrenheit" }
const FROM_UNITS = {
    "km": 1000,
    "meter": 1,
    "cm": 0.01,
    "mm": 0.001,
    "um": 0.000001,
    "nm": 0.000000001,
    "ft": 0.3048,
    "mi": 1609.34,
    "kg": 1,
    "gram": 0.001,
    "mg": 0.000001,
    "lb": 0.453592,
    "oz": 0.0283495,
    "se": 1,
    "mn": 60,
    "hr": 3600,
    "ms": 0.001,
    "day": 86400, 
    "yr": 31556952,
    "ly": 9.461e+15,
    "wk": 604800,
    "joule": 1,
    "cal": 4.184,
    "kcal": 4184,
    "au": 1.496e+11,
    "kjoule": 1000,
    "ev": 1.60218e-19,
    "byte": 1,
    "kb": 2**10,
    "mb": 2**20,
    "gb": 2**30,
    "tb": 2**40,
    "pb": 2**50,
    "eb": 2**60,
    "zb": 2**70,
    "yb": 2**80,
    "m3": 1,
    "cm3": 0.000001,
    "liter": 0.001,
    "gal": 0.00378541,
    "ml": 0.000001,
    "ft3": 0.0283168,
    "in": 0.0254,
    "kel": { from: (x) => x - 273.15, to: (x) => x + 273.15 },
    "cel": { from: (x) => x, to: (x) => x },
    "far": { from: (x) => (x - 32) * 5/9, to: (x) => x * 9/5 + 32 }
}
const TO_UNITS = {}
for (const u in FROM_UNITS) {
    if (typeof FROM_UNITS[u] === "number") {
        TO_UNITS[u] = 1 / FROM_UNITS[u]
    }
}
// Order of operations
const ORDER_OF_OPERATIONS = [
    ["!"],              // Unary operations
    ["^", "mod"],         // Exponentiation and modulus
    ["choose", "perm", "cross"],
    ["to"],
    UNITS,
    ["/", "*"],         // Division then multiplication
    ["-"],        // Sutraction, negation, and then addition
    ["+"],
    [":"],
    ["==", "!=", "<", ">", ">=", "<="],
    ["not"],
    ["and"],
    ["or"],
    ["~", "&", "|", "xor"],
    ["<<", ">>"],
]

// Subsets
const CONSTANTS = ["pi", "e", "phi", "inf", "units", "true", "false"]
const SYMBOLS = ["+", "-", "*", "/", "^", "!", "<<", ">>", "&", "|", "~", "xor", "choose", "perm", "to", ...UNITS, ":", "cross", "==", "!=", ">", ">=", "<", "<=", "and", "or", "not", "mod"]
const ANGLE_FUNCTIONS = ["sin", "cos", "tan", "csc", "sec", "cot"]
const ANGLE_INVERSE_FUNCTIONS = ["arcsin", "arccos", "arctan"]
const KEYWORDS = ["ans", "clear", "help", "save", "if", "then", "else", "trace", "plot"]
const LIST_OPERATIONS = ["mean", "median", "sd", "sort", "sum", "len", "max", "min", "concat", "zeros"]

// Types
const TN = "number"
const TS = "string"
const TOR = (t1, t2) => `${t1} | ${t2}`
const TL = (t) => `list[${t}]`
const TA = "any"
const TF = "function"
const TO = (t) => `optional[${t}]`
const TI = "invalid"
const TU = "unit"
const TB = "bool"
const bases = { "0b": 2, "0x": 16, "0o": 8 }

// Operations
const OPERATIONS = {
    "+": {
        name: "Addition",
        func: (a, b) => {  
            param_types = get_param_types([a, b]) 
            if (param_types[0] == TN && param_types[1] == TN) {
                if (a instanceof Fraction && b instanceof Fraction) {
                    return add_fractions(a, b)
                } else if (a instanceof Fraction && Number.isInteger(b)) {
                    return add_fractions(a, new Fraction(b, 1))
                } else if (b instanceof Fraction && Number.isInteger(a)) {
                    return add_fractions(new Fraction(a, 1), b)
                }
                if (a instanceof Fraction) {
                    a = a.value()
                }
                if (b instanceof Fraction) {
                    b = b.value()
                }
                return a + b
            } else if (param_types[0].startsWith("list") && param_types[1].startsWith("list") && param_types[0] == param_types[1]) {
                return add_tensors(a, b)
            } else if (param_types[0] == "number" && param_types[1].startsWith("list")) {
                return tensor_add_scalar(b, a)
            } else if (param_types[1] == "number" && param_types[0].startsWith("list")) {
                return tensor_add_scalar(a, b)
            } else {
                return "Invalid types"
            }
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TOR(TN, TL(TA)), TOR(TN, TL(TA))],
        example: "Examples:\n  1. Add numbers: \`2 + 2 -> 4\`\n  2. Add tensors: \`[[[1, 2]]] + [[[2, 1]]] -> [[[3, 3]]]\`\n  3. Add numbers and tensors: \`2 + [1, 2] -> [3, 4]\`",
        allow_fractions: true
    },
    "-": {
        name: "Subtraction",
        func: (a, b) => {
            param_types = get_param_types([a, b])
            if (param_types[0] == TN && param_types[1] == TN) {
                if (a instanceof Fraction && b instanceof Fraction) {
                    return subtract_fractions(a, b)
                } else if (a instanceof Fraction && Number.isInteger(b)) {
                    return subtract_fractions(a, new Fraction(b, 1))
                } else if (b instanceof Fraction && Number.isInteger(a)) {
                    return subtract_fractions(new Fraction(a, 1), b)
                }
                if (a instanceof Fraction) {
                    a = a.value()
                }
                if (b instanceof Fraction) {
                    b = b.value()
                }
                return a - b
            } else if (param_types[0].startsWith("list") && param_types[1].startsWith("list") && param_types[0] == param_types[1]) {
                return add_tensors(a, b, -1)
            } else if (param_types[0] == "number" && param_types[1].startsWith("list")) {
                return tensor_add_scalar(b, a, -1)
            } else if (param_types[1] == "number" && param_types[0].startsWith("list")) {
                return tensor_add_scalar(a, -b)
            } else {
                return "Invalid types"
            }
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TOR(TN, TL(TA)), TOR(TN, TL(TA))],
        allow_fractions: true
        
    },
    "neg": {
        name: "Negation",
        func: (n) => {
            param_type = get_param_types([n])[0]
            if (param_type == TN) {
                if (n instanceof Fraction) {
                    let copy = new Fraction(n.n, n.d)
                    copy.neg = !n.neg
                    return copy
                }
                return -n
            } else if (param_type.startsWith("list")) {
                return add_tensors(n, n, -1, 0)
            } else {
                return "Invalid types"
            }
        },
        schema: [1],
        vars: ["x"],
        types: [TOR(TN, TL(TA))],
        allow_fractions: true,
    },
    "*": {
        name: "Multiplication",
        func: (a, b) => {
            param_types = get_param_types([a, b])
            if (param_types[0] == TN && param_types[1] == TN) {
                if (a instanceof Fraction && b instanceof Fraction) {
                    return new Fraction(a.n * b.n, a.d * b.d)
                } else if (a instanceof Fraction && Number.isInteger(b)) {
                    return new Fraction(a.n * b, a.d)
                } else if (b instanceof Fraction && Number.isInteger(a)) {
                    return new Fraction(b.n * a, b.d)
                }
                return a * b
            } else if (param_types[0] == TL(TN) && param_types[1] == TL(TN)) {
                if (a.length !== b.length) {
                    return "Dot product error > vectors must be the same size"
                }
                let dot_product = 0
                for (let i = 0; i < a.length; i++) {
                    dot_product += a[i] * b[i]
                }
                return dot_product
            } else if (param_types[0] == TL(TL(TN)) && param_types[1] == TL(TL(TN))) {
                return matmul(a, b)
            } else if (param_types[0] == TN && param_types[1] == TL(TL(TN))) {
                return matmul_scalar(b, a)
            } else if (param_types[1] == TN && param_types[0] == TL(TL(TN))) {
                return matmul_scalar(a, b)
            } else if (param_types[0] == TN && param_types[1] == TL(TN)) {
                return matmul_scalar([b], a)[0]
            } else if (param_types[1] == TN && param_types[0] == TL(TN)) {
                return matmul_scalar([a], b)[0]
            } else {
                return "Invalid types"
            }
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TOR(TN, TOR(TL(TN), TL(TL(TN)))), TOR(TN, TOR(TL(TN), TL(TL(TN))))],
        example: "Examples:\n  1. Multiply numbers: \`2 * 2 -> 4\`\n  2. Dot product: \`[1, 2] * [3, 4] -> 11\`\n  3. Matrix multiplication:\n     \`[[1, 2], [3, 4]] * [[1, 1], [1, 1]] -> [[3, 3], [7, 7]]\`",
        allow_fractions: true
    },
    "/": {
        name: "Division",
        func: (a, b) => {
            if (Number.isInteger(a) && Number.isInteger(b)) {
                return new Fraction(a, b)
            } else if (a instanceof Fraction && b instanceof Fraction) {
                return new Fraction(a.n * b.d, a.d * b.n)
            } else if (a instanceof Fraction && Number.isInteger(b)) {
                return new Fraction(a.n, b * a.d)
            } else if (b instanceof Fraction && Number.isInteger(a)) {
                return new Fraction(a * b.d, b.n)
            } else if (a instanceof Constant && Number.isInteger(b)) {
                return new Fraction(a, b)
            }
            if (a instanceof Constant) {
                a = a.value()
            }
            if (b instanceof Constant) {
                b = b.value()
            }
            return a / b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN],
        allow_fractions: true,
        allow_constants: true
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
        func: (n) => factorial(n),
        schema: [-1],
        vars: ["x"],
        types: [TN]
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
        types: [],
    },
    "e": {
        name: "Euler's number",
        func: () => Math.E,
        schema: [],
        vars: [],
        types: [],
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
        func: (theta) => {
            if (is_close(theta, Math.PI / 6)) {
                return new Fraction(1, 2)
            }
            if (is_close(theta, Math.PI)) {
                return 0
            }
            return Math.sin(theta)
        },
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "cos": {
        name: "Cosine",
        func: (theta) => {
            if (is_close(theta, Math.PI / 3)) {
                return new Fraction(1, 2)
            }
            if (is_close(theta, Math.PI / 2)) {
                return 0
            }
            return Math.cos(theta)
        },
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "tan": {
        name: "Tangent",
        func: (theta) => {
            if (is_close_to_int(theta / Math.PI)) {
                return 0
            }
            return Math.tan(theta)
        },
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
        func: (theta) => {
            if (is_close(theta, 0.5)) {
                return new Fraction("pi", 6)
            }
            if (is_close(theta, -0.5)) {
                return new Fraction("pi", -6)
            }
            return Math.asin(theta)
        },
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
        func: (nums) => Math.min(...nums),
        schema: [1],
        vars: ["x"],
        types: [TL(TN)]
    },
    "max": {
        name: "Maximum",
        func: (nums) => Math.max(...nums),
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
                nums = [...nums].sort((a, b) => a - b)
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
    "sort": {
        name: "Sort",
        func: (nums) => {
            return [...nums].sort((a, b) => a - b)
        },
        schema: [1],
        vars: ["x"],
        types: [TL(TN)],
    },
    "bin": {
        name: "Decimal to binary",
        func: (n) => {
            if (isInt32(n)) {
                return new BaseNumber("0b" + (n >>> 0).toString(2))
            }
            return new BaseNumber("0b" + n.toString(2))
        },
        schema: [1],
        vars: ["x"],
        types: [TN]
    },
    "hex": {
        name: "Decimal to hexadecimal",
        func: (n) => {
            if (isInt32(n)) {
                return new BaseNumber("0x" + (n >>> 0).toString(16))
            }
            return new BaseNumber("0x" + n.toString(16))
        },
        schema: [1],
        vars: ["number"],
        vars: ["x"],
        types: [TN]
    },
    "oct": {
        name: "Decimal to octal",
        func: (n) => {
            if (isInt32(n)) {
                return new BaseNumber("0o" + (n >>> 0).toString(8))
            }
            return new BaseNumber("0o" + n.toString(8))
        },
        schema: [1],
        vars: ["number"],
        vars: ["x"],
        types: [TN]
    },
    "dec": {
        name: "Convert to decimal",
        func: (n, radix = 10) => convert_to_decimal(n, radix),
        schema: [1],
        vars: ["x", "radix"],
        types: [TN, TO(TN)],
        allow_base_numbers: true,
    },
    "quad": {
        name: "Solve quadratic in form of f(x) = ax^2 + bx + c = 0",
        func: (f, calc) => {
            const p = calc.functions[f.op].parameters
            const v = calc.functions[f.op].value
            if (p.length !== 1) {
                return `Expected ${f.op} to have only one parameter`
            } 
            const x = p[0]
            const eq = v.join("")
            const eq_x = eq.replaceAll(x, "x")
            const match = eq_x.match(/([+-]?\d*)x\^2(?:([+-]?\d*)x)?([+-]?\d*)?/)
            if (match) {
                const a = parseFloat(match[1] || "1")
                const b = parseFloat(match[2] || "0")
                const c = parseFloat(match[3] || "0")
                const result = solve_quadratic(a, b, c).map((x) => round(x, calc.digits))
                if (result.includes(NaN)) {
                    return "Invalid format error"
                }
                let b_part = b == 0 ? "" : ` ${b < 0 ? "-" : "+"} ${Math.abs(b)}${x}`
                let c_part = c == 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`
                let response = `\`${a == 1 ? "" : a}${x}^2${b_part}${c_part} = 0\`\n\Roots: `
                if (result.length === 2) {
                    response += `\`${x} = ${result[0]}\` or \`${x} = ${result[1]}\``
                } else if (result.length === 1) {
                    response += `\`${x} = ${result[0]}\``
                } else {
                    response += "No real solutions"
                }
                return new String(response)
            } else {
                return "Invalid format error"
            }
        }, 
        schema: [1],
        vars: ["f"],
        types: [TF],
        calc: true
    },
    "cubic": {
        name: "Solve cubic in form of f(x) = ax^3 + bx^2 + cx + d = 0",
        func: (f, calc) => {
            const p = calc.functions[f.op].parameters
            const v = calc.functions[f.op].value
            if (p.length !== 1) {
                return `Expected ${f.op} to have only one parameter`
            } 
            const x = p[0]
            const eq = v.join("")
            const eq_x = eq.replaceAll(x, "x")
            const match = eq_x.match(/([+-]?\d*)x\^3(?:\s*([+-]?\d*)x\^2)?(?:\s*([+-]?\d*)x)?(?:\s*([+-]?\d+))?/)
            if (match) {
                const a = parseCoefficient(match[1])
                const b = parseCoefficient(match[2])
                const c = parseCoefficient(match[3])
                const d = parseFloat(match[4] || "0")
                const result = solve_cubic(a, b, c, d).map((x) => round(x, calc.digits))
                if (result.includes(NaN)) {
                    return "Invalid format error"
                }
                let b_part = b == 0 ? "" : ` ${b < 0 ? "-" : "+"} ${Math.abs(b)}${x}^2`
                let c_part = c == 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}${x}`
                let d_part = d == 0 ? "" : ` ${d < 0 ? "-" : "+"} ${Math.abs(d)}`
                let response = `\`${a == 1 ? "" : a}${x}^3${b_part}${c_part}${d_part} = 0\`\nRoots: `
                if (result.length === 3) {
                    response += `\`${x} = ${result[0]}\` or \`${x} = ${result[1]}\` or \`${x} = ${result[2]}\``
                } else if (result.length === 2) {
                    response += `\`${x} = ${result[0]}\` or \`${x} = ${result[1]}\``
                } else if (result.length === 1) {
                    response += `\`${x} = ${result[0]}\``
                } else {
                    response += "No real solutions"
                }
                return new String(response)
            } else {
                return "Invalid format error"
            }
        }, 
        schema: [1],
        vars: ["f"],
        types: [TF],
        calc: true
    },
    "range": {
        name: "Range",
        func: (a, b, step = 1) => {
            let range = []
            if (!b) {
                b = a
                a = 1
            }
            for (let n = a; n <= b; n += step) {
                range.push(n)
            }
            return range
        },
        schema: [1],
        vars: ["start", "end", "step"],
        types: [TN, TO(TN), TO(TN)],
        example: "Examples:\n  1. \`range(5) -> [1, 2, 3, 4, 5]\`\n  2. \`range(3, 5) -> [3, 4, 5]\`\n  3. \`range(3, 5, 0.5) -> [3, 3.5, 4, 4.5, 5]\`"
    },
    "map": {
        name: "Map",
        func: (list, func, calc) => {
            let output = []
            for (const e of list) {
                let tokens = [func.op, new Paren([e])]
                let result = calc.evaluate(tokens, { noAns: true, noRound: true })
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
        example: "Examples:\n  1. \`f(x) = x^2; map(range(1, 3), f) -> [1, 4, 9]\`\n  2. \`map(range(1, 3), @(x) = x^2) -> [1, 4, 9]\`"
    },
    "filter": {
        name: "Filter",
        func: (list, func, calc) => {
            let output = []
            for (const e of list) {
                let tokens = [func.op, new Paren([e])]
                let result = calc.evaluate(tokens, { noAns: true, noRound: true })
                if (typeof result === "string") {
                    return result
                }
                if (result) {
                    output.push(e)
                }
            }
            return output
        },
        schema: [1],
        vars: ["x", "f"],
        types: [TL(TA), TF],
        calc: true,
        example: "Examples:\n  1. \`f(a) = a mod 2; filter(range(5), f) -> [1, 3, 5]\`\n  2. \`filter(range(5), @(a) = a mod 2) -> [1, 3, 5]\`"
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
                    tokens = [func.op, new Paren([acc, list[i]])]
                } else if (OPERATIONS[func.op]) {
                    const e = OPERATIONS[func.op]
                    if (e.schema.length == 2 && e.schema[0] === -1) {
                        tokens = [acc, func.op, list[i]]
                    } else {
                        tokens = [func.op, new Paren([acc, list[i]])]
                    }
                }
                let result = calc.evaluate(tokens, { noAns: true, noRound: true })
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
        example: "Examples:\n  1. \`reduce(range(5), *) -> 120\`\n  2. \`reduce([1, -2, 10, 5], \n       @(x, y) = if x > y then x else y) -> 10\`"
    }, 
    "type": {
        name: "Type",
        func: (x) => {
            return new String(`\`${get_param_types([x])[0]}\``)
        },
        schema: [1],
        vars: ["x"],
        types: [TA],
        example: "Examples:\n  1. \`type(pi) -> number\n\`  2. \`type(0b101) -> string\`\n  3. \`type([1, 2, 3]) -> list[number]\`\n  4. \`type([[1, 2], [3, 4]]) -> list[list[number]]\`\n  5. \`type([1, 0b101, [2]]) -> list[any]\`\n  6. \`type(true) -> bool\`\n  7. \`type(km) -> unit\`\n  8. \`type(sin) -> function\`"
    },
    "index": {
        name: "Index",
        func: (A, I) => process_index(A, I),
        schema: [1],
        vars: ["A", "I"],
        types: [TL(TA), TL(TA)]
    },
    ":": {
        name: "Slice",
        func: (a, b) => {
            return [a, b]
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TN, TN],
        example: "Examples: \`A = [[1, 2, 3], [4, 5, 6, 7]]\`\n  1. \`A(2) -> [4, 5, 6, 7]\`\n  2. \`A(2, 2:3) -> [5, 6]\`\n  3. \`A(2, 2:) -> [5, 6, 7]\`\n  4. \`A(1, :2) -> [1, 2]\`\n  5. \`A(:, 1) -> [1, 4]\`"
    },
    ":2": {
        name: "Range pair",
        func: (a) => {
            return [false, a]
        },
        schema: [1],
        vars: ["a"],
        types: [TN]
    },
    ":3": {
        name: "Range pair",
        func: (a) => {
            return [a, false]
        },
        schema: [-1],
        vars: ["a"],
        types: [TN]
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
    "concat": {
        name: "Concatenate lists",
        func: (lists) => {
            let ans = []
            for (const l of lists) {
                if (Array.isArray(l)) {
                    ans.push(...l)
                } else {
                    ans.push(l)
                }
            }
            return ans
        },
        schema: [1],
        vars: ["a"],
        types: [TL(TA)],
        example: "Examples:\n  1. \`concat([1, 2], [3, 4]) -> [1, 2, 3, 4]\`\n  2. \`concat([1, 2], 3, 4) -> [1, 2, 3, 4]\`"
    },
    "rref": {
        name: "Reduced Row Echelon Form (RREF)",
        func: (m) => rref(m),
        schema: [1],
        vars: ["m"],
        types: [TL(TL(TN))]
    },
    "det": {
        name: "Determinant",
        func: (m) => det(m),
        schema: [1],
        vars: ["m"],
        types: [TL(TL(TN))]
    },
    "zeros": {
        name: "Create zero tensor",
        func: (dims) => create_zero_tensor(dims),
        schema: [1],
        vars: ["dims"],
        types: [TL(TA)],
        example: "Examples:\n  1. zeros(2, 2) -> [[0, 0], [0, 0]]\n  2. zeros(1, 2, 3) -> [[[0, 0, 0], [0, 0, 0]]]"
 },
    "ident": {
        name: "Create identity matrix",
        func: (n) => {
            const m = []
            for (let i = 0; i < n; i++) {
                m.push([])
                for (let j = 0; j < n; j++) {
                    m[i].push(0)
                }
                m[i][i] = 1
            }
            return m
        },
        schema: [1],
        vars: ["n"],
        types: [TN]
    },
    "tran": {
        name: "Transpose",
        func: (m) => {
            if (Array.isArray(m[0])) {
                const tm = []
                for (let j = 0; j < m[0].length; j++) {
                    tm.push([])
                    for (let i = 0; i < m.length; i++) {
                        tm[j].push(m[i][j])
                    }
                }
                return tm;
            } else {
                return m.map((x) => [x])
            }
        },
        schema: [1],
        vars: ["m"],
        types: [TOR(TL(TL(TN)), TL(TN))]
    },
    "inv": {
        name: "Inverse",
        func: (m) => inverse(m),
        schema: [1],
        vars: ["m"],
        types: [TL(TL(TN))]
    },
    "choose": {
        name: "Choose (# of combinations)",
        func: (n, k) => {
            return Math.round(factorial(n) / (factorial(k) * factorial(n - k)))
        },
        schema: [-1, 1],
        vars: ["n", "k"],
        types: [TN, TN]
    },
    "perm": {
        name: "Compute # of permutations",
        func: (n, k) => {
            return Math.round(factorial(n) / (factorial(n - k)))
        },
        schema: [-1, 1],
        vars: ["n", "k"],
        types: [TN, TN]
    },
    "rank": {
        name: "Rank",
        func: (m) => {
            if (m.length === 0 || m[0].length === 0) {
                return 0
            }
            const rref_m = rref(m)
            let rank = 0
            for (let i = 0; i < rref_m.length; i++) {
                const is_zero_row = rref_m[i].every(e => e === 0);
                if (!is_zero_row) {
                    rank++
                } 
            }
            return rank
        },
        schema: [1],
        vars: ["m"],
        types: [TL(TL(TN))]
    },
    "cross": {
        name: "Cross product",
        func: (a, b) => {
            if (a.length !== 3 || b.length !== 3) {
                return "Vectors must be 3-dimensional"
            }
            const result = [
                a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0],
            ]
            return result;
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TL(TN), TL(TN)]
    },
    "gcd": {
        name: "Greatest common divisor",
        func: (a, b) => gcd(a, b),
        schema: [1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "lcm": {
        name: "Least common multiple",
        func: (a, b) => lcm(a, b),
        schema: [1],
        vars: ["a", "b"],
        types: [TN, TN]
    },
    "factor": {
        name: "Prime factorization",
        func: (n) => {
            let N = n
            const factors = []
            let divisor = 2
            while (n >= 2) {
                if (n % divisor == 0) {
                    factors.push(divisor);
                    n /= divisor;
                } else {
                    divisor++
                }
            }
            let factor_counts = factors.reduce((counts, factor) => {
                counts[factor] = (counts[factor] || 0) + 1;
                return counts;
            }, {})
            let formatted_factors = Object.entries(factor_counts)
                .sort((a, b) => a[0] - b[0])
                .map(([p, c]) => (c > 1 ? `${p}^${c}` : `${p}`))
            return new String(`${N} = ` + formatted_factors.join(" × "))
        },
        schema: [1],
        vars: ["n"],
        types: [TN]
    },
    "to": {
        name: "Convert units",
        func: (n, u1, u2) => {
            if (u1 instanceof Operation) {
                u1 = u1.op
            }
            if (u2 instanceof Operation) {
                u2 = u2.op
            }
            if (u1 in FROM_UNITS && u2 in FROM_UNITS) {
                if (typeof FROM_UNITS[u1] === "number" && typeof FROM_UNITS[u2] === "number") {
                    return n * FROM_UNITS[u1] * TO_UNITS[u2]
                } else if (typeof FROM_UNITS[u1] === "object" && typeof FROM_UNITS[u2] === "object") {
                    return FROM_UNITS[u2].to(FROM_UNITS[u1].from(n))
                }
            }
            return "Invalid units"
        },
        schema: [-2, -1, 1],
        vars: ["n", "u1", "u2"],
        types: [TN, TU, TU],
        example: "Tip: See all supported units by typing `units`\nExamples:\n  1. `5 km to mi -> 3.10686`\n  2. `C = cel; F = far; 30 C to F -> 86`\n"
    },
    "to2":  {
        name: "Convert units",
        func: (u1, u2) => {
            n = 1
            if (u1 instanceof Operation) {
                u1 = u1.op
            }
            if (u2 instanceof Operation) {
                u2 = u2.op
            }
            if (u1 in FROM_UNITS && u2 in FROM_UNITS) {
                if (typeof FROM_UNITS[u1] === "number" && typeof FROM_UNITS[u2] === "number") {
                    return n * FROM_UNITS[u1] * TO_UNITS[u2]
                } else if (typeof FROM_UNITS[u1] === "object" && typeof FROM_UNITS[u2] === "object") {
                    return FROM_UNITS[u2].to(FROM_UNITS[u1].from(n))
                }
            }
            return "Invalid units"
        },
        schema: [-1, 1],
        vars: ["u1", "u2"],
        types: [TU, TU]
    },
    "units": {
        name: "List of supported units",
        func: () => {
            return [["km", "meter", "cm", "mm", "um", "nm", "mi", "ft", "in", "au", "ly"], ["kg", "gram", "mg", "lb", "oz"], ["se", "ms", "mn", "hr", "day", "wk", "yr"], ["joule", "kjoule", "cal", "kcal", "ev"], ["byte", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"], ["m3", "cm3", "liter" , "ml", "gal", "ft3"], ["kel", "cel", "far"]]
        },
        schema: [],
        vars: [],
        types: []
    },
    "==": {
        name: "Equal",
        func: (a, b) => {
            if (Array.isArray(a) && Array.isArray(b)) {
                return tensors_equal(a, b)
            }
            return a === b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "!=": {
        name: "Not equal",
        func: (a, b) => {
            return a !== b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "true": {
        name: "True",
        func: () => true,
        schema: [],
        vars: [],
        types: []
    },
    "false": {
        name: "False",
        func: () => false,
        schema: [],
        vars: [],
        types: []
    },
    "eval_if": {
        name: "Evaluate if statement",
        func: (if_st, calc) => eval_if(if_st, calc),
        schema: [1],
        vars: [],
        types: [TI],
        calc: true,
    },
    "<": {
        name: "Less than",
        func: (a, b) => {
            return a < b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "<=": {
        name: "Less than or equal",
        func: (a, b) => {
            return a <= b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    ">": {
        name: "Greater than",
        func: (a, b) => {
            return a > b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    ">=": {
        name: "Greater than or equal",
        func: (a, b) => {
            return a >= b
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "and": {
        name: "And",
        func: (a, b) => {
            return a && b ? true : false
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "or": {
        name: "Or",
        func: (a, b) => {
            return a || b ? true : false
        },
        schema: [-1, 1],
        vars: ["a", "b"],
        types: [TA, TA]
    },
    "not": {
        name: "Not",
        func: (x) => {
            return !x ? true : false
        },
        schema: [1],
        vars: ["x"],
        types: [TA]
    },
    "diff": {
        name: "Differentiation",
        func: (f, calc) => {
            if (f instanceof Operation) {
                f = f.op
            }
            const tokens = calc.functions[f].value
            const new_tokens = []
            for (let i = 0; i < tokens.length; i++) {
                let added = false
                if (typeof tokens[i] === "string") {
                    if (tokens[i].startsWith("(")) {
                        new_tokens.push("(")
                        added = true
                    }
                    if (tokens[i].startsWith(")")) {
                        new_tokens.push(")")
                        added = true
                    }
                }
                if (!added) {
                    new_tokens.push(tokens[i])
                }
            }
            const x = calc.functions[f].parameters[0]
            const symbols = ["+", "-", "*", "/", "^", "(", ")", "sin", "cos", "ln", "tan", "cot", "csc", "sec"]
            for (let i = 0; i < new_tokens.length - 1; i++) {
                if (!symbols.includes(new_tokens[i]) && !symbols.includes(new_tokens[i + 1])) {
                    new_tokens.splice(i + 1, 0, "*")
                } 
                if (!symbols.includes(new_tokens[i]) && tokens[i + 1] === "(") {
                    new_tokens.splice(i + 1, 0, "*")
                }
                if (!symbols.includes(new_tokens[i]) && ["sin", "cos", "ln", "tan", "cot", "csc", "sec"].includes(new_tokens[i + 1])) {
                    new_tokens.splice(i + 1, 0, "*")
                }
            }
            for (let i = 0; i < new_tokens.length; i++) {
                if (new_tokens[i] instanceof Fraction || new_tokens[i] instanceof BaseNumber || new_tokens[i] instanceof Constant) {
                    new_tokens[i] = new_tokens[i].value()
                }
                if (!symbols.includes(new_tokens[i]) && new_tokens[i] !== x && typeof new_tokens[i] !== "number") {
                    return `'${new_tokens[i]}' is not supported`
                }
            }
            // console.log("diff tokens", new_tokens)
            const expressionTree = diff_tree(new_tokens)
            let derivative = differentiate(expressionTree, x)
            output = tree_to_string(diff_natural_simplify(derivative))
            if (f.startsWith("@")) {
                f = "f"
            }
            calc.calculate(`${f}'(${x}) = ${output}`)
            return new String(`\`${f}'(${x}) = ${output}\`\nDerivative \`${f}'\` declared`)
        },
        schema: [1],
        vars: ["f"],
        types: [TF],
        calc: true
    }, 
    "flat": {
        name: "Flatten list",
        func: (a) => flatten(a),
        schema: [1],
        vars: ["a"],
        types: [TL(TA)],
        example: "Example: \`flat([[[1]], [2], 3]) -> [1, 2, 3]\`"
    }
}
for (let i = 0; i < UNITS.length; i++) {
    OPERATIONS[UNITS[i]] = {
        name: UNIT_NAMES[UNITS[i]],
        func: () => "Must be used with `to`",
        schema: [],
        vars: [],
        types: []
    }
}

const HELP = {
    "@": {
        name: "Lambda function",
        schema: [1],
        vars: ["(...params) = value"],
        types: [TF],
        example: "Examples:\n  1. \`@(x) = x^2\`\n  2. \`@(x, y) = x + y\`\n  3. \`@() = 1\`"
    },
    "clear": {
        name: "Clear",
        schema: [1],
        vars: ["N"],
        types: [TO(TN)],
    },
    "help": {
        name: "Help",
        schema: [1],
        vars: ["func"],
        types: [TF]
    },
    "ans": {
        name: "Answer",
        schema: [],
        vars: [],
        types: []
    },
    "save": {
        name: "Save",
        schema: [1],
        vars: ["x"],
        types: ["variable | function"]
    },
    "if": {
        name: "If statement",
        schema: [],
        vars: [],
        types: [],
        example: "Examples:\n  1. \`if x > 10 then 10 else x\` \n  2. \`if x == 20 then 2 else if x == 10 then 1 else 0\`"
    },
    "then": {
        name: "If statement",
        schema: [],
        vars: [],
        types: [],
        example: "Examples:\n  1. \`if x > 10 then 10 else x\` \n  2. \`if x == 20 then 2 else if x == 10 then 1 else 0\`"
    },
    "else": {
        name: "If statement",
        schema: [],
        vars: [],
        types: [],
        example: "Examples:\n  1. \`if x > 10 then 10 else x\` \n  2. \`if x == 20 then 2 else if x == 10 then 1 else 0\`"
    },
    "trace": {
        name: "Debug trace",
        schema: [1],
        vars: ["x"],
        types: ["expression"],
    },
    "def": {
        name: "View function definition",
        schema: [1],
        vars: ["func"],
        types: [TF]
    },
    "plot": {
        name: "Plot",
        schema: [1],
        vars: ["x"],
        types: [TO("expression")]
    }
}

// Determine if string is name of math function 
// Math function - in OPERATIONS but not a symbol
function isMathFunction(e) {
    return typeof e === "string" && e in OPERATIONS && !SYMBOLS.includes(e)
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
 
class Paren {
    constructor(tokens) {
        this.tokens = tokens
    }
}

class Fraction {
    constructor(n, d) {
        this.neg = false
        this.invalid = false
        if (typeof n === "number" && typeof d === "number") {
            if (n === 0 && d === 0) {
                this.invalid = "0/0"
                return
            }
            if (d === 0) {
                this.invalid = "/0"
                this.n = n
                this.d = d
                return
            }
            this.neg = (n < 0) ^ (d < 0)
            let my_gcd = gcd(Math.abs(n), Math.abs(d))
            this.n = Math.abs(n) / my_gcd
            this.d = Math.abs(d) / my_gcd
        } else {
            this.n = n
            this.d = d
            if (typeof n == "number" && this.n < 0) {
                this.n = Math.abs(n)
                this.neg = true
            }
            if (typeof d == "number" && this.d < 0) {
                this.d = Math.abs(d)
                this.neg = true
            }
        }
    }

    toString() {
        if (this.n === 0) {
            return n
        }
        if (this.d === 1) {
            return `${this.neg ? "-" : ""}${this.n}`
        }
        return `${this.neg ? "-" : ""}${this.n}/${this.d}`
    }

    value() {
        let n = this.n instanceof Constant ? this.n.value() : this.n
        let d = this.d instanceof Constant ? this.d.value() : this.d
        return n / d * (this.neg ? -1 : 1)
    }
}

class BaseNumber {
    constructor(b) {
        this.b = b
    }

    toString() {
        return `${this.b}`
    }

    value() {
        return convert_to_decimal(this.b)
    }
}

class Constant {
    constructor(c) {
        this.c = c
    }

    toString() {
        return `${this.c}`
    }

    value() {
        return OPERATIONS[this.c].func()
    }
}

function get_param_types(params) {
    const type_list = []
    // console.log("get_param_types", params)
    for (const p of params) {
        if (typeof p === "number" || p instanceof Fraction || p instanceof Constant || p instanceof BaseNumber) {
            type_list.push(TN)
        } else if (typeof p === "boolean" || ["true", "false"].includes(p)) {
            type_list.push(TB)
        } else if (p instanceof String) {
            type_list.push(TS)
        } else if (Array.isArray(p)) {
            if (p.length === 0) {
                type_list.push(TL(TA))
            } else {
                const types = p.map((t) => get_param_types([t])[0])
                if (types.every((t) => t === types[0])) {
                    type_list.push(TL(types[0]))
                } else {
                    type_list.push(TL(TA))
                }
            }
        } else if (p instanceof Operation) {
            if (p.op in UNIT_NAMES) {
                type_list.push(TU)
            } else {
                type_list.push(TF)
            }
        } else if (p in UNIT_NAMES) {
            type_list.push(TU)
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
        if (ct === TA) {
            valid++
            continue
        }
        // OR
        if (ct.includes("|")) {
            ct = ct.split("|").map((e) => e.trim())
            for (const t of ct) {
                if (check_param_types([pt], [t])) {
                    valid++
                    break
                }
            }
        } else if (ct.startsWith("optional")) {
            const open = ct.indexOf("[")
            const close = ct.lastIndexOf("]")
            if (pt === null || pt === ct.slice(open + 1, close)) {
                valid++
            }
        } else if (ct === TL(TA)) {
            if (pt.startsWith("list[")) {
                valid++
            }
        } else if (ct === TL(TL(TA))) {
            if (pt.startsWith("list[list[")) {
                valid++
            }
        } else {
            if (pt === ct) {
                valid++
            }
        }
    }
    return valid === correct_types.length
}

function parseCoefficient(coefficient) {
    if (coefficient === "" || coefficient === "+") return 1
    if (coefficient === "-") return -1
    return parseFloat(coefficient) || 0
}

function is_multipliable(token) {
    let param_type = get_param_types([token])
    return param_type == TN || param_type == TL(TN) || param_type == TL(TL(TN))
}