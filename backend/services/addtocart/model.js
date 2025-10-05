const mongoose = require("mongoose");

const cartschema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    default: 1,
  },
  customeremail: {
    type: String,
    required: true,
  },
  vendoremail: {
    type: String,
    required: true,
  },
});

const cart = mongoose.model("Cart", cartschema, "Customer Cart");

module.exports = { cart };
