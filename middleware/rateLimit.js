const accessModel = require("../models/accessModel");

const rateLimit = async (req, res, next) => {
  try {
    const accessDb = await accessModel.findOne({ sessionId: req.session.id });
    if (!accessDb) {
      const accessObj = new accessModel({
        sessionId: req.session.id,
        time: Date.now(),
      });
      await accessObj.save();
      next();
    }
    if (Date.now() - accessDb.time < 700) {
      return res.send({ message: "too many request" });
    } else {
      accessDb.time = Date.now();
      await accessDb.save();
    }
  } catch (error) {
    return res.send({ status: 500, message: "database error", error: error });
  }
  next();
};

module.exports = rateLimit;
