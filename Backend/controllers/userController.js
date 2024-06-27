import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString } from "../utils/index.js";
import PasswordReset from "../models/passwordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;
      //check token expiry
      if (expiresAt < Date.now()) {
        //if expired remove data from both model
        Verification.findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired!";

                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((err) => {
                res.redirect(`/users/verified?status=error&message=`);
              });
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`/users/verified?message=`);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true }) //if token match delete the data in verification model
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              // invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid link. Try again later";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/users/verified?message=`);
  }
};

export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Email not found",
      });
    }
    const existingReq = await PasswordReset.findOne({ email });

    if (existingReq) {
      if (existingReq.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "pending",
          message: "Reset password link has already been sent to your email",
        });
      }
      //if reset req expires than delete req
      await PasswordReset.findOneAndDelete({ email });
    }
    //if reset req did not exist then send
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
