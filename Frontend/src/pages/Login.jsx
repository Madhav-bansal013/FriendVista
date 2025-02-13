import { TbSocial } from "react-icons/tb";
import { CustomButton, Loading, TextInput } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { BgImage } from "../assets/index.js";
import { BsShare } from "react-icons/bs";
import { AiOutlineInteraction } from "react-icons/ai";
import { ImConnection } from "react-icons/im";
import { apiRequest } from "../utils/index.js";
import { UserLogin } from "../redux/userSlice.js";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  // onChange	string	Validation is triggered on the changeevent for each input, leading to multiple re-renders. Warning: this often comes with a significant impact on performance.

  const [errMsg, setErrMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const res = await apiRequest({
        url: "/auth/login",
        data: data,
        method: "POST",
      });

      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setErrMsg("");

        const newData = { token: res?.token, ...res?.user };
        dispatch(UserLogin(newData)); // dispatch action and store in redux
        window.location.replace("/");
      }

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bgColor w-full h-[100vh] flex items-center justify-center p-6">
      <div
        className="w-full md:w-2/3 h-fit lg:h-full 2xl:h-5/6 py-8 lg:p-0
      flex bg-primary rounded-xl overflow-hidden shadow- xl"
      >
        {/* left form and logo */}

        <div className="w-full lg:w-1/2 h-full p-10 flex flex-col justify-center">
          <div className="w-full flex gap-2 items-center mb-6">
            <div className="p-2 bg-pink rounded text-white">
              <TbSocial />
            </div>
            <span className="text-2xl text-pink font-semibold">
              FriendVista
            </span>
          </div>

          <p className="text-base text-ascent-1 font-semibold">
            Log in to your account{" "}
          </p>
          <span className="text-ascent-2 mt-2 text-sm">Welcome Back!</span>

          <form
            className="py-8 flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name="email"
              placeholder="xyz123@gmail.com"
              label="Email Address"
              type="email"
              register={register("email", {
                required: "Email is required",
              })}
              styles="w-full rounded-full"
              labelStyles="ml-2"
              error={errors.email ? errors.email.message : ""}
            />
            <TextInput
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
              register={register("password", {
                required: "Password is required",
              })}
              styles="w-full rounded-full"
              labelStyles="ml-2"
              error={errors.password ? errors.password.message : ""}
            />

            <Link
              to="/reset-password"
              className="text-right text-sm text-pink font-semibold"
            >
              Forgot Password ?
            </Link>

            {errMsg?.message && (
              <span
                role="alert"
                className={`text-sm ${
                  errMsg?.status == "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                } mt-1`}
              >
                {errMsg?.message}
              </span>
            )}

            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                title="Login"
                containerStyles={
                  "inline-flex justify-center rounded-md bg-pink px-8 py-3 text-sm outline-none text-white font-medium"
                }
              />
            )}
          </form>

          <p className="text-ascent-2 text-sm text-center">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Don't have an account?
            <Link
              to="/register"
              className="text-pink font-semibold ml-2 cursor-pointer"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* right img */}

        <div className="hidden w-1/2 h-full lg:flex flex-col items-center justify-center bg-pink">
          <div className="relative w-full flex items-center justify-center">
            <img
              src={BgImage}
              alt="Bg Image"
              className="w-48 2xl:w-64 h-48 2xl:h-64 rounded-full object-cover"
            />

            <div className="absolute flex items-center gap-1 bg-white right-10 top-10 py-2 px-5 rounded-full">
              <BsShare size={14} />
              <span className="text-xs font-medium">Share</span>
            </div>

            <div className="absolute flex items-center gap-1 bg-white left-10 top-6 py-2 px-5 rounded-full">
              <ImConnection />
              <span className="text-xs font-medium">Connect</span>
            </div>

            <div className="absolute flex items-center gap-1 bg-white left-12 bottom-6 py-2 px-5 rounded-full">
              <AiOutlineInteraction />
              <span className="text-xs font-medium">Interact</span>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-white text-base">
              Connect with friends and share for fun!
            </p>
            <span className="text-sm text-white/80">
              Share memories with friends in the world.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
