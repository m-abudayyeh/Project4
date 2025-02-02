import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Search, Menu, X, Bell, User } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  useEffect(() => {
    // Check if the browser supports notifications
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast.success("Notification permission granted!");
        } else {
          toast.warn("Notification permission denied.");
        }
      });
    } else {
      toast.error("This browser does not support notifications.");
    }
  };

  const showNotification = () => {
    if (notificationPermission === "granted") {
      new Notification("Task Manager", {
        body: "You have a new task assigned!",
        icon: "/path/to/icon.png", // Replace with your icon path
      });
    } else {
      toast.warn("Please enable notifications to see alerts.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out: " + error.message);
    }
  };

  return (
    <nav className="backdrop-blur-md bg-white/70 sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link to="/" className="relative group flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
              <span className="text-white font-bold text-xl">TM</span>
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              Task Manager
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex space-x-6">
              {["About", "Contact", "Articles"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="relative group py-2 text-gray-600"
                >
                  <span className="relative z-10">{item}</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div
              className={`hidden lg:block relative ${
                isSearchActive ? "w-64" : "w-48"
              } transition-all duration-300`}
            >
              <input
                type="text"
                placeholder="Search tasks..."
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
                className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 rounded-full border-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={requestNotificationPermission}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3">
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-700">
                      Welcome&nbsp;
                      {user.displayName || user.firstName}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to="/profile"
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <User className="h-5 w-5 text-gray-600" />
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-4">
            <div className="flex flex-col space-y-4">
              {["About", "Contact", "Articles"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="relative px-4">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-50 rounded-full border-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
