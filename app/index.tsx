import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    // Redirect({ href: "/auth/Login" })
    Redirect({ href: "/auth/Login" })
  );
}
