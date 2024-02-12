const express = require("express");
const router = express.Router();
const tryCatch = require("../utils/tryCatch");
const passport = require("passport");
const Joi = require("joi");
const validateRequest = require("../middleware/validateRequest");
const {
  createParty,
  getParty,
  leaveParty,
  getParties,
} = require("../controllers/partyController");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  validateRequest(Joi.object({ name: Joi.string().required().max(10) })),
  tryCatch(createParty)
);

router.get(
  "/:code",
  passport.authenticate("jwt", { session: false }),
  tryCatch(getParty)
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  tryCatch(getParties)
);

router.post(
  "/leave/:id",
  passport.authenticate("jwt", { session: false }),
  tryCatch(leaveParty)
);

module.exports = router;
