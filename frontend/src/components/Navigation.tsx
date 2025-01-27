import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navigation() {
  const isAuthenticated = false;
  function onLogout() {}
  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <Link to={"/"}>
              <span className="ml-2 text-xl font-bold text-gray-900">
                SecureChat
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to={"/login"}
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to={"/register"}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
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
