// Utility functions

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

// Mean
function mean(nums) {
    return nums.reduce((a, b) => a + b) / nums.length
}

// Round
function round(n, p = 0) {
    return Math.round(n * 10 ** p) / (10 ** p)
}

function roundArray(a, p = 0) {
    for (let i = 0; i < a.length; i++) {
        if (typeof a[i] === "number") {
            a[i] = set_precision(a[i], p)
        } else if (typeof a[i] === "object" && !(a[i] instanceof String)) {
            if ("op" in a[i]) {
                a[i] = a[i].op
            } else if ("n" in a[i]) {
                a[i] = `${a[i].n}/${a[i].d}`
            } else if ("c" in a[i]) {
                a[i] = `${a[i].c}`
            }
        } else if (Array.isArray(a[i])) {
            a[i] = roundArray(a[i], p)
        } 
    }
    return a
}

function set_precision(value, p) {
    if (value === 0 || !value.toString().includes(".")) return value
    return parseFloat(value.toPrecision(p))
}

function solve_quadratic(a, b, c) {
    const d = b**2 - 4*a*c
    if (d < 0) {
        return []
    } else if (d === 0) {
        return [-b / (2*a)]
    } else {
        return [(-b + Math.sqrt(d)) / (2*a), (-b - Math.sqrt(d)) / (2*a)] 
    }
}

// Credit to Alexander Shtuchkin: https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically
function solve_cubic(a, b, c, d) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Degenerate case
                return [];
            return [-b/a];
        }

        var D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    var p = (3*a*c - b*b)/(3*a*a);
    var q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    var roots;

    if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
        roots = [Math.cbrt(-q)];
    } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
        roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
        var D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
            roots = [-1.5*q/p, 3*q/p];
        } else if (D > 0) {             // Only one real root
            var u = Math.cbrt(-q/2 - Math.sqrt(D));
            roots = [u - p/(3*u)];
        } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
            var u = 2*Math.sqrt(-p/3);
            var t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
            var k = 2*Math.PI/3;
            roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
        }
    }

    // Convert back from depressed cubic
    for (var i = 0; i < roots.length; i++)
        roots[i] -= b/(3*a);

    return roots;
}

function isInt32(n) {
    return n >= -2147483648 && n <= 2147483647
}

// Credit for following functions: Google Generative AI

function rref(m) {
    m = m.map(row => [...row]) // Copy matrix
    const R = m.length
    const C = m[0].length
    let lead = 0
    for (let r = 0; r < R; r++) {
        if (lead >= C) {
            return m
        }
        let i = r
        while (Math.abs(m[i][lead]) < 1e-10) {
            i++;
            if (i === R) {
                i = r
                lead++
                if (lead === C) {
                    return m
                }
            }
        }
        [m[r], m[i]] = [m[i], m[r]]
        let div = m[r][lead]
        for (let j = 0; j < C; j++) {
            m[r][j] /= div
        }
        for (let i = 0; i < R; i++) {
            if (i !== r) {
                let mult = m[i][lead];
                for (let j = 0; j < C; j++) {
                    m[i][j] -= mult * m[r][j]
                }
            }
        }
        lead++
    }
    return m
}

function det(m) {
    const L = m.length
    if (L === 1) {
      return m[0][0]
    }
    if (L === 2) {
      return m[0][0] * m[1][1] - m[0][1] * m[1][0]
    }
    let _det = 0
    for (let i = 0; i < L; i++) {
      const submatrix = m.slice(1).map(row => row.filter((_, j) => j !== i))
      _det += m[0][i] * Math.pow(-1, i) * det(submatrix)
    }
    return _det
}

function add_tensors(a1, a2, s2 = 1, s1 = 1) {
    if (!Array.isArray(a1) || !Array.isArray(a2)) {
        return "Invalid types"
    }
    if (a1.length !== a2.length) {
        return "Tensors must have same dimensions"
    }
    const result = []
    for (let i = 0; i < a1.length; i++) {
        if (Array.isArray(a1[i]) && Array.isArray(a2[i])) {
        result.push(add_tensors(a1[i], a2[i], s2, s1))
        } else if (typeof a1[i] === "number" && typeof a2[i] === "number"){
            result.push(a1[i] * s1 + a2[i] * s2)
        } else {
            return "Invalid types"
        }
    }
    return result
}

function tensor_add_scalar(a1, s, c = 1) {
    const result = []
    for (let i = 0; i < a1.length; i++) {
        if (Array.isArray(a1[i])) {
            result.push(tensor_add_scalar(a1[i], s, c))
        } else if (typeof a1[i] === "number"){
            result.push(c * a1[i] + s)
        } else {
            return "Invalid types"
        }
    }
    return result
}

function tensors_equal(a1, a2) {
    if (!Array.isArray(a1) || !Array.isArray(a2)) {
        return false
    }
    if (a1.length !== a2.length) {
        return false
    }
    for (let i = 0; i < a1.length; i++) {
        if (Array.isArray(a1[i]) && Array.isArray(a2[i])) {
            if (!tensors_equal(a1[i], a2[i])) {
                return false
            }
        } else if (typeof a1[i] === "number" && typeof a2[i] === "number") {
            if (a1[i] !== a2[i]) {
                return false
            }
        } else {
            return false
        }
    }
    return true
}

function create_zero_tensor(dims) {
    if (dims.length === 0) {
      return 0
    }
    const size = dims[0]
    const rest = dims.slice(1)
    const tensor = []
    for (let i = 0; i < size; i++) {
      tensor.push(create_zero_tensor(rest));
    }
    return tensor
}

function inverse(m) {
    const R = m.length
    const C = m[0].length
    if (R !== C) {
        return "Expected square matrix"
    }
    const aug = m.map((row, i) => [...row, ...Array.from({ length: R }, (_, j) => (i === j ? 1 : 0))])
    const rref_aug = rref(aug)
    const inv = rref_aug.map(row => row.slice(C))
    for (let i = 0; i < R; i++) {
        for (let j = 0; j < C; j++) {
            const e = (i === j) ? 1 : 0;
            if (Math.abs(rref_aug[i][j] - e) > 1e-10) {
                return "Not invertible"
            }
        }
    }
    return inv
}

function matmul(A, B) {
    const RA = A.length
    const CA = A[0].length
    const RB = B.length;
    const CB = B[0].length
    if (RB !== CA) {
        return "Incompatible dimensions."
    }
    const result = Array(RA).fill(null).map(() => Array(CB).fill(0))
    for (let i = 0; i < RA; i++) {
        for (let j = 0; j < CB; j++) {
            for (let k = 0; k < CA; k++) {
                result[i][j] += A[i][k] * B[k][j]
            }
        }
    }
    return result
}

function matmul_scalar(A, s) {
    const result = []
    for (let i = 0; i < A.length; i++) {
        result.push([])
        for (let j = 0; j < A[0].length; j++) {
            result[i].push(A[i][j] * s)
        }
    }
    return result
}

function factorial(n) {
    if (n > 200) {
        return Infinity
    }
    let value = 1
    for (let i = 2; i <= n; i++) {
        value *= i
    }
    return value
}

function is_close(a, b, tol = 1e-9) {
    return Math.abs(a - b) <= tol
}

function is_close_to_int(a, tol = 1e-9) {
    const rounded = Math.round(a);
    return Math.abs(a - rounded) <= tol;
}

function gcd(a, b) {
    while (b !== 0) {
        const temp = b
        b = a % b
        a = temp
    }
    return a
}

function lcm(a, b) {
    return a * b / gcd(a, b)
}

function process_index(A, I) {
    if (!Array.isArray(A) && I.length > 0) {
        return "Invalid indices"
    }
    if (I.length === 0) {
        return A
    }
    if (Array.isArray(I[0]) && I[0].length === 2) {
        if (typeof I[0][0] === "number" && typeof I[0][1] === "number") { 
            let start = 0
            let end = A.length
            if (I[0][0] != -1) {
                start = I[0][0] - 1
            }
            if (I[0][1] != -1) {
                end = Math.min(A.length, I[0][1])
            }
            let result = []
            for (let r = start; r < end; r++) {
                let ret = process_index(A[r], I.slice(1))
                if (typeof ret === "string") {
                    return ret
                }
                result.push(ret)
            }
            return result
        }
    } else if (!Array.isArray(I[0])) {
        if (I[0] instanceof Operation && I[0].op === ":") {
            let result = []
            for (const row of A) {
                let ret = process_index(row, I.slice(1))
                if (typeof ret === "string") {
                    return ret
                }
                result.push(ret)
            }
            return result
        } else if (typeof I[0] === "number") {
            return process_index(A[I[0] - 1], I.slice(1))
        }
    }
    return "Invalid indices"
}

function parse_if(str) {
    const tokens = str.match(/\bif\b|\bthen\b|\belse\b|[^\s]+/g)
    let index = 0
    function parse_if_expr() {
        if (tokens[index] === "if") {
            index++
            let condition = []
            while (tokens[index] !== "then") {
                condition.push(tokens[index++])
            }
            index++
            let then_branch = parse_if_expr()
            let else_branch = null
            if (tokens[index] === "else") {
                index++
                else_branch = parse_if_expr()
            }
            return { cond: condition.join(" "), then: then_branch, else: else_branch }
        } else {
            let expr = []
            while (index < tokens.length && !["if", "then", "else"].includes(tokens[index])) {
                expr.push(tokens[index++])
            }
            return expr.join(" ")
        }
    }
    return parse_if_expr()
}

function eval_if(if_st, calc) {
    if (typeof if_st === "string") {
        return calc.calculate(if_st, { noAns: true, noRound: true, get_result: true, keep_debug: true })
    }
    const value = calc.calculate(if_st.cond, { noAns: true, get_result: true, keep_debug: true })
    if (value) {
        return eval_if(if_st.then, calc)
    } else {
        return eval_if(if_st.else, calc)
    }
}

function add_fractions(f1, f2) {
    let v = [f1.n, f1.d, f2.n, f2.d]
    let no_frac = false
    for (let i = 0; i < 4; i++) {
        if (v[i] instanceof Constant) {
            v[i] = v[i].value()
            no_frac = true
        }
    }
    if (no_frac) {
        return v[0] / v[1] + v[2] / v[3]
    }
    let d = lcm(v[1], v[3])
    let n = d / v[1] * v[0] + d / v[3] * v[2]
    return new Fraction(n, d)
}

function subtract_fractions(f1, f2) {
    let d = lcm(f1.d, f2.d)
    let n = d / f1.d * f1.n - d / f2.d * f2.n
    return new Fraction(n, d)
}

// Credit to Claude for differentiation code
function differentiate(node, variable) {
    // console.log("differentiate", node, variable)
    if (!node) return null
    if (typeof node.value === "number") {
        return { value: 0 }
    }
    if (typeof node.value === "string") {
        if (node.value === variable) {
            return { value: 1 }
        }
        return { value: 0 }
    }
    switch (node.op) {
        case "+":
        case "-":
            return {
                op: node.op,
                left: differentiate(node.left, variable),
                right: differentiate(node.right, variable)
            }
        case "*":
            return {
                op: "+",
                left: { op: "*", left: differentiate(node.left, variable), right: node.right },
                right: { op: "*", left: node.left, right: differentiate(node.right, variable) }
            }
        case "/":
            return {
                op: "/",
                left: { op: "-", left: { op: "*", left: differentiate(node.left, variable), right: node.right },
                right: { op: "*", left: node.left, right: differentiate(node.right, variable) } }, right: { op: "^", left: node.right, right: { value: 2 } }
            }
        case "^":
            if (typeof node.left?.value === "string" && node.left.value === variable && typeof node.right?.value === "number") {
                const exponent = node.right.value
                return {
                    op: "*",
                    left: { value: exponent },
                    right: { op: "^", left: { value: variable }, right: { value: exponent - 1 } }
                }
            }
            else {
                if (typeof node.left?.value === "number" && typeof node.right?.value === "string" && node.right.value === variable) {
                    return {
                        op: "*",
                        left: { op: "*", left: { op: "ln", arg: node.left }, right: node },
                        right: differentiate(node.right, variable)
                    }
                }
                else {
                    return {
                        op: "*",
                        left: { op: "*", left: node.right, right: { op: "^", left: node.left, right: { op: "-",  left: node.right, right: { value: 1 } } } },
                        right: differentiate(node.left, variable)
                    }
                }
            }
        case "sin":
            return {
                op: "*",
                left: { op: "cos", arg: node.arg },
                right: differentiate(node.arg, variable)
            }
        case "cos":
            return {
                op: "*",
                left: { op: "*", left: { value: -1 }, right: { op: "sin", arg: node.arg } },
                right: differentiate(node.arg, variable)
            }
        case "exp":
            return {
                op: "*",
                left: { op: "exp", arg: node.arg },
                right: differentiate(node.arg, variable)
            }
        case "ln":
            return {
                op: "*",
                left: { op: "/", left: { value: 1 }, right: node.arg },
                right: differentiate(node.arg, variable)
            }
        default:
            return { value: 0 }
    }
}

function diff_simplify(node) {
    // console.log("diff_simplify", node)
    if (!node) return null
    if (node.left) node.left = diff_simplify(node.left)
    if (node.right) node.right = diff_simplify(node.right)
    if (node.arg) node.arg = diff_simplify(node.arg)
    if ((node.op === "+" || node.op === "-") && is_zero(node.right)) {
        return node.left
    }
    if (node.op === "+" && is_zero(node.left)) {
        return node.right
    }
    if (node.op === "*") {
        if (is_zero(node.left) || is_zero(node.right)) {
            return { value: 0 }
        }
        if (is_one(node.left)) {
            return node.right
        }
        if (is_one(node.right)) {
            return node.left
        }
        if (typeof node.left?.value === "number" && typeof node.right?.value === "string") {
            return { type: "coefficient", coefficient: node.left.value, variable: node.right.value }
        }
    }
    if (node.op === "/" && is_one(node.right)) {
        return node.left
    }
    if (node.op === "^") {
        if (is_zero(node.right)) {
            return { value: 1 }
        }
        if (is_one(node.right)) {
            return node.left
        }
        if (is_zero(node.left)) {
            return { value: 0 }
        }
    }
    if (node.op && node.left && typeof node.left.value === "number" && node.right && typeof node.right.value === "number") {
        const a = node.left.value
        const b = node.right.value
        switch (node.op) {
            case "+": return { value: a + b }
            case "-": return { value: a - b }
            case "*": return { value: a * b }
            case "/": return { value: a / b }
            case "^": return { value: Math.pow(a, b) }
        }
    }
    if ((node.op === "+" || node.op === "-") && node.left?.type === "coefficient" && node.right?.type === "coefficient" && node.left.variable === node.right.variable) {
        const newCoefficient = node.op === "+" ? node.left.coefficient + node.right.coefficient : node.left.coefficient - node.right.coefficient
        return { type: "coefficient", coefficient: newCoefficient,variable: node.left.variable }
    }
    return node
}

function is_zero(node) {
    return node && typeof node.value === "number" && node.value === 0
}

function is_one(node) {
    return node && typeof node.value === "number" && node.value === 1
}

function diff_tree(tokens) {
    // console.log("diff_tree", tokens)
    let index = 0
    function parse_expr() {
        let node = parse_term()
        while (index < tokens.length && ["+", "-"].includes(tokens[index])) {
            const op = tokens[index]
            index++
            node = { op: op, left: node, right: parse_term() }
        }
        return node
    }
    function parse_term() {
        let node = parse_power()
        while (index < tokens.length && (tokens[index] === "*" || tokens[index] === "/")) {
            const op = tokens[index]
            index++
            node = { op: op, left: node, right: parse_power() }
        }
        if (typeof node?.value === "number" && index < tokens.length && typeof tokens[index] === "string" && /^[a-zA-Z]$/.test(tokens[index])) {
            const variable = { value: tokens[index] }
            index++
            return { op: "*", left: node, right: variable }
        }
        return node
    }
    function parse_power() {
        let base = parse_factor()
        if (index < tokens.length && tokens[index] === "^") {
            index++
            if (base && typeof base.value === "string" && base.value === "e") {
                const exponent = parse_factor()
                return { op: "exp", arg: exponent }
            } else {
                const exponent = parse_factor()
                return { op: "^", left: base, right: exponent }
            }
        }
        return base
    }
    function parse_factor() {
        if (index >= tokens.length) return null
        const token = tokens[index]
        if (typeof token === "number") {
            index++
            return { value: token }
        }
        else if (typeof token === "string" && /^[a-zA-Z]$/.test(token)) {
            index++
            return { value: token }
        }
        else if (token.startsWith("(")) {
            index++
            const expr = parse_expr()
            if (tokens[index].startsWith(")")) {
                index++
            }
            return expr
        }
        else if (["sin", "cos", "ln"].includes(token)) {
            index++
            if (tokens[index].startsWith("(")) {
                index++
                const arg = parse_expr()
                if (tokens[index].startsWith(")")) {
                    index++
                }
                return { op: token, arg: arg }
            }
        }
        return null
    }
    return parse_expr()
}

function diff_natural_simplify(node) {
    // console.log("diff_natural_simplify", node)
    node = diff_simplify(node);
    if (node.op === "*" && typeof node.left?.value === "number" && typeof node.right?.value === "string") {
        return { type: "coefficient", coefficient: node.left.value, variable: node.right.value }
    }
    if (node.left) node.left = diff_natural_simplify(node.left)
    if (node.right) node.right = diff_natural_simplify(node.right)
    if (node.arg) node.arg = diff_natural_simplify(node.arg)
    if (node.op === "-" && node.right && node.right.op === "-") {
        return node.right.right
    }
    if ((node.op === "sin" || node.op === "cos") && node.arg && node.arg.op === "-") {
        return {
            op: node.op,
            arg: {
                op: "negate",
                arg: node.arg.right
            }
        }
    }
    if (node.op === "*" && node.right && node.right.op === "sin" && 
        node.left && node.left.op === "cos" && 
        node.left.arg && node.left.arg.op === "negate") {
        return {
            op: "*",
            left: node.left,
            right: node.right
        }
    }
    if (node.op === "*" && is_negative_one(node.left)) {
        return {
            op: "negate",
            arg: node.right
        }
    }
    if (node.op === "*" && is_negative_one(node.right)) {
        return {
            op: "negate",
            arg: node.left
        }
    }
    return node
}

function is_negative_one(node) {
    return node && typeof node.value === "number" && node.value === -1
}

function tree_to_string(node) {
    // console.log("tree_to_string", node)
    if (!node) return ""
    if (node.op === "negate") {
        const argStr = tree_to_string(node.arg)
        if (node.arg.op === "+" || node.arg.op === "-") {
            return `-(${argStr})`
        } else {
            return `-${argStr}`
        }
    }
    if (node.type === "coefficient") {
        if (node.coefficient === 1) {
            return node.variable
        } else if (node.coefficient === -1) {
            return `-${node.variable}`
        } else {
            return `${node.coefficient}${node.variable}`
        }
    }
    if (typeof node.value !== "undefined") {
        return node.value.toString()
    }
    let leftStr, rightStr, argStr
    switch (node.op) {
        case "+":
            leftStr = tree_to_string(node.left)
            rightStr = tree_to_string(node.right)
            if (rightStr.startsWith("-")) {
                return `${leftStr} - ${rightStr.substring(1)}`
            }
            return `${leftStr} + ${rightStr}`
        case "-":
            leftStr = tree_to_string(node.left)
            rightStr = tree_to_string(node.right)
            return `${leftStr}${leftStr.length > 0 ? " " : ""}-${leftStr.length > 0 ? " " : ""}${rightStr}`
        case "*":
            leftStr = tree_to_string(node.left)
            rightStr = tree_to_string(node.right)
            if (typeof node.left?.value === "number") {
                const value = node.left.value
                if (value === 1) {
                    return rightStr
                }
                if (value === -1) {
                    if (node.right.op === "+" || node.right.op === "-") {
                        return `-(${rightStr})`
                    } else {
                        return `-${rightStr}`
                    }
                }
                if (typeof node.right?.value === "string") {
                    return `${leftStr}${rightStr}`
                }
            }
            if (node.left?.op === "+" || node.left?.op === "-") {
                leftStr = `(${leftStr})`
            }
            if (node.right?.op === "+" || node.right?.op === "-") {
                rightStr = `(${rightStr})`
            }
            
            return `${leftStr} * ${rightStr}`
        case "/":
            leftStr = tree_to_string(node.left)
            rightStr = tree_to_string(node.right)
            if (node.left?.op) {
                leftStr = `(${leftStr})`
            }
            if (node.right?.op) {
                rightStr = `(${rightStr})`
            }
            return `${leftStr} / ${rightStr}`
        case "^":
            leftStr = tree_to_string(node.left)
            rightStr = tree_to_string(node.right)
            if (node.left?.op) {
                leftStr = `(${leftStr})`
            }
            return `${leftStr}^${rightStr}`
        case "sin":
        case "cos":
        case "exp":
        case "ln":
            argStr = tree_to_string(node.arg)
            if (node.arg?.op === "negate") {
                const innerArg = tree_to_string(node.arg.arg)
                return `${node.op}(-${innerArg})`
            } else if (argStr.startsWith("- ")) {
                return `${node.op}(-${argStr.substring(2)})`
            }
            return `${node.op}(${argStr})`
        default:
            return ""
    }
}
// Syntax highlight code generated with help from LLMs
function highlightSyntax(element) {
    const cursor_position = getCursorPosition(element)
    let text = element.innerHTML
    text = text.replace(/<span class="highlight-(?:number|word|keyword)">([^<]*)<\/span>/g, "$1")
    const keywords = ["if","then","else","def","save","help","clear","trace","to"]
    let lines = text.split("\n")
    let processed_lines = lines.map(line => {
        if (line.trim() === "") return line
        line = line.replace(
            /(^|\s|>|\(|\[|,|[-+*/%^=()])(-?(?:\d+\.?\d*|\.\d+))([a-zA-Z_][a-zA-Z0-9_]*)(?=\W|\]|,|\)|$|[-+*/%^=()])/g,
            (match, prefix, number, word) => {
                if (prefix.match(/[a-zA-Z_]$/)) return match
                return `${prefix}<span class="highlight-number">${number}</span><span class="highlight-word">${word}</span>`
            }
        )
        line = line.replace(
            /(^|\s|>|\(|\[|,|[-+*/%^=()])(0x|0b|0o)(?![0-9a-zA-Z])(?!\w)/g,
            (match, prefix, prefixNum) => {
                if (prefix.match(/[a-zA-Z_]$/)) return match
                return `${prefix}<span class="highlight-number">${prefixNum}</span>`
            }
        )
        line = line.replace(
            /(^|\s|>|\(|\[|,|[-+*/%^=()])(-?(?:0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*|\.\d+)(?!\w))/g,
            (match, prefix, number) => {
                if (prefix.match(/[a-zA-Z_]$/)) return match
                return `${prefix}<span class="highlight-number">${number}</span>`
            }
        )
        keywords.forEach(keyword => {
            const regex = new RegExp(`(^|\\s|>|\\()${keyword}(?=$|\\s|\\W|\\)|>)`, "g")
            line = line.replace(regex, (match, prefix) => {
                if (prefix === ">" || line.includes(`<${keyword}`)) return match
                return `${prefix}<span class="highlight-keyword">${keyword}</span>`
            })
        })
        line = line.replace(
            /(^|\s|>|\(|\[|,|[-+*/%^=:()])([a-zA-Z_][a-zA-Z0-9_]*)(?![^<]*>)/g,
            (match, prefix, word) => {
                if (keywords.includes(word)) return match
                return `${prefix}<span class="highlight-word">${word}</span>`
            }
        )
        return line
    })
    text = processed_lines.join("\n")
    if (element.innerHTML !== text) {
        element.innerHTML = text
        setCursorPosition(element, cursor_position)
    }
}


function getCursorPosition(element, start_node = null, start_offset = null) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0
    const range = selection.getRangeAt(0)
    const new_range = range.cloneRange()
    new_range.selectNodeContents(element)
    if (start_node && start_offset !== null) {
        new_range.setEnd(start_node, start_offset)
    } else {
        new_range.setEnd(range.endContainer, range.endOffset)
    }
    return new_range.toString().length
}
  
function setCursorPosition(element, position) {
    if (!document.contains(element)) return
    const node_info = find_node_and_offset_position(element, position)
    if (!node_info) return
    const { node, offset } = node_info
    const range = document.createRange()
    range.setStart(node, offset)
    range.collapse(true)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}
  
function find_node_and_offset_position(root_node, target_position) {
    let current_position = 0
    function find_position(node) {
        if (node.nodeType === Node.TEXT_NODE) {
        const node_length = node.nodeValue.length
        if (current_position <= target_position && target_position <= current_position + node_length) {
            return {
            node: node,
            offset: target_position - current_position
            }
        }
        current_position += node_length
        } 
        else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const result = find_position(node.childNodes[i])
            if (result) return result
        }
        }
        return null
    }
    return find_position(root_node)
}

