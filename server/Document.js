const { Schema, model } = require("mongoose")

const Doc = new Schema({
  _id: String,
  data: Object,
})

module.exports = model("Doc", Doc)