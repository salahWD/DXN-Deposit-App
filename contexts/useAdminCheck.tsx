import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getUserSession } from "@/utils/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_STATUS_CACHE_KEY = "admin_status";

const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      const ID = await getUserSession();
      if (!ID) {
        console.log("No user ID, please login");
        setIsAdmin(false);
        return;
      } else {
        setUserId(ID);

        const cacheKey = `${ADMIN_STATUS_CACHE_KEY}_${ID}`;
        const cachedStatus = await AsyncStorage.getItem(cacheKey);

        if (cachedStatus !== null) {
          setIsAdmin(cachedStatus === "true");
        }

        try {
          const snapshot = await getDoc(doc(db, "deposits", ID));

          const adminStatus =
            snapshot.exists() && snapshot.data()?.isAdmin === true;

          setIsAdmin(adminStatus);

          await AsyncStorage.setItem("userId", ID);
          await AsyncStorage.setItem(cacheKey, adminStatus.toString());
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (cachedStatus !== null) {
            setIsAdmin(cachedStatus === "true"); // fallback to cached value
          } else {
            setIsAdmin(false);
          }
        }
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading: isAdmin === null, userId };
};

export default useAdminCheck;
