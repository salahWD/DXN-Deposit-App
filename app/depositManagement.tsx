import { Text } from "react-native";

import DepositManagementScreen from "@/app/DepositManagementScreen";
import useAdminCheck from "@/contexts/useAdminCheck";
import React from "react";

export default function ProtectedDepositManagementScreen() {
  const { isLoading } = useAdminCheck();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <DepositManagementScreen />;
}
