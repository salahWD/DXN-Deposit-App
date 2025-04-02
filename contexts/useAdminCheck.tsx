import { useState, useEffect } from "react";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getUserSession } from "@/utils/functions";

const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const checkAdminStatus = async () => {
      const userId = await getUserSession();
      console.log("User ID:", userId);

      if (userId) {
        const userRef = doc(db, "deposits", userId);
        unsubscribe = onSnapshot(
          userRef,
          (snapshot) => {
            const data = snapshot.data();
            setIsAdmin(data?.isAdmin === true); // Use === for strict comparison
          },
          (error) => {
            console.error("Error checking admin status:", error);
            setIsAdmin(false); // Default to non-admin on error
          }
        );
      } else {
        console.log("No user ID, please login");
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Return the admin status and a loading state
  return { isAdmin, isLoading: isAdmin === null };
};

export default useAdminCheck;
