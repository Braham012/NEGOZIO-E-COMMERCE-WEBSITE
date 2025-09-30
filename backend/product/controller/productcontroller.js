const { Product } = require("../model/productmodel");
const { cloudinary } = require("./../../utilis/cloudinary");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
const { get } = require("http");

config({ path: "./../NODE PROJECT/backend/.env" });
const Key = process.env.SECRET;

async function addproduct(req, res) {
  try {
    const {
      name,
      producttype,
      shortdescription,
      description,
      sellingprice,
      discount,
      category: initialcategory,
      promotion,
    } = req.body;
    if (
      !name ||
      !producttype ||
      !shortdescription ||
      !description ||
      !sellingprice
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files;
    const imageUrls = [];
    for (const image of images) {
      const localPath = image.path;
      const result = await cloudinary.uploader.upload(localPath);
      imageUrls.push(result.secure_url);

      fs.unlink(localPath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${image.path}`, err);
        } else {
          console.log(`Successfully deleted file: ${image.path}`);
        }
      });
    }
    const category = initialcategory.trim();
    const token = req.cookies.token;
    let decoded;
    try {
      decoded = jwt.verify(token, Key);
    } catch (error) {
      console.log(error);
      return res.status(500).send("error while decoding");
    }
    const soldby = decoded.shopname;
    const Vendoremail = decoded.email;
    const newProduct = new Product({
      name,
      producttype,
      shortdescription,
      description,
      sellingprice,
      discount,
      images: imageUrls,
      category,
      soldby,
      Vendoremail,
      promotion,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
}

async function getProducts(req, res) {
  try {
    const products = await Product.find({ promotion: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
}

async function getproductsbycategory(req, res) {
  try {
    const name = req.params.category;
    const products = await Product.find({ category: name });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
}

async function getproductdetail(req, res) {
  try {
    const id = req.params.id;
    const productinfo = await Product.findById(id);
    res.status(200).json(productinfo);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching product info",
      error: error.message,
    });
  }
}

async function getproductbyemail(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, Key);
    } catch (error) {
      return res.status(500).send("error while decoding");
    }
    const shopname = decoded.shopname;
    const Vendoremail = decoded.email;

    const products = await Product.find({ Vendoremail: Vendoremail });

    res.status(200).json({ products, shopname });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({});
  }
}

async function modifyproduct(req, res) {
  try {
    const productId = req.params.id;
    const {
      name,
      producttype,
      shortdescription,
      description,
      sellingprice,
      discount,
      category,
      promotion,
    } = req.body;

    if (
      !name ||
      !producttype ||
      !shortdescription ||
      !description ||
      !sellingprice ||
      !category
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.name = name;
    product.producttype = producttype;
    product.shortdescription = shortdescription;
    product.description = description;
    product.sellingprice = sellingprice;
    product.discount = discount;
    product.category = category;
    product.promotion = promotion;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error modifying product:", error);
    res.status(500).json({
      message: "Error modifying product",
      error: error.message,
    });
  }
}

async function getvendorproductinfo(req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product info:", error);
    res.status(500).json({
      message: "Error fetching product info",
      error: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const publicId = image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}

async function searchProduct(req, res) {
  try {
    const searchWord = req.query.q;

    const products = await Product.find({
      $or: [
        { producttype: { $regex: searchWord, $options: "i" } },
        { name: { $regex: searchWord, $options: "i" } }, // i = ignore case (Shoes = shoes)
        { category: { $regex: searchWord, $options: "i" } },
        { shortdescription: { $regex: searchWord, $options: "i" } },
        { description: { $regex: searchWord, $options: "i" } },
      ],
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error while searching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
}

module.exports = {
  addproduct,
  getProducts,
  getproductsbycategory,
  getproductdetail,
  getproductbyemail,
  getvendorproductinfo,
  modifyproduct,
  searchProduct,
  deleteProduct,
};
