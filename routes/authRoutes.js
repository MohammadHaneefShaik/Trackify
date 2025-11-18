const express = require("express");
const { handleUserSignUp, handleUserLogin } = require("../controllers/authControllers");
const Bus = require("../models/Bus");
const Stop = require("../models/Stop");
const {alreadyLoggedIn} = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", handleUserSignUp);
router.post("/login", handleUserLogin);


router.get("/login",alreadyLoggedIn, (req, res) => {
  res.render("layout", {
    title: "Login",
    page: "login"
  });
});

router.get("/signup",alreadyLoggedIn, async (req, res) => {
  const buses = await Bus.find();
  const stops = await Stop.find();
  res.render("layout", {
    title: "Signup",
    page: "signup",
    buses, stops
  });
});


module.exports = router;
