import { useState, useEffect } from "react";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getUserSession } from "@/utils/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Use expo-router for navigation

const ADMIN_STATUS_CACHE_KEY = "admin_status";

const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const checkAdminStatus = async () => {
      const ID = await getUserSession();
      setUserId(ID ?? "");

      if (!ID) {
        console.log("No user ID, please login");
        setIsAdmin(false);
        router.replace("/index");
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
          AsyncStorage.setItem("userId", userId);
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
  }, [isAdmin, userId]);

  // Return the admin status and a loading state
  return { isAdmin, isLoading: typeof isAdmin == null, userId: userId };
};

export default useAdminCheck;
