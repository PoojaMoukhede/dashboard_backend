const jwt = require("jsonwebtoken")
module.exports =  generateTokens =(user)=> {

    try {
      const accessToken = jwt.sign({ user }, config.jwtSecret, { expiresIn: "60min" });
       const refreshToken = jwt.sign({ user }, config.jwtSecret, { expiresIn: "1day" });
   
      return { accessToken, refreshToken };
      
    } catch (err) {
  
        throw new Error(err);
      
    }
}
  // Function to verify the access token
module.exports =  verifyAccessToken=(accessToken)=> {
    try {
  
      const decoded = jwt.verify(accessToken.split(" ")[1], config.jwtSecret);
      // const decoded = jwt.verify(accessToken, config.jwtSecret);
      return decoded.user;
    } catch (err) {
  
        throw new Error(err);
  }
}