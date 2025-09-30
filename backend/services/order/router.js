const express = require("express");
const {
  orderbycart,
  getorders,
  orderbyid,
  cancelorder,
  vendorgetorders,
} = require("./controller");

const orderrouter = express.Router();

orderrouter.post("/orderbycart", orderbycart);
orderrouter.post("/orderbyid/:id", orderbyid);
orderrouter.get("/getorders", getorders);
orderrouter.put("/cancelorder/:id", cancelorder);
orderrouter.get("/vendororders", vendorgetorders);

module.exports = { orderrouter };
