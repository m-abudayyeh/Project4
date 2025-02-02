import { useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  getIdToken,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  role: yup.string().required("Role is required"),
  departments: yup.string().required("Department is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch("password", "");
  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Get the user's ID token
      const idToken = await getIdToken(user);

      // Prepare the data to be stored in the Realtime Database
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        departments: data.departments,
        createdAt: new Date().toISOString(),
        emailVerified: false, // Add a field to track email verification status
      };

      // Firebase Realtime Database REST API URL
      const dbUrl = `https://task-manager-najjar-default-rtdb.firebaseio.com/users/${user.uid}.json?auth=${idToken}`;

      // Use Axios to store the data in the Realtime Database
      await axios.put(dbUrl, userData);

      // Show success message and prompt the user to verify their email
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Your account has been successfully created. Please check your email to verify your account.",
        confirmButtonText: "Continue",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded-lg",
        },
      }).then(() => {
        // Redirect to a verification page or home page
        navigate("/verify-email"); // You can create a route for this page
      });
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message,
        confirmButtonText: "Try Again",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded-lg",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the user's ID token
      const idToken = await getIdToken(user);

      // Prepare the data to be stored in the Realtime Database
      const userData = {
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ")[1] || "",
        email: user.email,
        role: "team-member", // Default role for Google sign-in
        departments: "It", // Default department for Google sign-in
        createdAt: new Date().toISOString(),
      };

      // Firebase Realtime Database REST API URL
      const dbUrl = `https://task-manager-najjar-default-rtdb.firebaseio.com/users/${user.uid}.json?auth=${idToken}`;

      // Use Axios to store the data in the Realtime Database
      await axios.put(dbUrl, userData);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Your account has been successfully created with Google.",
        confirmButtonText: "Continue",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded-lg",
        },
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Google Sign-In Failed",
        text: error.message,
        confirmButtonText: "Try Again",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded-lg",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("firstName")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("lastName")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {Object.entries(passwordStrength).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        value ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        value ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                      {key === "length" && " minimum 8 characters"}
                      {key === "uppercase" && " one uppercase letter"}
                      {key === "lowercase" && " one lowercase letter"}
                      {key === "number" && " one number"}
                      {key === "special" && " one special character"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register("role")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Select a role</option>
                  <option value="manager">Manager</option>
                  <option value="team-member">Team Member</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departments
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register("departments")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Select a department</option>
                  <option value="It">IT</option>
                  <option value="Front-End department">
                    Front-End department
                  </option>
                  <option value="Back-End department">
                    Back-End department
                  </option>
                  <option value="DataBase department">
                    DataBase department
                  </option>
                </select>
                {errors.departments && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.departments.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full justify-center items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="h-5 w-5"
                />
                <span>Sign up with Google</span>
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
