let calcContainer

document.addEventListener("DOMContentLoaded", () => {
    // Calculator
    calculator = new Calculator()

    // Data
    let history = []
    let history_index = -1
    let history_current = ""
    let display_mode = localStorage.getItem("display_mode") || "default"
    let last_output = null
    let graph_id = 1
    let graphs = []
    let search_index = -1
    let search_matches = []

    // Elements
    const interface = document.getElementById("interface")
    let userInput = document.getElementsByClassName("input")[0]
    let userInputAutocomplete = document.getElementsByClassName("input-autocomplete")[0]
    const angleButton = document.getElementById("angle-button")
    const digitsInput = document.getElementById("digits-input")
    const displayButton = document.getElementById("display-button")
    const themeButton = document.getElementById("theme-button")
    const commandButtons = document.getElementsByClassName("command")
    const userBar = document.getElementById("user-bar")
    const varBar = document.getElementById("var-bar")
    calcContainer = document.getElementById("container")
    const sideBar = document.getElementById("side-bar")
    const sideBarMain = document.getElementById("side-bar-main")
    const sideBarButton = document.getElementById("side-bar-button")
    const sideBarInput = document.getElementById("side-bar-input")
    const sideBarInputTag = document.getElementById("side-bar-input-tag")
    const molarMassToggle = document.getElementById("molar-mass-toggle")
    const molarMassList = document.getElementById("molar-mass-list")
    const specialCharToggle = document.getElementById("special-char-toggle")
    const specialCharList = document.getElementById("special-char-list")

 
    // States
    let UPDATE_DIGITS = false
    let DRAGGING = false
    let SIDE_BAR = localStorage.getItem("side_bar") || "yes"
    if (SIDE_BAR === "yes") {
        document.documentElement.classList.add("disable-transitions")
        sideBar.style.right = "0px"
        void document.documentElement.offsetWidth
        setTimeout(() => {
            document.documentElement.classList.remove("disable-transitions")
        }, 0)
    }
    let molar_mass_expanded = false
    let special_char_expanded = false
    let theme = localStorage.getItem("theme") || "light"
    if (theme === "dark") {
        document.documentElement.classList.add("disable-transitions")
        document.documentElement.classList.toggle("dark")
        void document.documentElement.offsetWidth
        setTimeout(() => {
            document.documentElement.classList.remove("disable-transitions")
        }, 0)
    }
    for (const codeBlock of sideBar.getElementsByTagName("pre")) {
        highlightSyntax(codeBlock, true, true)
    }

    // Initial
    // User input event listeners
    userInput.addEventListener("keydown", handleKeyDown)
    userInput.addEventListener("input", ansAutoFill)
    userInputAutocomplete.addEventListener("click", handleAutocompleteClick)

    // Add searchable metadata to command buttons
    for (const cmd of commandButtons) {
        if (cmd.getAttribute("data-text")) {
            const op = cmd.getAttribute("data-text").replace("(|)", "")
            if (op in OPERATIONS) {
                cmd.dataset.name = OPERATIONS[op].name
            } else if (op in HELP) {
                cmd.dataset.name = HELP[op].name
            }
        }
    }

    // Angle button
    angleButton.addEventListener("click", event => {
        calculator.angle = calculator.angle === "rad" ? "deg" : "rad"
        angleButton.innerText = calculator.angle
    })
    displayButton.addEventListener("click", (event) => {
        if (!calcContainer.classList.contains("transition-enabled")) {
            calcContainer.classList.add("transition-enabled")
        }
        display_mode = localStorage.getItem("display_mode") || "default"
        if (display_mode === "wide") {
            calcContainer.style.width = "max(350px, 50vh)"
            localStorage.setItem("display_mode", "default")
        } else {
            calcContainer.style.width = "max(350px, 50vw)"
            localStorage.setItem("display_mode", "wide")
        }
    })

    enableDragToScroll(userBar)
    enableDragToScroll(varBar)
    
    // Digits input
    digitsInput.addEventListener("input", event => {
        UPDATE_DIGITS = true
        const e = event.target.value
        if (!isNaN(e)) {
            if (+e > 12) {
                calculator.digits = 12
            } else if (+e < 1) {
                calculator.digits = 1
            } else {
                calculator.digits = Math.round(+e)
            }
        }
    })

    themeButton.addEventListener("click", () => {
        document.documentElement.classList.add("disable-transitions")
        document.documentElement.classList.toggle("dark")
        void document.documentElement.offsetWidth
        setTimeout(() => {
            document.documentElement.classList.remove("disable-transitions")
        }, 0)
        theme = theme === "light" ? "dark" : "light"
        localStorage.setItem("theme", theme)
        console.log("themeButton click theme", theme)
        for (const graph of graphs) {
            if (graph instanceof Grapher3D) {
                graph.theme = theme
            }
            graph.drawGraphs()
        }
    })

    molarMassToggle.addEventListener("click", () => {
        molar_mass_expanded = !molar_mass_expanded
        molarMassList.style.height = molar_mass_expanded ? "448px" : "67px"
        molarMassToggle.innerText = molar_mass_expanded ? "Show Less" : "Show More"
    })
    specialCharToggle.addEventListener("click", () => {
        special_char_expanded = !special_char_expanded
        specialCharList.style.height = special_char_expanded ? "202px" : "67px"
        specialCharToggle.innerText = special_char_expanded ? "Show Less" : "Show More"
    })

    // Click event listener on document for handling digits input value
    document.addEventListener("click", (event) => {
        if (event.target !== digitsInput && UPDATE_DIGITS) {
            if (calculator.digits !== digitsInput.value) {
                digitsInput.value = calculator.digits
                UPDATE_DIGITS = false
            }
        }
    })
    
    for (const button of commandButtons) {
        button.addEventListener("click", (event) => {
            const index = getCursorPosition(userInput)
            event.preventDefault()
            const u = userInput.innerText 
            let t = button.dataset.text || button.innerText
            let length = t.length + 1
            if (t.includes("|") && !button.dataset.override) {
                const pipe_index = t.indexOf("|")
                t = t.slice(0, pipe_index) + t.slice(pipe_index + 1)
                length = pipe_index
            } else {
                t += " "
            }
            const op = t.trim().replaceAll("()", "")
            if (u.length === 0 && (op in OPERATIONS || op in HELP)) {
                userInput.textContent = `help ${op}`
                highlightSyntax(userInput)
                userInput.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    which: 13,
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
            } else {
                if (t.trim().startsWith("\\")) {
                    t = SPECIAL_CHAR_MAP[t.trim()][0] + " "
                    length = 2
                }
                userInput.textContent = `${u.slice(0, index)}${t}${u.slice(index, u.length)}`
                highlightSyntax(userInput)
                setCursorPosition(userInput, index + length)
            }
        })
    }

    if (localStorage.getItem("display_mode") == "wide") {
        calcContainer.style.width = "max(350px, 50vw)"
    }
    calcContainer.style.opacity = "1"

    let saved_functions = JSON.parse(localStorage.getItem("saved_functions") || "{}")
    let saved_variables = JSON.parse(localStorage.getItem("saved_variables") || "{}")
    renderSavedFunctions(saved_functions)
    renderSavedVariables(saved_variables)
    for (const f in saved_functions) {
        calculator.calculate(saved_functions[f])
    }
    for (const v in saved_variables) {
        calculator.calculate(`${v} = ${JSON.stringify(saved_variables[v]).replaceAll('"', "")}`)
    }
    calculator.ans = null

    sideBarButton.addEventListener("click", () => {
        if (SIDE_BAR === "yes") {
            sideBar.style.right = "-270px"
            SIDE_BAR = "no"
        } else {
            sideBar.style.right = "0px"
            SIDE_BAR = "yes"
        }
        localStorage.setItem("side_bar", SIDE_BAR)
    })

    function commandInsert(event) {
        const index = getCursorPosition(userInput)
        event.preventDefault()
        const u = userInput.innerText 
        let t = event.target.dataset.text || event.target.innerText
        let length = t.length
        if (t.includes("|") && !event.target.dataset.override) {
            const pipe_index = t.indexOf("|")
            t = t.slice(0, pipe_index) + t.slice(pipe_index + 1)
            length = pipe_index
        }
        userInput.innerText = `${u.slice(0, index)}${t}${u.slice(index, u.length)}`
        highlightSyntax(userInput)
        setCursorPosition(userInput, index + length)
    }

    function renderSavedFunctions(saved_functions) {
        userBar.textContent = ""
        const cmdText = document.createElement("div")
        cmdText.classList.add("command-text")
        cmdText.innerText = "Saved functions:"
        userBar.append(cmdText)
        for (const f in saved_functions) {
            const userButton = document.createElement("div")
            userButton.classList.add("user-button")
            const cmd = document.createElement("div")
            cmd.classList.add("user-button-text")
            cmd.dataset.text = `${f}(|)`
            cmd.innerText = `${f}`
            const button = document.createElement("div")
            button.innerText = "x"
            button.classList.add("user-button-x")
            userButton.append(cmd)
            userButton.append(button)
            userBar.append(userButton)
            cmd.addEventListener("click", (event) => {
                if (userInput.innerText.length === 0) {
                    userInput.textContent = `${`${f}`.replaceAll("()", "")}`
                    highlightSyntax(userInput)
                    userInput.dispatchEvent(new KeyboardEvent("keydown", {
                        key: "Enter",
                        code: "Enter",
                        which: 13,
                        keyCode: 13,
                        bubbles: true,
                        cancelable: true
                    }))
                } else {
                    commandInsert(event)
                }
            })
            button.addEventListener("click", (event) => {
                const new_saved_functions = JSON.parse(localStorage.getItem("saved_functions") || "{}")
                delete new_saved_functions[f]
                localStorage.setItem("saved_functions", JSON.stringify(new_saved_functions))
                renderSavedFunctions(new_saved_functions)
            })
        }
    }

    function renderSavedVariables(saved_variables) {
        varBar.textContent = ""
        const cmdText = document.createElement("div")
        cmdText.classList.add("command-text")
        cmdText.innerText = "Saved variables:"
        varBar.append(cmdText)
        for (const f in saved_variables) {
            const userButton = document.createElement("div")
            userButton.classList.add("user-button")
            const cmd = document.createElement("div")
            cmd.classList.add("user-button-text")
            cmd.dataset.text = `${f}`
            cmd.innerText = `${f}`
            const button = document.createElement("div")
            button.innerText = "x"
            button.classList.add("user-button-x")
            userButton.append(cmd)
            userButton.append(button)
            varBar.append(userButton)
            cmd.addEventListener("click", commandInsert)
            button.addEventListener("click", (event) => {
                const new_saved_variables = JSON.parse(localStorage.getItem("saved_variables") || "{}")
                delete new_saved_variables[f]
                localStorage.setItem("saved_variables", JSON.stringify(new_saved_variables))
                renderSavedVariables(new_saved_variables)
            })
        }
    }

    // Auto fill answer
    function ansAutoFill(event) {
        let user_input = userInput.innerText
        if (user_input.includes("\\") && !user_input.includes("help")) {
            const pos = getCursorPosition(userInput)
            let offset = -1
            user_input = user_input.replace(SPECIAL_CHAR_REGEX, (match, _offset) => {       
                offset = _offset     
                return SPECIAL_CHAR_MAP[match][0]
            })
            if (offset !== -1) {
                userInput.innerText = user_input
                highlightSyntax(userInput)
                setCursorPosition(userInput, offset + 1)
            }
        }
        // Autocomplete
        userInputAutocomplete.innerText = ""
        highlightSyntax(userInput)
        let search_terms = [...Object.keys(OPERATIONS), ...Object.keys(HELP), ...Object.keys(calculator.variables), ...Object.keys(calculator.functions)]
        let removed_terms = ["eval_if", "index"]
        search_terms = search_terms.filter((x) => !removed_terms.includes(x))
        let words = user_input.split(" ")
        let last_word = words[words.length - 1]
        let matches = []
        for (const search_term of search_terms) {
            if (search_term.startsWith(last_word)) {
                matches.push(search_term)
            } 
        }
        if (matches.length === 1 && matches[0].length > 3) {
            if (matches[0] === last_word) {
                userInputAutocomplete.innerText = ""
            } else {
                userInputAutocomplete.innerText = matches[0].slice(last_word.length)
                user_input = userInput.innerText
                setCursorPosition(userInput, userInput.innerText.length)
            }
        }
        const e = event.target.innerText
        // First character is symbol
        if (e.trim().length === 1 && SYMBOLS.includes(e) && !["-", "~", ":", ...UNITS].includes(e)) {
            userInput.innerHTML = `ans${["!", "^"].includes(e) ? "" : " "}${e}${["^"].includes(e) ? "" : " "}`
            highlightSyntax(userInput)
            const cursor_pos = ["^", "!"].includes(e) ? `ans${e}`.length : `ans ${e} `.length
            setCursorPosition(userInput, cursor_pos)
        }
    }

    // Handle key down for user input
    function handleKeyDown(event) {
        let user_input = userInput.innerText.trim()
        if (event.key === "Enter" && !event.shiftKey && user_input.length == 0) {
            event.preventDefault()
            return
        }
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault()
            let skip_result = false
            if (userInputAutocomplete.innerText.length > 0) {
                const original_text = userInput.textContent
                const autocomplete_text = userInputAutocomplete.textContent
                const cursor_pos = getCursorPosition(userInput)
                const new_text = original_text.slice(0, cursor_pos) + 
                            autocomplete_text + 
                            original_text.slice(cursor_pos)
                userInput.textContent = new_text
                highlightSyntax(userInput)
                userInputAutocomplete.textContent = ""
                setCursorPosition(userInput, cursor_pos + autocomplete_text.length)
                return
            }
            if (event.key == "Tab") return
            if (user_input.length || event.shiftKey) {
                history_index = history.length
                history.push(user_input)
                history_current = ""
                let output = ""
                if (user_input.startsWith("clear")) {
                    if (user_input === "clear") {
                        interface.textContent = ""
                    } else {
                        const match = user_input.match(/^clear\s+(\d+)$/)
                        if (match) {
                            const n = parseInt(match[1])
                            const rows = Array.from(interface.children)

                            const toRemove = Math.min(n * 2 + 1, rows.length)
                            const keepCount = rows.length - toRemove
                            for (let i = rows.length - 1; i >= keepCount; i--) {
                                interface.removeChild(rows[i])
                            }
                            skip_result = true
                        } else {
                            output = "Clear error"
                        }
                    }
                } else if (user_input.startsWith("help")) {
                    const op = user_input.slice(user_input.indexOf("help") + "help".length).trim()
                    if (OPERATIONS[op] || HELP[op]) {
                        let e = OPERATIONS[op] || HELP[op]
                        output = `Name: ${e.name}\nUsage: \``
                        if (e.schema.length == 0) {
                            output += op + "\`"
                        } else if (e.schema[0] < 0 || SYMBOLS.includes(op) || HELP[op]) {
                            if (e.schema[0] === -2) {
                                output += `${e.vars[0]} ${e.vars[1]} ${op}`
                            } else if (e.schema[0] === -1) {
                                output += `${e.vars[0]}${["!"].includes(op) ? "" : " "}${op}`
                            } else {
                                output += `${op}${HELP[op] && op !== "@" ? " " : ""}${["not", "si"].includes(op) ? " " : ""}${e.vars[0]}`
                            }
                            for (let i = 1; i < e.vars.length; i++) {
                                if (e.schema[i] < 0) continue
                                output += ` ${e.vars[i]}`
                            }
                            output += `\`\nTypes: \`${e.vars[0]}: ${e.types[0]}`
                            for (let i = 1; i < e.vars.length; i++) {
                                output += `, ${e.vars[i]}: ${e.types[i]}`
                            }
                            output += "\`"
                        } else {
                            output += `${op}(${e.vars[0]}: ${e.types[0]}`
                            for (let i = 1; i < e.vars.length; i++) {
                                output += `, ${e.vars[i]}: ${e.types[i]}`
                            }
                            output += ")\`"
                        }
                        if (e.example) {
                            output += `\n${e.example}`
                        }
                    } else {
                        output += "Welcome to Functional Calculator! See the guide for help getting started..."
                    }
                } else if (user_input.startsWith("trace")) {
                    const rest = user_input.slice(user_input.indexOf("trace") + "trace".length).trim()
                    output = calculator.calculate(rest, { debug: true })
                } else if (user_input.startsWith("save")) {
                    const op = user_input.slice(user_input.indexOf("save") + "save".length).trim()
                    if (!op.startsWith("@") && op in calculator.functions) {
                        try {   
                            let fs = calculator.functions[op].string
                            while (fs.includes("@")) {
                                const index = fs.lastIndexOf("@")
                                let name = fs.slice(fs.lastIndexOf("@"))
                                if (name.indexOf(")") !== -1) {
                                    name = name.slice(0, name.indexOf(")"))
                                }
                                fs = fs.slice(0, index) + calculator.functions[name].string.replaceAll("@", "#").trim() + fs.slice(index + name.length)
                            }
                            fs = fs.replaceAll("#", "@")
                            output = `Saved \`${fs}\``
                            let saved_functions = JSON.parse(localStorage.getItem("saved_functions") || "{}")
                            saved_functions[op] = fs
                            localStorage.setItem("saved_functions", JSON.stringify(saved_functions))
                            renderSavedFunctions(saved_functions)
                        } catch (err) {
                            // console.log("save error", err)
                            output = `Save error`
                        }
                    } else if (op in calculator.variables) {
                        try {
                            let v = calculator.variables[op]
                            if (v instanceof Operation || v instanceof ComplexNumber || v instanceof UnitNumber || v instanceof BaseNumber) {
                                v = v.toString()
                            }
                            let value = JSON.stringify(v)
                            value = value.replaceAll('"', "")
                            output = `Saved \`${op} = ${value.replaceAll(",", ", ")}\``
                            let saved_variables = JSON.parse(localStorage.getItem("saved_variables") || "{}")
                            saved_variables[op] = value
                            localStorage.setItem("saved_variables", JSON.stringify(saved_variables))
                            renderSavedVariables(saved_variables)
                        } catch (err) {
                            // console.log(err)
                            output = `Save error`
                        }
                    } else {
                        output = `Save error > can only save user-defined variables and functions`
                    }
                } else if (user_input.startsWith("diff")) {
                    let f = user_input.slice(user_input.indexOf("diff") + "diff".length).trim()
                    output = perform_diff(f, calculator)[1]
                } else if (user_input.startsWith("lim")) {
                    try {
                        if (!user_input.includes(" as ") || !user_input.includes("→")) {
                            throw "Error"
                        }
                        let content = user_input.slice(user_input.indexOf("lim") + "lim".length).trim()
                        let expr = content.slice(0, content.indexOf("as")).trim()
                        let rest = content.slice(content.indexOf("as") + 2).trim()
                        let x = rest.slice(0, rest.indexOf("→")).trim()
                        let a = rest.slice(rest.indexOf("→") + 1).trim()
                        calculator.calculate(`lim(${x}) = ${expr}`)
                        let direct = calculator.calculate(`lim(${a})`)
                        if (isFinite(direct)) {
                            output = direct
                        } else {
                            const max_steps = 20
                            let eps = 1e-3
                            let prev = NaN
                            const tol = 1e-12
                            const history = []
                            let success = false
                            for (let i = 0; i < max_steps; i++) {
                                let left = calculator.calculate(`lim(${a - eps})`)
                                let right = calculator.calculate(`lim(${a + eps})`)
                                if (isFinite(left) && isFinite(right)) {
                                    let current = (left + right) / 2
                                    history.push(current)
                                    if (history.length >= 4) {
                                        let signs = history.map(Math.sign)
                                        let mags = history.map(Math.abs)
                                        let increasing = mags.every((v, i, arr) => i === 0 || v > arr[i - 1] * 1.5)
                                        if (increasing && signs.every(s => s > 0)) {
                                            output = Infinity
                                            success = true
                                            break
                                        }
                                        if (increasing && signs.every(s => s < 0)) {
                                            output = -Infinity
                                            success = true
                                            break
                                        }
                                    }
                                    if (isFinite(prev) && Math.abs(current - prev) < tol) {
                                        output = current
                                        success = true
                                        break
                                    } 
                                    prev = current
                                }
                                eps /= 2
                            }
                            if (!success) {
                                output = "Could not find limit"
                            } else {
                                calculator.ans = output
                            }
                            
                        }
                    } catch (error) {
                        if (!output) {
                            output = "Limit error"
                        }
                    }
                } else if (user_input.startsWith("bal")) {
                    try {
                        let eq = user_input.slice(user_input.indexOf("bal") + "bal".length).trim()
                        output = balance_chemical_equation(eq)
                        if (!output.toLowerCase().includes("error")) {
                            output = `\`${output}\``
                        }
                    } catch (error) {
                        if (!output) {
                            output = "Balance chemistry equation error"
                        }
                    }
                } else if (user_input.startsWith("plot")) {
                    // Pass
                } else {
                    // Calculate output
                    if (event.shiftKey) {
                        if (user_input.length === 0) {
                            if (last_output instanceof Fraction || last_output instanceof BaseNumber) {
                                userInput.textContent = `${last_output}`
                                user_input = `${last_output}`
                                highlightSyntax(userInput)
                            } else {
                                return
                            }
                        }
                        output = calculator.calculate(user_input, { no_fraction: true, no_base_number: true })
                    } else {
                        output = calculator.calculate(user_input)
                    }
                }
                // Result
                let result
                if (!skip_result) {
                    if (user_input.startsWith("plot3")) {
                        result = document.createElement("div")
                        result.className = "result-graph"
                        const expr = user_input.slice(user_input.indexOf("plot3") + "plot3".length).trim()
                        const graph_parent = document.createElement("div")
                        graph_parent.id = `graph-${graph_id}`
                        graph_id++
                        result.append(graph_parent)
                        requestAnimationFrame(() => {
                            const graph = new Grapher3D({
                                parent: graph_parent,
                                height: 200,
                                width: 200,
                                theme: theme
                            })
                            graphs.push(graph)
                            graph.setInput(expr)
                        })
                    } else if (user_input.startsWith("plot")) {
                        result = document.createElement("div")
                        result.className = "result-graph"
                        const expr = user_input.slice(user_input.indexOf("plot") + "plot".length).trim()
                        const graph_parent = document.createElement("div")
                        graph_parent.id = `graph-${graph_id}`
                        graph_id++
                        result.append(graph_parent)
                        requestAnimationFrame(() => {
                            const graph = new Grapher({
                                parent: graph_parent,
                                height: 200,
                                width: 200
                            })
                            graphs.push(graph)
                            graph.setInput(expr)
                        })
                    } else if (user_input === "help plot3") {
                        result = document.createElement("div")
                        result.className = "result-graph"
                        const help_text = document.createElement("div")
                        help_text.className = "result-text"
                        help_text.innerText = output
                        result.append(help_text)
                        highlightSyntax(help_text, true, true)
                        const text_1 = document.createElement("div")
                        text_1.innerText = "Guide:\n  1. Graph `z = f(x, y)`\n\nExample #1: `plot3 y^2 - x^2`"
                        text_1.className = "result-text"
                        highlightSyntax(text_1, true, true)
                        result.append(text_1)
                        let graph_parent = document.createElement("div")
                        graph_parent.id = `graph-${graph_id}`
                        graph_id++
                        result.append(graph_parent)
                        requestAnimationFrame(() => {
                            const graph = new Grapher3D({
                                parent: graph_parent,
                                height: 200,
                                width: 200
                            })
                            graph.setInput("y^2 - x^2")
                            graphs.push(graph)
                        })
                    } else if (user_input === "help plot") {
                        result = document.createElement("div")
                        result.className = "result-graph"
                        const help_text = document.createElement("div")
                        help_text.className = "result-text"
                        help_text.innerText = output
                        result.append(help_text)
                        highlightSyntax(help_text, true, true)
                        const text_1 = document.createElement("div")
                        text_1.innerText = "Guide:\n  1. Graph functions of `x` as `f(x)`\n  2. Polar curves: `r = f(t)`\n  3. Parametric: `p: x = f(t), y = g(t)`\n  4. Slope fields: `s: f(x, y)`\n  5. Vector fields: `v: (f(x, y), g(x, y))`\n\nExample #1: `plot sin(x); r = 6sin(t) [0, pi]; p: x = t^2, y = 2t`"
                        text_1.className = "result-text"
                        highlightSyntax(text_1, true, true)
                        result.append(text_1)
                        let graph_parent = document.createElement("div")
                        graph_parent.id = `graph-${graph_id}`
                        graph_id++
                        result.append(graph_parent)
                        requestAnimationFrame(() => {
                            const graph = new Grapher({
                                parent: graph_parent,
                                height: 200,
                                width: 200
                            })
                            graph.setInput("sin(x); r = 6sin(t) [0, pi]; p: x = t^2, y = 2t")
                            graphs.push(graph)
                            const text_2 = document.createElement("div")
                            text_2.innerText = "\nExample #2: `plot s: x/y; sqrt(x^2 - 1); -sqrt(x^2 - 1)`"
                            text_2.className = "result-text"
                            highlightSyntax(text_2, true, true)
                            result.append(text_2)
                            graph_parent = document.createElement("div")
                            graph_parent.id = `graph-${graph_id}`
                            graph_id++
                            result.append(graph_parent)
                            requestAnimationFrame(() => {
                                const graph = new Grapher({
                                    parent: graph_parent,
                                    height: 200,
                                    width: 200
                                })
                                graph.setInput("s: x/y; sqrt(x^2 - 1); -sqrt(x^2 - 1)")
                                graphs.push(graph)
                                const text_3 = document.createElement("div")
                                text_3.innerText = "\nExample #3: `plot v: (x, y)`"
                                text_3.className = "result-text"
                                highlightSyntax(text_3, true, true)
                                result.append(text_3)
                                graph_parent = document.createElement("div")
                                graph_parent.id = `graph-${graph_id}`
                                graph_id++
                                result.append(graph_parent)
                                requestAnimationFrame(() => {
                                    const graph = new Grapher({
                                        parent: graph_parent,
                                        height: 200,
                                        width: 200
                                    })
                                    graph.setInput("v: (x, y)")
                                    graphs.push(graph)
                                })
                            })
                        })
                    } else {
                        result = document.createElement("pre")
                        result.className = "result"
                        result.textContent = output
                    }
                    last_output = output
                    console.log("output", output, typeof output)
                    if (typeof output === "number" || ((typeof output === "string" || output instanceof String) && (output.startsWith("[") || "-0123456789".includes(output[0]) || output.includes("("))) || output instanceof Operation || output instanceof Fraction || output instanceof BaseNumber || output instanceof ComplexNumber || output instanceof UnitNumber || (user_input.startsWith("trace") && output !== "N/A") || typeof output === "boolean") {
                        console.log("highlightSyntax")
                        highlightSyntax(result, false, true)
                    }
                    if ((typeof output === "string" || output instanceof String) && output.includes("`") && result.className !== "result-graph") {
                        highlightSyntax(result, true, true)
                    }
                    if (`${output}`.length > 30) {
                        result.style.textAlign = "left"
                        result.style.margin = "10px 0 10px 20%"
                    }
                    if (typeof output !== "string" && !(output instanceof String) && `${output}`.length < 100) {
                        result.style.cursor = "pointer"
                        result.addEventListener("click", (event) => {
                            event.preventDefault()
                            userInput.innerText += result.innerText + " "
                            highlightSyntax(userInput)
                            setCursorPosition(userInput, userInput.innerText.length - 1)
                        })
                    }
                    interface.append(result)
                }
            }
            
            // Input
            const input = document.createElement("div")
            input.className = "input"
            input.contentEditable = "plaintext-only"
            // Last input is designated as user input
            userInput.contentEditable = false
            // Remove event listeners
            userInput.removeEventListener("keydown", handleKeyDown)
            userInput.removeEventListener("input", ansAutoFill)
            userInputAutocomplete.removeEventListener("click", handleAutocompleteClick)
            // User input is now last input
            input.spellcheck = "false"
            userInput = input
            const autocomplete = document.createElement("div")
            autocomplete.classList.add("input-autocomplete")
            userInputAutocomplete = autocomplete
            const inputRow = document.createElement("div")
            inputRow.classList.add("input-row")
            inputRow.append(input)
            inputRow.append(autocomplete)
            interface.append(inputRow)
            // Add event listeners
            userInput.addEventListener("keydown", handleKeyDown)
            userInput.addEventListener("input", ansAutoFill)
            userInputAutocomplete.addEventListener("click", handleAutocompleteClick)

            userInput.focus() 
        } else if (event.keyCode === 57 && event.shiftKey) {
            event.preventDefault()
            const cursorPos = getCursorPosition(userInput)
            const fullText = userInput.textContent
            const newText = fullText.slice(0, cursorPos) + "()" + fullText.slice(cursorPos)
            userInput.textContent = newText
            highlightSyntax(userInput)
            setCursorPosition(userInput, cursorPos + 1)
        } else if (event.key === "Backspace" && !event.metaKey) {
            event.preventDefault()
            const selection = window.getSelection()
            if (selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
                const range = selection.getRangeAt(0)
                const start_offset = getCursorPosition(userInput, range.startContainer, range.startOffset)
                const end_offset = getCursorPosition(userInput, range.endContainer, range.endOffset)
                const plain_text = userInput.textContent
                const new_text = plain_text.slice(0, start_offset) + plain_text.slice(end_offset)
                userInput.textContent = new_text
                highlightSyntax(userInput)
                setCursorPosition(userInput, start_offset)
            } else { 
                const cursor_pos = getCursorPosition(userInput)
                const plain_text = userInput.textContent
                if (cursor_pos > 0) {
                    if ((plain_text[cursor_pos - 1] === "(" && plain_text[cursor_pos] === ")") || (plain_text[cursor_pos - 1] === "[" && plain_text[cursor_pos] === "]")) {
                        const new_text = plain_text.slice(0, cursor_pos - 1) + plain_text.slice(cursor_pos + 1)
                        userInput.textContent = new_text
                        highlightSyntax(userInput)
                        setCursorPosition(userInput, cursor_pos - 1)
                    } else {
                        const new_text = plain_text.slice(0, cursor_pos - 1) + plain_text.slice(cursor_pos)
                        userInput.textContent = new_text
                        highlightSyntax(userInput)
                        ansAutoFill(event)
                        setCursorPosition(userInput, cursor_pos - 1)
                    }
                }
            }
        } else if (event.key === "Backspace" && event.metaKey) {
            event.preventDefault()
            const cursor_pos = getCursorPosition(userInput)
            const plain_text = userInput.textContent
            if (cursor_pos > 0) {
                const new_text = plain_text.slice(cursor_pos)
                userInput.textContent = new_text
                highlightSyntax(userInput)
                setCursorPosition(userInput, 0)
            }
        } else if (event.keyCode === 219) {
            event.preventDefault()
            const cursor_pos = getCursorPosition(userInput)
            const full_text = userInput.textContent
            const new_text = full_text.slice(0, cursor_pos) + "[]" + full_text.slice(cursor_pos)
            userInput.textContent = new_text
            highlightSyntax(userInput)
            setCursorPosition(userInput, cursor_pos + 1)
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            if (history_index >= 0 && history_index < history.length) {
                if (history_index === history.length - 1) {
                    history_current = userInput.textContent
                }
                userInput.textContent = history[history_index]
                highlightSyntax(userInput)
                history_index = Math.max(history_index - 1, 0)
                setCursorPosition(userInput, userInput.textContent.length)
            }
        } else if (event.key === "ArrowDown") {
            if (history.length === 0) return
            event.preventDefault()
            if (history_index < history.length - 1) {
                history_index++
                userInput.textContent = history[history_index]
            } else {
                userInput.textContent = history_current
            }
            highlightSyntax(userInput)
            setCursorPosition(userInput, userInput.textContent.length)
        }
    }

    function handleAutocompleteClick(event) {
        event.preventDefault()
        setCursorPosition(userInput, userInput.textContent.length)
        userInput.focus()
    }

    function highlightInSidebar(term) {
        clearSidebarHighlights()
        sideBarInputTag.innerText = ""
        search_index = -1
        search_matches = []
        if (!term.trim()) return
        const walker = document.createTreeWalker(sideBarMain, NodeFilter.SHOW_TEXT)
        const regex = new RegExp(term, "i")
        const textNodes = []
        while (walker.nextNode()) {
            const node = walker.currentNode
            if (!node.parentElement.closest(".marked")) {
                textNodes.push(node)
            }
        }
        textNodes.forEach((node) => {
            const text = node.textContent
            if (regex.test(text)) {
                const span = document.createElement("span")
                span.innerHTML = text.replace(regex, match => `<mark class="marked">${match}</mark>`)
                node.replaceWith(span)
            }
        })
        for (const cmd of sideBarMain.querySelectorAll(".command:not(:has(.marked))")) {
            const data_name = cmd.getAttribute("data-name") || ""
            if (regex.test(data_name)) {
                const mark = document.createElement("mark")
                mark.className = "marked"
                mark.innerText = cmd.innerText
                cmd.textContent = ""
                cmd.appendChild(mark)
            }
        }

        search_matches = Array.from(document.querySelectorAll("#side-bar .marked"))
        if (search_matches.length > 0) {
            search_index = 0
            focusSearchMatch()
        }
        sideBarInputTag.innerText = `${search_index + 1}/${search_matches.length}`
    }

    function focusSearchMatch() {
        search_matches.forEach((element, i) => {
            element.classList.toggle("active-match", i === search_index)
        })
        search_matches[search_index].scrollIntoView({ behavior: "auto", block: "center" })
    }
      
    function clearSidebarHighlights() {
        const marks = sideBarMain.querySelectorAll(".marked")
        marks.forEach(mark => {
            const textNode = document.createTextNode(mark.textContent)
            mark.replaceWith(textNode)
        })
        sideBarMain.normalize()
    }
      
    sideBarInput.addEventListener("input", (event) => {
        highlightInSidebar(event.target.value)
    })
    
    sideBarInput.addEventListener("keydown", (event) => {
        if (((event.key === "Enter" && !event.shiftKey) || event.key === "ArrowUp") && search_matches.length > 0) {
            event.preventDefault()
            search_index = (search_index + 1) % search_matches.length
            sideBarInputTag.innerText = `${search_index + 1}/${search_matches.length}`
            focusSearchMatch()
        }
        if (((event.key === "Enter" && event.shiftKey) || event.key === "ArrowDown") && search_matches.length > 0) {
            event.preventDefault()
            search_index = (search_index - 1 + search_matches.length) % search_matches.length
            sideBarInputTag.innerText = `${search_index + 1}/${search_matches.length}`
            focusSearchMatch()
        }
    })
})


// Enable an overflowing element to be scrolled by dragging
function enableDragToScroll(element) {
    // Position
    let pos = { 
        top: 0, 
        left: 0, 
        x: 0, 
        y: 0 
    }

    function handleMouseDown(event) {
        DRAGGING = false
        pos = {
            left: element.scrollLeft,
            top: element.scrollTop,
            x: event.clientX,
            y: event.clientY,
        }
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleMouseMove = (event) => {
        const dx = event.clientX - pos.x
        const dy = event.clientY - pos.y
        element.scrollTop = pos.top - dy
        element.scrollLeft = pos.left - dx
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            DRAGGING = true
        }
    }

    const handleMouseUp = (event) => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        if (DRAGGING) {
            const preventClick = (e) => {
                e.preventDefault()
                e.stopPropagation()
                element.removeEventListener("click", preventClick, true)
            }
            element.addEventListener("click", preventClick, true)
        }
    }

    // Attach the handler
    element.addEventListener("mousedown", handleMouseDown)
}

// Position caret in text
function positionCaret(element, pos, child = 0) {
    try {
        const range = document.createRange()
        const sel = window.getSelection()

        range.setStart(element.childNodes[child], pos)
        range.collapse(true)

        sel.removeAllRanges()
        sel.addRange(range)
        element.focus()
    } catch (err) {
        // No text node
    }
}