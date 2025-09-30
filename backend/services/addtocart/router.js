const express = require("express");
const {
  addtocart,
  getcart,
  removefromcart,
  changequantity,
} = require("./controller");

const Servicerouter = express.Router();

Servicerouter.post("/addtocart/:id", addtocart);
Servicerouter.get("/getcart", getcart);
Servicerouter.delete("/remove/:id", removefromcart);
Servicerouter.put("/changequantity/:id", changequantity);

module.exports = { Servicerouter };
