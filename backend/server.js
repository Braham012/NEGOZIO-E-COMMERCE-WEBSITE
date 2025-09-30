const express = require("express");

const { connectdb } = require("./utilis/db");
const { router } = require("./userauthentication/routes/userroutes");
const { routers } = require("./vendorauthentication/routes/vendorroutes");
const { Router } = require("./product/router/productroute");
const { Servicerouter } = require("./services/addtocart/router");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const { config } = require("dotenv");
const { orderrouter } = require("./services/order/router");

config({ path: "./../NODE PROJECT/backend/.env" });

const app = express();
app.use(express.json()); //middleware to parse JSON bodies
app.use(cors({ origin: "http://localhost:5500", credentials: true })); //middleware to enable CORS
app.use(cookieparser()); //middleware to parse cookies

app.use("/user", router);
app.use("/vendor", routers);
app.use("/product", Router);
app.use("/cart", Servicerouter);
app.use("/order", orderrouter);

connectdb();
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
