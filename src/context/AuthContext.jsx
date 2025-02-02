import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`); 
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({ ...user, ...userData }); 
        } else {
          setUser(user);
        }
      } else {
        setUser(null); 
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
