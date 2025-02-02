import { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Ensure `db` is initialized for Realtime Database
import { ref, get } from "firebase/database"; // Import Realtime Database functions
import { getIdToken } from "firebase/auth";
import axios from "axios"; // Import Axios

import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import {
  User,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  ChevronRight,
} from "lucide-react";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  role: yup.string().required("Role is required"),
});

export default function Profile() {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch user data from Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          reset({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
          });
        }

        // Fetch tasks from Realtime Database
        const tasksRef = ref(db, "tasks");
        const tasksSnapshot = await get(tasksRef);
        const tasks = [];
        tasksSnapshot.forEach((childSnapshot) => {
          const task = childSnapshot.val();
          if (task.assignedTo === user.uid) {
            tasks.push({ id: childSnapshot.key, ...task });
          }
        });
        setAssignedTasks(tasks);
      }
    };
    fetchUserData();
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const idToken = await getIdToken(auth.currentUser);
      const url = `https://task-manager-najjar-default-rtdb.firebaseio.com/users/${user.uid}.json?auth=${idToken}`;

      await axios.put(url, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      });

      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been successfully updated",
        showConfirmButton: false,
        timer: 2000,
        background: "#fff",
        iconColor: "#4F46E5",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Please try again later",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inProgress: "bg-blue-100 text-blue-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      {...register("role")}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    >
                      <option value="manager">Manager</option>
                      <option value="team-member">Team Member</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Total Tasks
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {assignedTasks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Completed
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {
                      assignedTasks.filter(
                        (task) => task.status === "completed"
                      ).length
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Pending
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {
                      assignedTasks.filter((task) => task.status === "pending")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Assigned Tasks
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {assignedTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 text-sm">
                          {task.description}
                        </p>
                        <button className="mt-4 text-sm text-indigo-600 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View Details</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Tasks Assigned
                    </h3>
                    <p className="text-gray-600">
                      You currently don't have any tasks assigned to you.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
