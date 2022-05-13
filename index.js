// index.js

const express = require("express")
const path = require("path")
const dotenv = require("dotenv")

// Initial
const app = express()
dotenv.config()

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Port
const PORT = process.env.PORT || 5000
console.log(PORT)
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))