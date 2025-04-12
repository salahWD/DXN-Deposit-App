import { useState, useEffect } from "react";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getUserSession } from "@/utils/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_STATUS_CACHE_KEY = "admin_status";

const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const checkAdminStatus = async () => {
      const userId = await getUserSession();
      console.log("User ID:", userId);

      if (!userId) {
        console.log("No user ID, please login");
        setIsAdmin(false);
        return;
      }

      const cachedStatus = await AsyncStorage.getItem(
        `${ADMIN_STATUS_CACHE_KEY}_${userId}`
      );
      if (cachedStatus !== null) {
        setIsAdmin(cachedStatus === "true");
      }

      const userRef = doc(db, "deposits", userId);
      unsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          const data = snapshot.data();
          const adminStatus = data?.isAdmin === true;
          setIsAdmin(adminStatus);
          AsyncStorage.setItem(
            `${ADMIN_STATUS_CACHE_KEY}_${userId}`,
            adminStatus.toString()
          );
        },
        (error) => {
          console.error("Error checking admin status:", error);
          if (cachedStatus !== null) {
            setIsAdmin(cachedStatus === "true"); // Use cached status
          } else {
            setIsAdmin(false); // Default to non-admin if no cache
          }
        }
      );
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
