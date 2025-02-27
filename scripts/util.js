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
        } else if (typeof a[i] === "object" && "op" in a[i]) {
            a[i] = a[i].op
        } else if (Array.isArray(a[i])) {
            a[i] = roundArray(a[i], p)
        } 
    }
    return a
}

function set_precision(value, p) {
    if (value === 0) return 0
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
    let value = 1
    for (let i = 2; i <= n; i++) {
        value *= i
    }
    return value
}

function gcd(a, b) {
    while (b !== 0) {
        const temp = b
        b = a % b
        a = temp
    }
    return a
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
                end = I[0][1]
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
        return calc.calculate(if_st, { noAns: true, noRound: true })
    }
    const value = calc.calculate(if_st.cond, { noAns: true })
    if (value) {
        return eval_if(if_st.then, calc)
    } else {
        return eval_if(if_st.else, calc)
    }
}
