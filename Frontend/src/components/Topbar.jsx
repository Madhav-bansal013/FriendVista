import React from 'react'
import { useForm } from 'react-hook-form'
import { TbSocial } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import TextInput from './TextInput'
import CustomButton from './CustomButton'
import { BsMoon, BsSunFill} from 'react-icons/bs'
import { IoMdNotificationsOutline } from "react-icons/io";
import { SetTheme } from '../redux/theme'
import { Logout } from '../redux/userSlice'

function Topbar() {
    const {theme} = useSelector(state => state.theme)
    const {user} =useSelector(state => state.user)

    const handleTheme = () => {
        const themeValue = (theme === "light" ? "dark" : "light")
        dispatch(SetTheme(themeValue));

    }
    const {register, handleSubmit, formState: {errors}} = useForm()

    const handleSearch = async (data) => {}

    const dispatch = useDispatch()
  return (
    <div className='topbar w-full flex items-center justify-between py-3 px-4 md:py-6 bg-primary'>

        <Link to="/" className='flex gap-2 items-center'>
            <div className='p-1 md:p-2 rounded text-white bg-pink'>
                <TbSocial />
            </div>
            <span className='text-xl text-pink md:text-2xl font-semibold'>
                FriendVista
            </span>
        </Link>

        <form 
        className='hidden md:flex items-center justify-center'
        onSubmit={handleSubmit(handleSearch)}>
            <TextInput
            placeholder = "Search..."
            styles = "w-[20rem] lg:w-[30rem] xl:w-[40rem] rounded-l-full py-3"
            register = {register("search")}
            />

            <CustomButton
            title = "Search"
            type = "submit"
            containerStyles= "bg-pink text-white px-6 py-2.5 mt-2 rounded-r-full"
            />
        </form>

        {/*theme icons */}
        <div className="flex gap-4 items-center text-ascent-1 text-md md:text-xl">
            <button onClick={() => handleTheme()}>{theme==="light" ? <BsMoon/> : <BsSunFill/>}</button>
            <div className='hidden lg:flex'>
            <IoMdNotificationsOutline />
            </div>

            <div>
                <CustomButton
                onClick={()=> dispatch(Logout())}
                title = "Log Out"
                containerStyles = "text-sm text-ascent-1 px-4 md:px-5 py-1 md:py-2 border border-[#666] rounded-full"
                />
            </div>
        </div>

    </div>
  )
}

export default Topbar
