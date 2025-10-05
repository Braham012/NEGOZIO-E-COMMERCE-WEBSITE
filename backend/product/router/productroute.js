const express = require("express");
const {
  addproduct,
  getProducts,
  getproductsbycategory,
  getproductdetail,
  getproductbyemail,
  modifyproduct,
  deleteProduct,
  getvendorproductinfo,
  searchProduct,
} = require("../controller/productcontroller");
const { upload } = require("../middleware/multer");

const Router = express.Router();

Router.post("/addproduct", upload.array("images", 6), addproduct);
Router.get("/getproduct", getProducts);
Router.get("/getproductbycategory/:category", getproductsbycategory);
Router.get("/getproductdetail/:id", getproductdetail);
Router.get("/getdetails", getproductbyemail);
Router.put("/update/:id", modifyproduct);
Router.delete("/delete/:id", deleteProduct);
Router.get("/vendorproductinfo/:id", getvendorproductinfo);
Router.get("/search", searchProduct);

module.exports = { Router };
