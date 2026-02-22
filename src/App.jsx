import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import Vc from "./pages/Vc";
import Connect from "./pages/Connect";
import About from "./pages/About";
import CreateBlog from "./pages/CreateBlog";
import Blogs from "./pages/Blogs";


function AppRoutes() {
  const location = useLocation();
  const background = location.state && location.state.background;
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />

        <Route
          path="/explore"
          element={
            isAuthenticated ? <Explore /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/create-profile"
          element={
            isAuthenticated ? <CreateProfile /> : <Navigate to="/login" replace />
          }
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/create-blog" element={<CreateBlog />} />
        <Route path="/vc" element={<Vc />} />
        <Route path="/connect" element={<Connect />} />
         <Route path="/about" element={<About />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
}

const App = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
};

export default App;
