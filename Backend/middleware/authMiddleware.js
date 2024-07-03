import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  //we take authorization from req.header
  const authHeader = req?.headers?.authorization;

  //check for bearer token
  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    next("Authentication== failed");
  }
  console.log(authHeader);
  const token = authHeader?.split(" ")[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(userToken);

    req.body.user = {
      userId: userToken.userId,
    };

    next();
  } catch (error) {
    console.log(error);
    next("Authentication failed");
  }
};

export default userAuth;
