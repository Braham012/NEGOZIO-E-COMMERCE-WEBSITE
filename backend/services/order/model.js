const mongoose = require("mongoose");

const orderschema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  vendoremail: {
    type: String,
    required: true,
  },
  customeremail: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  totalamount: {
    type: Number,
    required: true,
  },
  orderdate: {
    type: Date,
    default: Date.now,
  },
  deliverydate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
});

const order = mongoose.model("Order", orderschema, "Orders");

module.exports = { order };
