const express = require('express');
const errorsController = require("../controllers/errors");

const router = express.Router();

router.get("*", errorsController.get404Page);

router.get("/500", errorsController.get500Page);
module.exports = router;
