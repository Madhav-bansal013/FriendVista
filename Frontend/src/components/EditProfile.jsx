import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProfile, UserLogin } from "../redux/userSlice";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import Loading from "./Loading";
import { apiRequest, handleFileUpload } from "../utils";

const EditProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      const uri = picture && (await handleFileUpload(picture));

      const { firstName, lastName, profession, location } = data;

      const res = await apiRequest({
        url: "/users/update-user",
        data: {
          firstName,
          lastName,
          profession,
          location,
          profileUrl: uri ? uri : user?.profileUrl, //send updated profile or the old one if not
        },
        method: "PATCH",
        token: user?.token, //send token
      });

      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setErrMsg(res);
        const newUser = { token: res?.token, ...res?.user };
        dispatch(UserLogin(newUser));

        setTimeout(() => {
          dispatch(UpdateProfile(false));
        }, 1000);
      }

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(UpdateProfile(false));
  };

  const handleSelect = (e) => {
    setPicture(e.target.files[0]);
  };

  return (
    <>
      <div className="flex z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-[#000] opacity-70">
              {/* absolute inset-0 is positioned absolutely within the nearest positioned ancestor (in this case, the fixed outer <div>). */}
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            <div
              className="inline-block align-bottom bg-primary rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {/* Accessibility: The role, aria-modal, and aria-labelledby attributes make the modal accessible to users with disabilities by providing context and control over how the modal is perceived and interacted with by assistive technologies. */}
              <div className="flex justify-between px-6 pt-5 pb-2">
                <label
                  htmlFor="name"
                  className="block font-medium text-xl text-ascent-1 text-left"
                >
                  Edit Profile
                </label>
                <button className="text-ascent-1" onClick={handleClose}>
                  <MdClose size={22} />
                </button>
              </div>

              <form
                className="px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <TextInput
                  name="firstName"
                  label="First Name"
                  placeholder="First Name"
                  type="text"
                  styles="w-full rounded-full"
                  register={register("firstName", {
                    required: "First Name is required!",
                  })}
                  error={errors.firstName ? errors.firstName?.message : ""}
                />

                <TextInput
                  label="Last Name"
                  placeholder="Last Name"
                  type="lastName"
                  styles="w-full rounded-full"
                  register={register("lastName", {
                    required: "Last Name do no match",
                  })}
                  error={errors.lastName ? errors.lastName?.message : ""}
                />

                <TextInput
                  name="profession"
                  label="Profession"
                  placeholder="Profession"
                  type="text"
                  styles="w-full rounded-full"
                  register={register("profession", {
                    required: "Profession is required!",
                  })}
                  error={errors.profession ? errors.profession?.message : ""}
                />

                <TextInput
                  label="Location"
                  placeholder="Location"
                  type="text"
                  styles="w-full rounded-full"
                  register={register("location", {
                    required: "Location do no match",
                  })}
                  error={errors.location ? errors.location?.message : ""}
                />

                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    id="imgUpload"
                    onChange={(e) => handleSelect(e)}
                    accept=".jpg, .png, .jpeg"
                  />
                </label>

                {errMsg?.message && (
                  <span
                    role="alert"
                    className={`text-sm ${
                      errMsg?.status === "failed"
                        ? "text-[#f64949fe]"
                        : "text-[#2ba150fe]"
                    } mt-0.5`}
                  >
                    {errMsg?.message}
                  </span>
                )}

                <div className="py-4 sm:flex sm:justify-end border-t border-[#66666645]">
                  {isSubmitting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type="submit"
                      containerStyles={`inline-flex justify-center rounded-md bg-pink px-8 py-3 text-sm font-medium text-white outline-none`}
                      title="Submit"
                    />
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
