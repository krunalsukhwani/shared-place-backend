const express = require("express");
const { check } = require("express-validator");
const placesControllers = require('../controllers/places-controllers');
const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.post("/", 
        [
            check("title").not().isEmpty(),
            check("description").isLength({min: 5}),
            check("address").not().isEmpty()
        ]
        ,placesControllers.createPlace);

router.delete("/:pid", placesControllers.deletePlace);

router.patch("/:pid", 
        [
            check("title").not().isEmpty(),
            check("description").isLength({min: 5})
        ],
        placesControllers.updatePlace);

module.exports = router;
