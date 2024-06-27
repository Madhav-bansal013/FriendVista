import { useSelector } from 'react-redux'
import { CustomButton, EditProfile, FriendsCard, Loading, PostCard, ProfileCard, TextInput, Topbar } from '../components';
import { posts, requests, suggest } from '../assets/data';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NoProfile } from '../assets';
import { BsFiletypeGif, BsPersonFillAdd } from 'react-icons/bs';
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useForm } from 'react-hook-form';

const Home = ()=> {
  const {user} =  useSelector(state => state.user);

  const [errMsg , setErrMsg] = useState("")

  const [friendRequest, setFriendRequest] = useState(requests);

  const [suggestedFriends, setSuggestedFriends] = useState(suggest)
  
  const [file , setFile] = useState(null)

  const [posting, setPosting] = useState(false)
  
  const [loading, setLoading] = useState(false)
  
  const {register , handleSubmit, formState : {errors} } = useForm()
  
  //register and handleSubmit all are events we don't have to manage state we give register in input so it takes all values from input and trigger jandle submit 
  
  const handlePostSubmit = async(data) => {}
  
  return (
    <>
      <div className='w-full px-0 lg:px-10 2xl:px-40 pb-20 bg-bgColor h-screen overflow-hidden'>
      <Topbar/>
    
    <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
      {/* left */}
      
      <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
        <ProfileCard user = {user} />
        <FriendsCard friends = {user?.friends}/>
      </div>
      
      {/* center */}
      
      <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
        <form 
        onSubmit = {handleSubmit(handlePostSubmit)}
        className='bg-primary px-4 rounded-lg'>
          <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
            <img src={user?.profileUrl ?? NoProfile} alt="User Img"
            className='w-14 h-14 object-cover rounded-full'/>

            <TextInput
            styles = "w-full rounded-full py-5"
            placeholder = "What's on your mind..."
            name="description"
            register = {register("description" , {
              required: "Write something about post",
            })} 
            error = {errors.description ? errors.description.message : ""}/>
          </div>
          {errMsg?.message && (
                <span
                  role='alert'
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-1`}
                >
                  {errMsg?.message}
                </span>
              )}

          <div className='flex items-center justify-between py-4'>
            <label 
            htmlFor="imgUpload" 
            className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'>
              <input 
              type='file'
              onChange={(e) => setFile (e.target.files[0]) }
              className='hidden'
              id='imgUpload'
              data-max-size = '5120'
              accept='.jpg , .png, .jpeg' />
              <BiImages/>
              <span>Image</span>
            </label>

            <label
            className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
            htmlFor='videoUpload'
            >
                  <input
                    type='file'
                    data-max-size='5120'
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='videoUpload'
                    accept='.mp4, .wav'
                  />
                  <BiSolidVideo />
                  <span>Video</span>
            </label>

            <label
              className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
              htmlFor='vgifUpload'
                >
                  <input
                    type='file'
                    data-max-size='5120'
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='vgifUpload'
                    accept='.gif'
                  />
                  <BsFiletypeGif />
                  <span>Gif</span>
            </label>

            <div>
            {posting ? (
              <Loading/>
            ) : (
              <CustomButton
              type="submit"
              title="Post"
              containerStyles="bg-pink text-white py-1 px-6 text-sm rounded-full font-semibold"
              />
            )}
            </div>
          </div> 
        </form>

        {
          loading ? (<Loading/>) : posts?.length > 0 ? (
            posts?.map((post) => (
              <PostCard 
              key= {post?._id} 
              post= {post}
              user= {user}
              deletePost = {() => {}}
              likePost = {() => {}}
              />
            ))
          ) : (
            <div className='flex w-full h-full items-center justify-center'>
              <p className='text-lg text-ascent-2'>
                No Post Available
              </p>
            </div>
          )
        }

      </div>
      
      {/* right */}
      
      <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
        {/* Friend request section*/}

        <div className='w-full bg-primary shadow-md rounded-lg px-6 py-5'>
          <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645] pb-2'>
            <span>Friend Request</span>
            <span>{friendRequest?.length}</span>
          </div>

          <div className='w-full flex flex-col gap-5 pt-4'>
            {friendRequest?.map(({_id, requestFrom: from})=>(
              <div key={_id} className="flex items-center justify-between">
                <Link to={"/profile/" + from._id}
                className='w-full flex items-center cursor-pointer gap-3'>
                  <img src={from?.profileUrl ?? NoProfile} alt={from?.firstName} className="w-10 h-10 object-cover rounded-full" />

                  <div className="flex-1">
                    <p className='text-base font-medium text-ascent-1'>
                      {from?.firstName} {from?.lastName}
                    </p>
                    <span className='text-sm text-ascent-2'>
                      {from?.profession ?? "No profession"}

                    </span>
                  </div>
                </Link>

                <div className='flex gap-2'>
                  <CustomButton
                  title= "Accept"
                  containerStyles= "bg-pink text-xs text-white px-2 py-1 rounded-full"
                  />

                  <CustomButton
                  title= "Deny"
                  containerStyles= "border border-[#666] text-xs text-ascent-1 px-2 py-1 rounded-full"
                  />
                </div>

              </div>
            ))
            }
          </div>
        </div>

        {/* suggested friends section */}

        <div className='w-full bg-primary shadow-md rounded-lg px-6 py-5'>
          <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645] pb-2'>
            <span>Friend Suggestion</span>
          </div>

          <div className='w-full flex flex-col'>
            {suggestedFriends?.map((suggest) => (
              <div className="flex items-center justify-between pt-4"
              key={suggest?._id}>
                <Link to={"/profile/" + suggest._id}
                className='w-full flex items-center cursor-pointer gap-3'>
                  <img src={suggest?.profileUrl ?? NoProfile} alt={suggest?.firstName} className="w-10 h-10 object-cover rounded-full" />

                  <div className="flex-1">
                    <p className='text-base font-medium text-ascent-1'>
                      {suggest?.firstName} {suggest?.lastName}
                    </p>
                    <span className='text-sm text-ascent-2'>
                      {suggest?.profession ?? "No profession"}

                    </span>
                  </div>
                </Link>

                <div className=''>
                  <button
                  className='bg-[#FFA9D4] p-1 rounded-lg'
                  onClick={() => {}}
                  >
                    <BsPersonFillAdd size={20} className='text-[#FF2994]'/>
                  </button>
                </div>

              </div>

            ))
            }

          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  )
}

export default Home
