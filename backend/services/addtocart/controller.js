const { Product } = require("../../product/model/productmodel");
const { cart } = require("./model");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");

config({ path: "./../NODE PROJECT/backend/.env" });
const Key = process.env.SECRET;

async function addtocart(req, res) {
  try {
    const id = req.params.id;
    const productinfo = await Product.findById(id);
    if (!productinfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;

    // Check if product is already in the cart for this user
    let existingCartItem = await cart.findOne({
      product: id,
      customeremail: useremail,
    });

    if (existingCartItem) {
      // Increase quantity if already in cart
      existingCartItem.quantity += 1;
      await existingCartItem.save();
    } else {
      // Otherwise add new cart item
      const addtocart = new cart({
        product: id,
        customeremail: useremail,
        vendoremail: productinfo.Vendoremail,
        quantity: 1,
      });
      await addtocart.save();
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully to cart",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
}

async function getcart(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;

    const cartitems = await cart
      .find({ customeremail: useremail })
      .populate("product");

    if (cartitems.length === 0) {
      return res.json({
        success: true,
        cartitems: [],
      });
    }

    res.status(200).json({
      success: true,
      cartitems, // now with populated product info
    });
  } catch (error) {
    console.error("Error fetching cart", error);
    res.status(500).json({
      message: "Error fetching cart",
      error: error.message,
    });
  }
}

async function removefromcart(req, res) {
  try {
    const id = req.params.id;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;
    const cartItem = await cart.findOneAndDelete({
      _id: id,
      customeremail: useremail,
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing item from cart", error);
    res.status(500).json({
      message: "Error removing item from cart",
      error: error.message,
    });
  }
}

async function changequantity(req, res) {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, Key);
    const useremail = decoded.email;
    const cartItem = await cart.findOne({
      _id: id,
      customeremail: useremail,
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error changing quantity", error);
    res.status(500).json({
      message: "Error changing quantity",
      error: error.message,
    });
  }
}

module.exports = { addtocart, getcart, removefromcart, changequantity };
