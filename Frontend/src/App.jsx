import { Outlet, Navigate, Route, Routes, useLocation} from "react-router-dom"
import { Home, Profile, Login, Register, ResetPassword } from "./pages";
import { useSelector } from "react-redux";

function Layout() {
  const {user} =  useSelector(state => state.user);
  const location = useLocation()
  // console.log(user);
  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{from:location}} replace />
  )
}

function App() {
  const {theme} = useSelector((state) => state.theme)

  return (
    <div data-theme= {theme} className='w-full min-h-[100vh]'>
      {/* data-theme is an HTML attribute that can hold custom data for an element. we have provided the colour in index.css  */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </div>
  )
}

export default App
