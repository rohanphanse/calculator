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
            a[i] = round(a[i], p)
        } else if (typeof a[i] === "object" && "op" in a[i]) {
            a[i] = a[i].op
        } else if (Array.isArray(a[i])) {
            a[i] = roundArray(a[i], p)
        } 
    }
    return a
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