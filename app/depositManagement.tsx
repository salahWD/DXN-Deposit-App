import { Text } from "react-native";
import { router } from "expo-router"; // Use expo-router for navigation

import DepositManagementScreen from "@/app/DepositManagementScreen";
import useAdminCheck from "@/contexts/useAdminCheck";

const ProtectedDepositManagementScreen = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) return <Text>Loading...</Text>;
  if (!isAdmin) {
    router.replace("/home");
    return null;
  }

  if (isAdmin === null) return <Text>Loading...</Text>;
  if (!isAdmin) {
    router.replace("/home");
    return null;
  }
  return <DepositManagementScreen />;
};
export default ProtectedDepositManagementScreen;
