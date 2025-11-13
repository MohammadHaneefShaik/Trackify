const express = require("express");
const { handleUserSignUp, handleUserLogin } = require("../controllers/authControllers");
const Bus = require("../models/Bus");
const Stop = require("../models/Stop");

const router = express.Router();

router.post("/signup", handleUserSignUp);
router.post("/login", handleUserLogin);


router.get("/login", (req, res) => {
  res.render("layout", {
    title: "Login",
    page: "login"
  });
});

router.get("/signup", async (req, res) => {
  const buses = await Bus.find();
  const stops = await Stop.find();
  res.render("layout", {
    title: "Signup",
    page: "signup",
    buses, stops
  });
});


module.exports = router;
