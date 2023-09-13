// import utility from '../../utility';
// import enums from '../../json/enum.json'
// import messages from '../../json/message.json'
// const JWT_SECRET = process.env.JWT_SECRET;

// import config from "../../config";
// import helpers from "../../helpers";
// import  verifyAccessToken from '../utils/jwt'
const verifyAccessToken = require("../utils/jwt")

module.exports = verifySuperAdmin = (req, res, next) => {
try {
  const token = req.headers.authorization;
  

    if (!token) {
        throw new Error("Please Login");
    }
      req.user = user;

    console.log({ user });
    next();
  } catch (e) {
    res.status(400).json({ e });
    console.log(e);
  }
}