const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  producttype: {
    type: String,
    required: true,
  },
  shortdescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sellingprice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  images: {
    type: [String],
  },
  soldby: {
    type: String,
  },
  Vendoremail: {
    type: String,
  },
  promotion: {
    type: Boolean,
  },
  category: {
    type: String,
    enum: [
      "Electronic",
      "Men Section",
      "Women Section",
      "Kids Section",
      "Watches",
      "Footwear",
      "Accessories",
    ],
  },
});

const Product = mongoose.model("Product", productSchema, "Productinfo");
module.exports = { Product };
