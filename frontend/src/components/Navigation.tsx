import { MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import api from "../services/api";
import Avatar from "./Avatar";
// import { useEffect } from "react";

export default function Navigation() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const user = 
  //   setUser(JSON.parse(localStorage.getItem("user")!));
  // }, [dispatch]);

  const handleLogout = async () => {
    await api.post("/logout");
    dispatch(logout());
    navigate("/");
  };

  // Function to check if the link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <Link to="/">
              <span className="ml-2 text-xl font-bold">SecureChat</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/chat"
                  className={`${
                    isActive("/chat")
                      ? "text-blue-700 font-semibold"
                      : "text-blue-600"
                  } hover:underline`}
                >
                  Chat
                </Link>
                <Link to="/profile">
                  <div className="flex items-center space-x-2">
                    <Avatar
                      src={user?.avatar}
                      alt={`${user?.name} avatar`}
                      height="20"
                      width="20"
                    />
                    <span
                      className={`text-sm font-medium ${
                        isActive("/profile") ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {user?.name}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md font-medium border transition duration-300 ${
                    isActive("/login")
                      ? "bg-blue-700 text-white"
                      : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-md font-medium transition duration-300 ${
                    isActive("/register")
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
