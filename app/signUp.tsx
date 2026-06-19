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

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    gender: "",
  });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      username,
      password,
      email,

      gender,
    }: any) => {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          gender,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err: any) => {
      alert(err.message);
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
        keyboardVerticalOffset={64}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="justify-center items-center gap-4 py-10">
            <Image
              source={Logo}
              style={{ width: 150, height: 150 }}
              resizeMode="contain"
            />

            <Text className="font-bold text-2xl text-[#00BFFF] tracking-widest">
              SIGN UP TO FITPRO
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
              <TextInput
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                className="w-full bg-[#1C2A4A] text-white p-4 rounded-xl"
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                value={formData.email}
              />

              {/* Gender selection */}
              <View className="flex-row gap-6 w-full justify-center">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: "male" })}
                  className={`flex-1 p-4 rounded-xl items-center ${
                    formData.gender === "male" ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"
                  }`}
                >
                  <Text className="text-white font-bold">Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, gender: "female" })}
                  className={`flex-1 p-4 rounded-xl items-center ${
                    formData.gender === "female"
                      ? "bg-[#00BFFF]"
                      : "bg-[#1C2A4A]"
                  }`}
                >
                  <Text className="text-white font-bold">Female</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-[#00BFFF] w-full p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold tracking-widest uppercase">
                  {isPending ? "Loading..." : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-1">
              <Text className="text-white">Already have an account?</Text>
              <Link href={"/login" as any} className="text-[#00BFFF] font-bold">
                Log in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpPage;
