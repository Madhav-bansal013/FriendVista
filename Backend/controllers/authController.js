import Users from "../models/userModel.js";
import { compareString, createJWT, hashedString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  //middleware fnc

  //next allows you to pass control to the next middleware function in the stack.
  const { firstName, lastName, email, password } = req.body;

  if (!(firstName || lastName || email || password)) {
    next("Provide required fields!");
    return;
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Adress already exists");
      return;
    }

    const hashedPassword = await hashedString(password); //call fnc that we have created in utils

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    //send email for verification before login
    sendVerificationEmail(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("Please provide user credentials");
      return;
    }

    const user = await Users.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    }); //do not select password of friends +password is used because if we have select:false in mongo model then it will always remove password so we have explicitly use this

    //Populate is used to fetch data from other model. path is used to tell with field to populate and select is used to select only particular fields

    if (!user) {
      next("Invalid email or password");
      return;
    }

    //if user is not verified
    if (!user?.verified) {
      next("User email is not verified check email for verification");
      return;
    }

    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      next("Invalid email or password");
      return;
    }

    user.password = undefined; //we didnot want to send password to frontend

    const token = createJWT(user?._id); //create jwt token

    res.status(201).json({
      success: true,
      message: "Login successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
