let calculator
document.addEventListener("DOMContentLoaded", () => {
    // Calculator
    calculator = new Calculator()

    // Data
    let history = []
    let history_index = -1
    let history_current = ""
    let display_mode = localStorage.getItem("display_mode") || "default"
 
    // States
    let UPDATE_DIGITS = false
    let DRAGGING = false

    // Elements
    const interface = document.getElementById("interface")
    let userInput = document.getElementsByClassName("input")[0]
    let userInputAutocomplete = document.getElementsByClassName("input-autocomplete")[0]
    
    const angleButton = document.getElementById("angle-button")
    const digitsInput = document.getElementById("digits-input")
    const displayButton = document.getElementById("display-button")
    const commandButtons = document.getElementsByClassName("command")
    const commandBar = document.getElementById("command-bar")
    const userBar = document.getElementById("user-bar")
    const varBar = document.getElementById("var-bar")
    const calcContainer = document.getElementById("container")
    // Initial

    // User input event listeners
    userInput.addEventListener("keydown", handleKeyDown)
    userInput.addEventListener("input", ansAutoFill)
    userInputAutocomplete.addEventListener("click", handleAutocompleteClick)

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

    enableDragToScroll(commandBar)
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
            const index = window.getSelection().anchorOffset
            event.preventDefault()
            const u = userInput.innerText 
            let t = button.dataset.text || button.innerText
            let length = t.length
            if (t.includes("|") && !button.dataset.override) {
                const pipe_index = t.indexOf("|")
                t = t.slice(0, pipe_index) + t.slice(pipe_index + 1)
                length = pipe_index
            }
            if (u.length === 0) {
                userInput.innerText = `help ${t.replaceAll("()", "")}`
                userInput.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    which: 13,
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
            } else {
                userInput.innerText = `${u.slice(0, index)}${t}${u.slice(index, u.length)}`
                positionCaret(userInput, index + length)
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

    function commandInsert(event) {
        const index = window.getSelection().anchorOffset
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
        positionCaret(userInput, index + length)
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
            cmd.addEventListener("click", commandInsert)
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
        let user_input = userInput.innerText.trim()
        // Autocomplete
        userInputAutocomplete.innerText = ""
        let search_terms = [...Object.keys(OPERATIONS), ...Object.keys(HELP), ...Object.keys(calculator.variables), ...Object.keys(calculator.functions)]
        let words = user_input.split(" ")
        let last_word = words[words.length - 1]
        let matches = []
        for (const search_term of search_terms) {
            if (search_term.startsWith(last_word)) {
                matches.push(search_term)
            } 
        }
        if (matches.length === 1 && matches[0].length - last_word.length >= 2) {
            if (matches[0] === last_word) {
                userInputAutocomplete.innerText = ""
            } else {
                userInputAutocomplete.innerText = matches[0].slice(last_word.length)
                user_input = userInput.innerText
                positionCaret(userInput, user_input.length)
            }
        }
        const e = event.target.innerText
        // First character is symbol
        if (e.trim().length === 1 && SYMBOLS.includes(e) && !["-", "~", ":", ...UNITS].includes(e)) {
            userInput.innerHTML = `ans${["!", "^"].includes(e) ? "" : " "}${e}${["^"].includes(e) ? "" : "&nbsp"}`
            positionCaret(userInput, userInput.innerText.length)
        }
    }

    // Handle key down for user input
    function handleKeyDown(event) {
        let user_input = userInput.innerText.trim()
        // Enter key
        if (event.keyCode === 13) {
            // Prevent newline from enter key
            event.preventDefault()
            if (userInputAutocomplete.innerText.length > 0) {
                userInput.innerText += userInputAutocomplete.innerText
                userInputAutocomplete.innerText = ""
                positionCaret(userInput, userInput.innerText.length)
                return
            }
            // Prevent empty queries
            if (user_input.length || event.shiftKey) {
                history_index = history.length
                history.push(user_input)
                history_current = ""
                if (user_input === "clear") {
                    interface.textContent = ""
                } else {
                    let output = ""
                    if (user_input.startsWith("help")) {
                        const op = user_input.slice(user_input.indexOf("help") + "help".length).trim()
                        if (OPERATIONS[op] || HELP[op]) {
                            let e = OPERATIONS[op] || HELP[op]
                            output = `Name: ${e.name}\nUsage: `
                            if (e.schema.length == 0) {
                                output += op
                            } else if (e.schema[0] < 0 || SYMBOLS.includes(op) || HELP[op]) {
                                if (e.schema[0] === -2) {
                                    output += `${e.vars[0]} ${e.vars[1]} ${op}`
                                } else if (e.schema[0] === -1) {
                                    output += `${e.vars[0]}${["!"].includes(op) ? "" : " "}${op}`
                                } else {
                                    output += `${op}${HELP[op] && op !== "@" ? " " : ""}${e.vars[0]}`
                                }
                                for (let i = 1; i < e.vars.length; i++) {
                                    if (e.schema[i] < 0) continue
                                    output += ` ${e.vars[i]}`
                                }
                                output += `\nTypes: ${e.vars[0]}: ${e.types[0]}`
                                for (let i = 1; i < e.vars.length; i++) {
                                    output += `, ${e.vars[i]}: ${e.types[i]}`
                                }
                            } else {
                                output += `${op}(${e.vars[0]}: ${e.types[0]}`
                                for (let i = 1; i < e.vars.length; i++) {
                                    output += `, ${e.vars[i]}: ${e.types[i]}`
                                }
                                output += ")"
                            }
                            if (e.example) {
                                output += `\n${e.example}`
                            }
                        } else {
                            output += "Welcome to Calculator! Learn about a function by typing `help func` where `func` is the name of a function such as `sin`..."
                        }
                    } else if (user_input.startsWith("save")) {
                        const op = user_input.slice(user_input.indexOf("save") + "save".length).trim()
                        // console.log("save", op)
                        if (!op.startsWith("@") && op in calculator.functions) {
                            try {   
                                let fs = calculator.functions[op].string
                                while (fs.includes("@")) {
                                    const index = fs.indexOf("@")
                                    let name = fs.slice(fs.lastIndexOf("@"))
                                    if (name.indexOf(")") !== -1) {
                                        name = name.slice(0, name.indexOf(")"))
                                    }
                                    fs = fs.slice(0, index) + calculator.functions[name].string.replaceAll("@", "#") + fs.slice(index + name.length)
                                }
                                fs = fs.replaceAll("#", "@")
                                output = `Saved ${fs.replaceAll(",", ", ")}`
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
                                let value = JSON.stringify(calculator.variables[op])
                                value = value.replace(/\{"op":"([^"]+)"\}/g, "$1")
                                value = value.replaceAll('"', "")
                                output = `Saved ${op} = ${value.replaceAll(",", ", ")}`
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
                    } else {
                        // Calculate output
                        if (event.shiftKey) {
                            if (user_input.length === 0) {
                                history.pop()
                                user_input = history[history.length - 1]
                                userInput.innerText = user_input
                            }
                            output = calculator.calculate(user_input, { no_fraction: true, no_constant: true })
                        } else {
                            output = calculator.calculate(user_input)
                        }
                    }
                    // Result
                    const result = document.createElement("pre")
                    result.className = "result"
                    result.innerText = output
                    if (output.length > 30) {
                        result.style.textAlign = "left"
                        result.style.margin = "10px 0 10px 20%"
                    }
                    if (typeof output !== "string" && `${output}`.length < 100) {
                        result.style.cursor = "pointer"
                        result.addEventListener("click", (event) => {
                            event.preventDefault()
                            userInput.innerText += result.innerText + " "
                            positionCaret(userInput, userInput.innerText.length)
                        })
                    }
                    interface.append(result)
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
            }
        } else if (event.keyCode === 57 && event.shiftKey) {
            const index = window.getSelection().anchorOffset
            event.preventDefault()
            const u = userInput.innerText
            userInput.innerText = `${u.slice(0, index)}()${u.slice(index, u.length)}`
            positionCaret(userInput, index + 1)
        } else if (event.keyCode === 8) {
            const index = window.getSelection().anchorOffset
            const u = userInput.innerText
            if ((u[index - 1] === "(" && u[index] === ")") || (u[index - 1] === "[" && u[index] === "]")) {
                event.preventDefault()
                userInput.innerText = u.slice(0, index - 1) + u.slice(index + 1)
                positionCaret(userInput, index - 1)
            }
        } else if (event.keyCode === 219) {
            const index = window.getSelection().anchorOffset
            event.preventDefault()
            const u = userInput.innerText
            userInput.innerText = `${u.slice(0, index)}[]${u.slice(index, u.length)}`
            positionCaret(userInput, index + 1)
        } else if (event.key === "ArrowUp") {
            if (history_index >= 0 && history_index < history.length) {
                if (history_index == history.length - 1) {
                    history_current = user_input
                }
                userInput.innerText = history[history_index]
                history_index = Math.max(history_index - 1, 0)
                event.preventDefault()
                positionCaret(userInput, userInput.innerText.length)
            }
        } else if (event.key === "ArrowDown") {
            if (history.length === 0) return
            if (history_index >= 0 && history_index < history.length - 1) {
                history_index++
                userInput.innerText = history[history_index]
            } else {
                userInput.innerText = history_current
            }
            event.preventDefault()
            positionCaret(userInput, userInput.innerText.length)
        }
    }

    function handleAutocompleteClick(event) {
        event.preventDefault()
        positionCaret(userInput, userInput.innerText.length)
        userInput.focus()
    }
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
            };
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