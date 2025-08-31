class Grapher3D {
    constructor(params = {}) {
        // Parent element
        this.parent = params.parent
        this.height = params.height
        this.width = params.width
        // State
        this.canZoom = true
        this.rotating = false
        this.theme = params.theme || "light"
        this.rotationX = Math.PI / 12
        this.rotationY = -0.7 * Math.PI
        this.zoomLevel = 1.0
        this.fullView = false
        // Graph properties
        this.x_range = { min: -5, max: 5 }
        this.y_range = { min: -5, max: 5 }
        this.z_range = { min: -5, max: 5 }
        this.function_intervals = 30 
        this.colors = ["red", "green", "blue", "purple", "orange"]
        this.calc_options = { no_fraction: true, no_base_number: true, noAns: true, noRound: true }
        this.create()
        // DOM elements
        this.input = document.getElementById(`${this.parent.id}-input`)
        this.zoomOutButton = document.getElementById(`${this.parent.id}-zoom-out-button`)
        this.zoomInButton = document.getElementById(`${this.parent.id}-zoom-in-button`)
        this.resizeButton = document.getElementById(`${this.parent.id}-resize-button`)
        this.graph = this.parent.getElementsByClassName("grapher-graph")[0]
        // WebGL Canvas
        this.canvas = document.getElementById(`${this.parent.id}-canvas`)
        this.initWebGL()
        this.overlayCanvas = document.getElementById(`${this.parent.id}-overlay`)
        this.overlayCtx = this.overlayCanvas.getContext("2d")
        // Expressions
        this.expressions = []
        // Listeners
        this.addListeners()
        // Draw graphs
        this.drawGraphs()
    }

    create() {
        // Bar
        const bar = document.createElement("div")
        bar.className = "grapher-bar"
        // Input 
        const input = document.createElement("input")
        input.id = `${this.parent.id}-input`
        input.className = "grapher-input"
        // Zoom buttons
        const zoomInButton = document.createElement("div")
        zoomInButton.id = `${this.parent.id}-zoom-in-button`
        zoomInButton.className = "grapher-zoom-button"
        zoomInButton.innerText = "+"
        const zoomOutButton = document.createElement("div")
        zoomOutButton.id = `${this.parent.id}-zoom-out-button`
        zoomOutButton.className = "grapher-zoom-button"
        zoomOutButton.innerText = "-"
        const resizeButton = document.createElement("div")
        resizeButton.id = `${this.parent.id}-resize-button`
        resizeButton.className = "grapher-resize-button"
        resizeButton.innerText = "↔"
        // Graph
        const graph = document.createElement("div")
        graph.className = "grapher-graph"
        graph.style.height = `${this.height}px`
        graph.style.width = `${this.width}px`
        // Canvas
        const canvas = document.createElement("canvas")
        canvas.className = "grapher-canvas"
        canvas.id = `${this.parent.id}-canvas`
        canvas.style.width = this.width + "px"
        canvas.style.height = this.height + "px"
        // Overlay
        const overlayCanvas = document.createElement("canvas")
        overlayCanvas.id = `${this.parent.id}-overlay`
        overlayCanvas.className = "grapher-overlay-canvas"
        overlayCanvas.style.position = "absolute"
        overlayCanvas.style.left = "0"
        overlayCanvas.style.top = "0"
        overlayCanvas.style.pointerEvents = "none"
        overlayCanvas.width = this.width
        overlayCanvas.height = this.height
        // Append to DOM
        bar.append(input)
        bar.append(zoomInButton)
        bar.append(zoomOutButton)
        bar.append(resizeButton)
        graph.append(canvas)
        graph.appendChild(overlayCanvas)
        this.container = document.createElement("div")
        this.container.className = "grapher3d"
        this.container.append(bar)
        this.container.append(graph)
        this.parent.append(this.container)
    }

    initWebGL() {
        try {
            this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl")
            if (!this.gl) {
                throw new Error("WebGL not supported")
            }
            const dpr = window.devicePixelRatio || 1
            this.canvas.width = this.width * dpr
            this.canvas.height = this.height * dpr
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
            // Initialize shaders
            this.initShaders()
            // Initialize buffers
            this.positionBuffer = this.gl.createBuffer()
            this.colorBuffer = this.gl.createBuffer()
            this.indexBuffer = this.gl.createBuffer()
            if (this.theme === "dark") {
                this.gl.clearColor(0.15, 0.15, 0.15, 1.0)
            } else {
                this.gl.clearColor(0.95, 0.95, 0.95, 1.0)
            }
            this.gl.enable(this.gl.DEPTH_TEST)
            this.gl.disable(this.gl.CULL_FACE)
            
        } catch (error) {
            const ctx = this.canvas.getContext("2d")
            ctx.font = "14px Arial"
            ctx.fillStyle = "red"
            ctx.fillText("WebGL not supported in your browser", 10, 50)
        }
    }

    initShaders() {
        // Vertex shader source
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;
            varying vec4 vPosition;

            void main(void) {
                vPosition = aVertexPosition;
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `
        // Fragment shader source
        const fsSource = `
            precision mediump float;
            varying lowp vec4 vColor;
            varying vec4 vPosition;

            uniform vec3 uMinBounds;
            uniform vec3 uMaxBounds;

            void main(void) {
                if (vPosition.x < uMinBounds.x || vPosition.x > uMaxBounds.x ||
                    vPosition.y < uMinBounds.y || vPosition.y > uMaxBounds.y ||
                    vPosition.z < uMinBounds.z || vPosition.z > uMaxBounds.z) {
                    discard;
                }
                gl_FragColor = vColor;
            }
        `
        // Create shader program
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource)
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource)
        this.shaderProgram = this.gl.createProgram()
        this.gl.attachShader(this.shaderProgram, vertexShader)
        this.gl.attachShader(this.shaderProgram, fragmentShader)
        this.gl.linkProgram(this.shaderProgram)
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            return null
        }
        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition"),
                vertexColor: this.gl.getAttribLocation(this.shaderProgram, "aVertexColor"),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, "uModelViewMatrix"),
                minBounds: this.gl.getUniformLocation(this.shaderProgram, "uMinBounds"),
                maxBounds: this.gl.getUniformLocation(this.shaderProgram, "uMaxBounds"),
            },
        }
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type)
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader)
            return null
        }
        return shader
    }

    addListeners() {
        this.zoomOutButtonListener = ["click", () => {
            if (!this.canZoom) return
            this.canZoom = false
            // Animate
            const original_x_range = { ...this.x_range }
            const original_y_range = { ...this.y_range }
            const original_z_range = { ...this.z_range }
            let frame = 1
            let total_frames = 5
            let zoom = this.zoomLevel
            const interval = setInterval(() => {
                if (frame > total_frames) {
                    this.canZoom = true
                    clearInterval(interval)
                    return
                }
                this.zoomLevel = zoom / (1 + 0.5 * frame / total_frames)
                this.x_range = { min: original_x_range.min * (1 + 0.5 * frame / total_frames), max: original_x_range.max * (1 + 0.5 * frame / total_frames) }
                this.y_range = { min: original_y_range.min * (1 + 0.5 * frame / total_frames), max: original_y_range.max * (1 + 0.5 * frame / total_frames) }
                this.z_range = { min: original_z_range.min * (1 + 0.5 * frame / total_frames), max: original_z_range.max * (1 + 0.5 * frame / total_frames) }
                this.drawGraphs()
                frame++
            }, 10)
        }]
        
        this.zoomInButtonListener = ["click", () => {
            if (!this.canZoom) return
            this.canZoom = false
            // Animate
            const original_x_range = { ...this.x_range }
            const original_y_range = { ...this.y_range }
            const original_z_range = { ...this.z_range }
            let frame = 1
            let total_frames = 10
            let zoom = this.zoomLevel
            const interval = setInterval(() => {
                if (frame > total_frames) {
                    this.canZoom = true
                    clearInterval(interval)
                    return
                }
                this.zoomLevel = zoom * (1 + 0.5 * frame / total_frames)
                this.x_range = { min: original_x_range.min / (1 + 0.5 * frame / total_frames), max: original_x_range.max / (1 + 0.5 * frame / total_frames) }
                this.y_range = { min: original_y_range.min / (1 + 0.5 * frame / total_frames), max: original_y_range.max / (1 + 0.5 * frame / total_frames) }
                this.z_range = { min: original_z_range.min / (1 + 0.5 * frame / total_frames), max: original_z_range.max / (1 + 0.5 * frame / total_frames) }
                this.drawGraphs()
                frame++
            }, 10)
        }]
        
        this.inputListener = ["input", () => {
            this.expressions = this.input.value.split(";").map(e => e.trim()).filter(e => e.length)
            this.drawGraphs()
        }]
        // Rotate graphs
        this.mouseDownListener = ["mousedown", (event) => {
            this.rotating = true
            this.lastMouseX = event.clientX
            this.lastMouseY = event.clientY
            document.addEventListener("mousemove", this.mouseMoveHandler)
            document.addEventListener("mouseup", this.mouseUpHandler)
        }]
        this.mouseMoveHandler = (event) => {
            if (!this.rotating) return
            const deltaX = event.clientX - this.lastMouseX
            const deltaY = event.clientY - this.lastMouseY
            const sensitivity = 0.005
            const directionMultiplier = Math.cos(this.rotationX) >= 0 ? 1 : -1
            this.rotationY += directionMultiplier * deltaX * sensitivity
            this.rotationX += deltaY * sensitivity
            if (this.rotationX > Math.PI) this.rotationX -= 2 * Math.PI
            if (this.rotationX < -Math.PI) this.rotationX += 2 * Math.PI
            this.lastMouseX = event.clientX
            this.lastMouseY = event.clientY
            this.drawGraphs()
        }
        this.mouseUpHandler = () => {
            this.rotating = false
            document.removeEventListener("mousemove", this.mouseMoveHandler)
            document.removeEventListener("mouseup", this.mouseUpHandler)
        }
        this.resizeButtonListener = ["click", () => {
            if (!this.fullView) {
                document.body.appendChild(this.container)
                this.container.style.position = "absolute"
                this.container.style.top = "50%"
                this.container.style.left = "50%"
                this.container.style.transform = "translate(-50%, -50%)"
                calcContainer.style.display = "none"
                let length = Math.min(window.innerHeight, window.innerWidth)
                length = Math.floor(0.8 * length / 200) * 200
                this.updateSize({ height: length, width: length })
                this.fullView = true
            } else {
                this.container.style.top = ""
                this.container.style.left = ""
                this.container.style.transform = ""
                this.container.style.position = "relative"
                calcContainer.style.display = "flex"
                this.parent.appendChild(this.container)
                this.fullView = false
                this.updateSize({ height: 200, width: 200 })
            }
        }]
        this.zoomOutButton.addEventListener(...this.zoomOutButtonListener)
        this.zoomInButton.addEventListener(...this.zoomInButtonListener)
        this.input.addEventListener(...this.inputListener)
        this.resizeButton.addEventListener(...this.resizeButtonListener)
        this.canvas.addEventListener(...this.mouseDownListener)
    }

    removeListeners() {
        this.zoomOutButton.removeEventListener(...this.zoomOutButtonListener)
        this.zoomInButton.removeEventListener(...this.zoomInButtonListener)
        this.input.removeEventListener(...this.inputListener)
        this.canvas.removeEventListener(...this.mouseDownListener)
        this.resizeButton.removeEventListener(...this.resizeButtonListener)
        document.removeEventListener("mousemove", this.mouseMoveHandler)
        document.removeEventListener("mouseup", this.mouseUpHandler)
    }

    updateSize(size) {
        this.width = size.width || this.width
        this.height = size.height || this.height
        // Update DOM elements
        this.graph.style.width = `${this.width}px`
        this.graph.style.height = `${this.height}px`
        this.canvas.style.width = `${this.width}px`
        this.canvas.style.height = `${this.height}px`
        this.input.style.width = `${this.width - 62}px`
        this.overlayCanvas.width = this.width
        this.overlayCanvas.height = this.height
        // Update WebGL canvas
        const dpr = window.devicePixelRatio || 1
        this.canvas.width = this.width * dpr
        this.canvas.height = this.height * dpr
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this.drawGraphs()
    }

    drawGraphs() {
        if (this.theme === "dark") {
            this.gl.clearColor(0.15, 0.15, 0.15, 1.0)
        } else {
            this.gl.clearColor(0.95, 0.95, 0.95, 1.0)
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        this.drawAxes()
        this.drawCoordinateBox()
        for (let i = 0; i < this.expressions.length; i++) {
            const expression = this.expressions[i]
            const options = { color: this.hexToRgb(this.colors[i % this.colors.length]) }
            if (expression.includes("=")) {
                const parts = expression.split("=").map(p => p.trim())
                const funcExpression = parts[1]
                if (parts[0] === "f(x,y)" || parts[0] === "z") {
                    this.graphFunction3D(funcExpression, options)
                }
            } else {
                this.graphFunction3D(expression, options)
            }
        }
        this.drawAxisLabels()
    }

    drawAxes() {
        const axisLength = Math.max(
            Math.abs(this.x_range.max), 
            Math.abs(this.x_range.min),
            Math.abs(this.y_range.max), 
            Math.abs(this.y_range.min),
            Math.abs(this.z_range.max), 
            Math.abs(this.z_range.min)
        ) * 1.2
        const axesVertices = [
            -axisLength, 0, 0,  axisLength, 0, 0,
            0, -axisLength, 0,  0, axisLength, 0,
            0, 0, -axisLength,  0, 0, axisLength
        ]
        let axesColors
        if (this.theme === "light") {
            axesColors = [
                0.0, 0.0, 0.0, 1.0,  0.0, 0.0, 0.0, 1.0,
                0.0, 0.0, 0.0, 1.0,  0.0, 0.0, 0.0, 1.0,
                0.0, 0.0, 0.0, 1.0,  0.0, 0.0, 0.0, 1.0
            ]
        } else {
            axesColors = [
                1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 1.0
            ]
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(axesVertices), this.gl.STATIC_DRAW)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(axesColors), this.gl.STATIC_DRAW)
        const projectionMatrix = this.createProjectionMatrix()
        const modelViewMatrix = this.createModelViewMatrix()
        this.gl.useProgram(this.programInfo.program)
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        )
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        )
        this.gl.uniform3f(this.programInfo.uniformLocations.minBounds, this.x_range.min, this.y_range.min, this.z_range.min)
        this.gl.uniform3f(this.programInfo.uniformLocations.maxBounds, this.x_range.max, this.y_range.max, this.z_range.max)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor)
        this.gl.drawArrays(this.gl.LINES, 0, 6)
    }

    projectPoint(point, modelViewMatrix, projectionMatrix) {
        const [x, y, z] = point
        const vec = vec4.fromValues(x, y, z, 1.0)
        vec4.transformMat4(vec, vec, modelViewMatrix)
        vec4.transformMat4(vec, vec, projectionMatrix)
        if (vec[3] === 0) return null
        const ndc = [vec[0] / vec[3], vec[1] / vec[3], vec[2] / vec[3]]
        const halfWidth = this.canvas.clientWidth / 2
        const halfHeight = this.canvas.clientHeight / 2
        const canvasX = halfWidth * (ndc[0] + 1)
        const canvasY = halfHeight * (1 - ndc[1]) 
        return [canvasX, canvasY]
    }

    drawAxisLabels() {
        const ctx = this.overlayCtx
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)
        const s = 1.2
        const positions = {
            "+x": [s * this.x_range.max, 0, 0],
            "+y": [0, s * this.y_range.max, 0],
            "+z": [0, 0, s * this.z_range.max],
        }
        const projectionMatrix = this.createProjectionMatrix()
        const modelViewMatrix = this.createModelViewMatrix()
        ctx.font = "12px Arial"
        ctx.fillStyle = "#000"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        for (const [label, pos] of Object.entries(positions)) {
            const projected = this.projectPoint(pos, modelViewMatrix, projectionMatrix)
            if (projected) {
                if (this.theme === "dark") {
                    ctx.fillStyle = "#ffffff"
                } else {
                    ctx.fillStyle = "#000000"
                }
                ctx.fillText(label, projected[0], projected[1])
            }
        }
    }

    drawCoordinateBox() {
        const { min: xMin, max: xMax } = this.x_range
        const { min: yMin, max: yMax } = this.y_range
        const { min: zMin, max: zMax } = this.z_range
        const boxVertices = [
            xMin, yMin, zMin,
            xMax, yMin, zMin,
            xMax, yMin, zMin,
            xMax, yMax, zMin,
            xMax, yMax, zMin,
            xMin, yMax, zMin,
            xMin, yMax, zMin,
            xMin, yMin, zMin,
            xMin, yMin, zMax,
            xMax, yMin, zMax,
            xMax, yMin, zMax,
            xMax, yMax, zMax,
            xMax, yMax, zMax,
            xMin, yMax, zMax,
            xMin, yMax, zMax,
            xMin, yMin, zMax,
            xMin, yMin, zMin,
            xMin, yMin, zMax,
            xMax, yMin, zMin,
            xMax, yMin, zMax,
            xMax, yMax, zMin,
            xMax, yMax, zMax,
            xMin, yMax, zMin,
            xMin, yMax, zMax,
        ]
        const boxColors = Array(boxVertices.length / 3).fill([0.5, 0.5, 0.5, 1.0]).flat()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxVertices), this.gl.STATIC_DRAW)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxColors), this.gl.STATIC_DRAW)
        const projectionMatrix = this.createProjectionMatrix()
        const modelViewMatrix = this.createModelViewMatrix()
        this.gl.useProgram(this.programInfo.program)
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)
        this.gl.uniform3f(this.programInfo.uniformLocations.minBounds, this.x_range.min, this.y_range.min, this.z_range.min)
        this.gl.uniform3f(this.programInfo.uniformLocations.maxBounds, this.x_range.max, this.y_range.max, this.z_range.max)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor)
        this.gl.drawArrays(this.gl.LINES, 0, boxVertices.length / 3)
    }

    createProjectionMatrix() {
        const fieldOfView = 45 * Math.PI / 180  
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        const zNear = 0.1
        const zFar = 100.0
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
        return projectionMatrix
    }

    createModelViewMatrix() {
        const modelViewMatrix = mat4.create()
        // Position camera
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -20])
        mat4.rotate(modelViewMatrix, modelViewMatrix, -Math.PI / 2, [1, 0, 0])
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotationX, [1, 0, 0])
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotationY, [0, 0, 1])
        const s = 0.9
        mat4.scale(modelViewMatrix, modelViewMatrix, [this.zoomLevel * s, this.zoomLevel * s, this.zoomLevel * s])
        return modelViewMatrix
    }
    
    graphFunction3D(expression, options = {}) {
        try {
            delete calculator.functions["graph3d"]
            if (expression in calculator.functions) {
                calculator.calculate(`graph3d(x, y) = ${expression}(x, y)`, this.calc_options)
            } else {
                calculator.calculate(`graph3d(x, y) = ${expression}`, this.calc_options)
            }
            let result = calculator.calculate("graph3d(1, 1)", this.calc_options)
            if (typeof result !== "number" && !(typeof result === "string" && result.includes("NaN"))) {
                throw result
            }
        } catch (error) {
            return
        }
        const { vertices, colors, indices, wireframeIndices } = this.generateSurfaceData(options)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW)
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW)
        const projectionMatrix = this.createProjectionMatrix()
        const modelViewMatrix = this.createModelViewMatrix()
        this.gl.useProgram(this.programInfo.program)
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        )
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        )
        this.gl.uniform3f(this.programInfo.uniformLocations.minBounds, this.x_range.min, this.y_range.min, this.z_range.min)
        this.gl.uniform3f(this.programInfo.uniformLocations.maxBounds, this.x_range.max, this.y_range.max, this.z_range.max)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, 4, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor)
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_SHORT, 0)
        if (wireframeIndices && wireframeIndices.length > 0) {
            const wireframeBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, wireframeBuffer)
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), this.gl.STATIC_DRAW)
            const wireframeColor = new Float32Array(wireframeIndices.length * 4 / 2)
            for (let i = 0; i < wireframeColor.length; i += 4) {
                wireframeColor[i] = 0    
                wireframeColor[i + 1] = 0 
                wireframeColor[i + 2] = 0
                wireframeColor[i + 3] = 1 
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, wireframeColor, this.gl.STATIC_DRAW)
            this.gl.drawElements(this.gl.LINES, wireframeIndices.length, this.gl.UNSIGNED_SHORT, 0)
        }
    }
    
    generateSurfaceData(options) {
        const intervals = this.function_intervals
        const vertices = []
        const colors = []
        const x_step = (this.x_range.max - this.x_range.min) / intervals
        const y_step = (this.y_range.max - this.y_range.min) / intervals
        let minZ = Infinity
        let maxZ = -Infinity
        const zValues = []
        for (let i = 0; i <= intervals; i++) {
            zValues[i] = []
            const x = this.x_range.min + i * x_step
            for (let j = 0; j <= intervals; j++) {
                const y = this.y_range.min + j * y_step
                let z = null
                try {
                    z = calculator.evaluate(["graph3d", new Paren([x, y])], this.calc_options)
                    if (isNaN(z) || !isFinite(z)) {
                        z = null
                    } else {
                        minZ = Math.min(minZ, z)
                        maxZ = Math.max(maxZ, z)
                    }
                } catch (error) {
                    z = null
                }
                zValues[i][j] = z
            }
        }
        minZ = Math.max(this.z_range.min, minZ)
        maxZ = Math.min(this.z_range.max, maxZ)
        if (maxZ === minZ) {
            minZ -= 1
        }
        for (let i = 0; i <= intervals; i++) {
            const x = this.x_range.min + i * x_step
            for (let j = 0; j <= intervals; j++) {
                const y = this.y_range.min + j * y_step
                const z = zValues[i][j]
                if (z === null) continue
                vertices.push(x, y, z)
                    const baseColor = options.color || { r: 0, g: 0, b: 1 }
                    const normalizedZ = (z - minZ) / (maxZ - minZ) 
                    const r = normalizedZ                    
                    const g = 1 - normalizedZ                   
                    const b = 0.5 + 0.5 * Math.sin(normalizedZ * Math.PI)
                    colors.push(r, g, b, 1.0)
            }
        }
        const triangleIndices = []
        for (let i = 0; i < intervals; i++) {
            for (let j = 0; j < intervals; j++) {
                const topLeft = i * (intervals + 1) + j
                const topRight = topLeft + 1
                const bottomLeft = (i + 1) * (intervals + 1) + j
                const bottomRight = bottomLeft + 1
                const validTopLeft = zValues[i][j] !== null
                const validTopRight = zValues[i][j + 1] !== null
                const validBottomLeft = zValues[i + 1][j] !== null
                const validBottomRight = zValues[i + 1][j + 1] !== null
                if (validTopLeft && validTopRight && validBottomLeft) {
                    triangleIndices.push(topLeft, bottomLeft, topRight)
                }
                if (validTopRight && validBottomLeft && validBottomRight) {
                    triangleIndices.push(topRight, bottomLeft, bottomRight)
                }
            }
        }
        const wireframeIndices = []
        for (let i = 0; i < intervals; i++) {
            for (let j = 0; j < intervals; j++) {
                const topLeft = i * (intervals + 1) + j
                const topRight = topLeft + 1
                const bottomLeft = (i + 1) * (intervals + 1) + j
                const bottomRight = bottomLeft + 1
                const validTopLeft = zValues[i][j] !== null
                const validTopRight = zValues[i][j + 1] !== null
                const validBottomLeft = zValues[i + 1][j] !== null
                const validBottomRight = zValues[i + 1][j + 1] !== null
                if (validTopLeft && validTopRight) wireframeIndices.push(topLeft, topRight)
                if (validTopLeft && validBottomLeft) wireframeIndices.push(topLeft, bottomLeft)
                if (validTopRight && validBottomRight) wireframeIndices.push(topRight, bottomRight)
                if (validBottomLeft && validBottomRight) wireframeIndices.push(bottomLeft, bottomRight)
            }
        }
        return {
            vertices,
            colors,
            indices: triangleIndices, 
            wireframeIndices 
        }
    }

    hexToRgb(hex) {
        const colorMap = {
            "red": { r: 1, g: 0, b: 0 },
            "green": { r: 0, g: 0.8, b: 0 },
            "blue": { r: 0, g: 0, b: 1 },
            "purple": { r: 0.5, g: 0, b: 0.5 },
            "orange": { r: 1, g: 0.5, b: 0 },
            "black": { r: 0, g: 0, b: 0 }
        }
        if (colorMap[hex]) {
            return colorMap[hex]
        }
        if (hex.startsWith("#")) {
            const r = parseInt(hex.slice(1, 3), 16) / 255
            const g = parseInt(hex.slice(3, 5), 16) / 255
            const b = parseInt(hex.slice(5, 7), 16) / 255
            return { r, g, b }
        }
        return { r: 0, g: 0, b: 1 }
    }
    
    setInput(input) {
        this.input.value = input
        this.expressions = this.input.value.split(";").map(e => e.trim()).filter(e => e.length)
        this.drawGraphs()
    }
}