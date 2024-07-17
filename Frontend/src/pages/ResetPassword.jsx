import { useState } from "react";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import { apiRequest } from "../utils";

const ResetPassword = () => {
  const [errMsg, setErrMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleResetSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const res = await apiRequest({
        url: "/users/request-passwordreset",
        data: data,
        method: "POST",
      });
      console.log(res);

      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setErrMsg(res);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full h-[100vh] bg-bgColor flex items-center justify-center p-6">
      <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 py-8 px-6 shadow-md rounded-lg">
        <p className="text-ascent-1 text-lg font-semibold">Email address</p>
        <span className="text-ascent-2 text-sm">
          Email address used during registration
        </span>

        <form
          className="py-4 flex flex-col gap-5"
          onSubmit={handleSubmit(handleResetSubmit)}
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
              title="Submit"
              containerStyles={
                "inline-flex justify-center rounded-md bg-pink px-8 py-3 text-sm outline-none text-white font-medium"
              }
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
