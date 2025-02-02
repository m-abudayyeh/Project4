import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

const LoadingSpinner = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-500",
    red: "border-red-500",
    green: "border-green-500",
    purple: "border-purple-500",
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={`
          ${sizeClasses[size]}
          border-4
          border-t-transparent
          ${colorClasses[color]}
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();

        // Check if the user's email is verified
        setEmailVerified(user.emailVerified);

        // Fetch the user's role from the database
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const role = snapshot.val().role;
          console.log("User role:", role);
          setUserRole(role);
        } else {
          console.log("No role found for user:", user.uid);
        }
      } else {
        console.log("No user is logged in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    console.log("Loading...");
    return <LoadingSpinner size="lg" color="blue" />;
  }

  console.log("User role after loading:", userRole);
  console.log("Email verified:", emailVerified);

  if (userRole !== "manager") {
    console.log("Redirecting to / because role is not manager");
    return <Navigate to="/" replace />;
  }

  if (!emailVerified) {
    console.log("Redirecting to /verify-email because email is not verified");
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
