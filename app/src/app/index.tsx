import { Button, Text, View } from "react-native";

import { useAuthStore } from "@/lib/auth-store";

export default function HomeScreen() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
