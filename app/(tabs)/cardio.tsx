import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cardio = () => {
  return (
    <SafeAreaView className="bg-[#0A0F1E] h-full" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl text-center font-bold tracking-widest mb-4">
          CARDIO
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default cardio;
