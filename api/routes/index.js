const express = require("express")
const { isDirectoryAvailable } = require("../controllers")

const app = express()


app.route('/check-directory').get(isDirectoryAvailable)

module.exports = app