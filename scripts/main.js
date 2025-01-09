document.addEventListener("DOMContentLoaded", () => {
    // Calculator
    const calculator = new Calculator()

    // Data
    let history = []
    let history_index = -1
    let history_current = ""
    let history_outputs = []
    let history_outputs_index = []

    // States
    let UPDATE_DIGITS = false

    // Elements
    const interface = document.getElementById("interface")
    let userInput = document.getElementsByClassName("input")[0]
    
    const angleButton = document.getElementById("angle-button")
    const digitsInput = document.getElementById("digits-input")
    const commandButtons = document.getElementsByClassName("command")
    const commandBar = document.getElementById("command-bar")

    // Initial

    // User input event listeners
    userInput.addEventListener("keydown", handleKeyDown)
    userInput.addEventListener("input", ansAutoFill)

    // Angle button
    angleButton.addEventListener("click", event => {
        calculator.angle = calculator.angle === "rad" ? "deg" : "rad"
        angleButton.innerText = calculator.angle
    })

    enableDragToScroll(commandBar)
    
    // Digits input
    digitsInput.addEventListener("input", event => {
        UPDATE_DIGITS = true
        const e = event.target.value
        if (!isNaN(e)) {
            if (+e > 12) {
                calculator.digits = 12
            } else if (+e < 0) {
                calculator.digits = 0
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
            userInput.innerText = `${u.slice(0, index)}${t}${u.slice(index, u.length)}`
            positionCaret(userInput, index + length)
        })
    }

    // Auto fill answer
    function ansAutoFill(event) {
        const e = event.target.innerText
        // First character is symbol
        if (e.trim().length === 1 && SYMBOLS.includes(e) && !["-", "~"].includes(e)) {
            userInput.innerHTML = `ans${["!", "^"].includes(e) ? "" : " "}${e}${["^"].includes(e) ? "" : "&nbsp"}`
            positionCaret(userInput, userInput.innerText.length)
        }
    }

    // Handle key down for user input
    function handleKeyDown(event) {
        const user_input = userInput.innerText.trim()
        // Enter key
        if (event.keyCode === 13) {
            // Prevent newline from enter key
            event.preventDefault()
            // Prevent empty queries
            if (user_input.length) {
                history_index = history.length
                history.push(user_input)
                history_current = ""
                if (user_input === "clear") {
                    interface.textContent = ""
                } else {
                    let output = ""
                    if (user_input.startsWith("help")) {
                        const op = user_input.slice(user_input.indexOf("help") + "help".length).toLowerCase().trim()
                        if (OPERATIONS[op] || HELP[op]) {
                            let e = OPERATIONS[op] || HELP[op]
                            output = `Name: ${e.name}\nUsage: `
                            if (e.schema.length == 0) {
                                output += op
                            } else if (e.schema[0] == -1 || SYMBOLS.includes(op) || HELP[op]) {
                                if (e.schema[0] == -1) {
                                    output += `${e.vars[0]}${["!"].includes(op) ? "" : " "}${op}`
                                } else {
                                    output += `${op}${HELP[op] && op !== "@" ? " " : ""}${e.vars[0]}`
                                }
                                for (let i = 1; i < e.vars.length; i++) {
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
                    } else {
                        // Calculate output
                        output = calculator.calculate(user_input)
                    }

                    // Result
                    const result = document.createElement("div")
                    result.className = "result"
                    result.innerText = output
                    if (output.length > 30) {
                        result.style.textAlign = "left"
                        result.style.margin = "10px 0 10px 100px"
                    }
                    result.addEventListener("click", (event) => {
                        event.preventDefault()
                        userInput.innerText += result.innerText + " "
                        positionCaret(userInput, userInput.innerText.length)
                    })
                    interface.append(result)
                }
                
                // Input
                const input = document.createElement("div")
                input.className = "input"
                input.contentEditable = true

                // Last input is designated as user input
                userInput.contentEditable = false
                // Remove event listeners
                userInput.removeEventListener("keydown", handleKeyDown)
                userInput.removeEventListener("input", ansAutoFill)
                // User input is now last input
                userInput = input
                interface.append(input)
                // Add event listeners
                userInput.addEventListener("keydown", handleKeyDown)
                userInput.addEventListener("input", ansAutoFill)

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

    // Handle mouse down
    function handleMouseDown(event) {
        CAN_PRESS = false

        // Update position
        pos = {
            left: element.scrollLeft,
            top: element.scrollTop,
            x: event.clientX,
            y: event.clientY,
        };

        // Add mouse event listeners
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    // Handle mouse move
    const handleMouseMove = function(event) {
        // Distance mouse has been moved
        const dx = event.clientX - pos.x
        const dy = event.clientY - pos.y

        // Scroll the element
        element.scrollTop = pos.top - dy;
        element.scrollLeft = pos.left - dx;
    };

    // Handle mouse up
    const handleMouseUp = function() {
        CAN_PRESS = true

        // Remove mouse event listeners
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
    };

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