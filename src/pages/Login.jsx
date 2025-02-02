import { useState } from "react";
import { auth, db, googleProvider } from "../firebase"; // Ensure `db` and `googleProvider` are imported
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  getIdToken,
  signInWithPopup, // Add this for Google Sign-In
} from "firebase/auth";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  // Function to handle forgot password
  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Reset Password",
      input: "email",
      inputLabel: "Enter your email address",
      inputPlaceholder: "Your email address",
      showCancelButton: true,
      confirmButtonText: "Send Reset Code",
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter your email!";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address!";
        }
      },
    });

    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        Swal.fire({
          icon: "success",
          title: "Email Sent!",
          text: "A password reset code has been sent to your email address.",
        }).then(async () => {
          // Prompt the user to enter the code

          if (code) {
            // Prompt the user to enter a new password
            const { value: newPassword } = await Swal.fire({
              title: "Enter New Password",
              input: "password",
              inputLabel: "Enter your new password",
              inputPlaceholder: "New password",
              showCancelButton: true,
              confirmButtonText: "Reset Password",
              inputValidator: (value) => {
                if (!value) {
                  return "You need to enter a new password!";
                }
                if (value.length < 6) {
                  return "Password must be at least 6 characters long!";
                }
              },
            });

            if (newPassword) {
              // Verify the code and update the password
              await confirmPasswordReset(auth, code, newPassword);
              Swal.fire({
                icon: "success",
                title: "Password Reset Successful!",
                text: "Your password has been updated successfully.",
              });
            }
          }
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
    }
  };

  // Function to handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the user's ID token
      const idToken = await getIdToken(user);

      // Fetch additional user data from Realtime Database using Axios
      const dbUrl = `https://task-manager-najjar-default-rtdb.firebaseio.com/users/${user.uid}.json?auth=${idToken}`;
      const response = await axios.get(dbUrl);

      if (response.data) {
        const userData = response.data;
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${userData.firstName || user.email}!`,
          confirmButtonText: "OK",
        }).then(() => {
          // Redirect to /dashboard if the role is "manager"
          if (userData.role === "manager") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "User data not found.",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Google Sign-In Failed",
        text: error.message,
        confirmButtonText: "Try Again",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Get the user's ID token
      const idToken = await getIdToken(user);

      // Fetch additional user data from Realtime Database using Axios
      const dbUrl = `https://task-manager-najjar-default-rtdb.firebaseio.com/users/${user.uid}.json?auth=${idToken}`;
      const response = await axios.get(dbUrl);

      if (response.data) {
        const userData = response.data;
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${userData.firstName || user.email}!`,
          confirmButtonText: "OK",
        }).then(() => {
          // Redirect to /dashboard if the role is "manager"
          if (userData.role === "manager") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "User data not found.",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Please enter your details to sign in</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="absolute -bottom-6 text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
                {errors.password && (
                  <p className="absolute -bottom-6 text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  id="remember-me"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 mt-4"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="h-5 w-5"
              />
              <span>Sign in with Google</span>
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
