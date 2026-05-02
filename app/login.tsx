import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../assets/images/Logo.png";
import { API_URL } from "../constants/api";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err: any) => {
      alert(err.message); // replace toast for now
    },
  });

  const handleSubmit = () => {
    mutate(formData);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center bg-[#0A0F1E] gap-6 py-10">
            <Image
              source={Logo}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />

            <Text className="font-bold text-2xl text-[#00BFFF] tracking-widest">
              LOG IN TO FITPRO
            </Text>

            <View className="flex flex-col gap-4 w-3/4 items-center">
              <TextInput
                placeholder="Username"
                placeholderTextColor="#8E8E93"
                className="w-full bg-[#1C2A4A] text-white p-4 rounded-xl"
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                value={formData.username}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8E8E93"
                secureTextEntry
                className="w-full bg-[#1C2A4A] text-white p-4 rounded-xl"
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                value={formData.password}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-[#00BFFF] w-full p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold tracking-widest uppercase">
                  {isPending ? "Loading..." : "Log In"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-1">
              <Text className="text-white">Don&apos;t have an account?</Text>
              <Link
                href={"/signUp" as any}
                className="text-[#00BFFF] font-bold"
              >
                Sign up
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginPage;
