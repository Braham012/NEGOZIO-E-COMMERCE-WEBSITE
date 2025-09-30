const { order } = require("./model");
const { cart } = require("../addtocart/model");
const { Product } = require("../../product/model/productmodel");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");

config({ path: "./../NODE PROJECT/backend/.env" });

const Key = process.env.SECRET;

async function orderbycart(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const email = decoded.email;

    // Fetch cart items and populate product details
    const cartItems = await cart
      .find({ customeremail: email })
      .populate("product");

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ success: false, message: "Cart is empty" });
    }

    // map = to create each order data from cart items
    const ordersData = cartItems.map((item) => ({
      customeremail: email,
      vendoremail: item.product.Vendoremail,
      productID: item.product._id,
      quantity: item.quantity,
      totalamount: item.quantity * item.product.sellingprice,
      orderdate: new Date(),
      deliverydate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "Pending",
    }));

    const createdOrders = await order.insertMany(ordersData);

    await cart.deleteMany({ customeremail: decoded.email });

    return res.status(201).json({
      success: true,
      message: "Order(s) placed successfully",
      orders: createdOrders,
    });
  } catch (error) {
    console.error("Error placing order from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

async function orderbyid(req, res) {
  try {
    const productid = req.params.id;
    const productinfo = await Product.findById(productid);
    if (!productinfo) {
      return res.status(404).json({ message: "Product not found" });
    }
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;

    const orderData = {
      productID: productid,
      vendoremail: productinfo.Vendoremail,
      customeremail: useremail,
      quantity: 1,
      totalamount: productinfo.sellingprice,
      orderdate: new Date(),
      deliverydate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "Pending",
    };
    const newOrder = new order(orderData);
    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

async function getorders(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;

    let ordersList = await order
      .find({ customeremail: useremail, status: { $ne: "Cancelled" } })
      .populate("productID");

    const now = new Date();

    // Update statuses automatically based on days passed
    ordersList.forEach(async (ord) => {
      const orderDate = new Date(ord.orderdate);
      const daysPassed = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      if (daysPassed >= 7 && ord.status !== "Delivered") {
        ord.status = "Delivered";
        await ord.save();
      } else if (daysPassed >= 3 && ord.status === "Pending") {
        ord.status = "Shipped";
        await ord.save();
      }
    });

    res.status(200).json({
      success: true,
      orders: ordersList,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
}

async function vendorgetorders(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const vendoremail = decoded.email;
    const timenow = Date.now();

    const ordersList = await order
      .find({
        vendoremail: vendoremail,
        deliverydate: { $gte: timenow },
      })
      .populate("productID");

    res.status(200).json({
      success: true,
      orders: ordersList,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({
      message: "Error fetching vendor orders",
      error: error.message,
    });
  }
}

async function cancelorder(req, res) {
  try {
    const orderId = req.params.id;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;

    const orderItem = await order.findOneAndUpdate(
      { _id: orderId, customeremail: useremail, status: { $ne: "Cancelled" } },
      { status: "Cancelled" },
      { new: true }
    );

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already cancelled",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: orderItem,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
}

module.exports = {
  orderbycart,
  orderbyid,
  getorders,
  vendorgetorders,
  cancelorder,
};
