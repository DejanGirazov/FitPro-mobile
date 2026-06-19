import { View } from "react-native";

const FoodResultCardSkeleton = () => {
  return (
    <View className="bg-[#1C2A4A] rounded-xl mb-2 p-4">
      {/* Food name line */}
      <View className="bg-[#0A0F1E] h-3 w-3/4 rounded-md mb-2" />

      {/* Calories + macros row */}
      <View className="flex-row items-center justify-between">
        <View className="bg-[#0A0F1E] h-5 w-20 rounded-md" />

        <View className="flex-row gap-3">
          <View className="bg-[#0A0F1E] h-3 w-10 rounded-md" />
          <View className="bg-[#0A0F1E] h-3 w-10 rounded-md" />
          <View className="bg-[#0A0F1E] h-3 w-10 rounded-md" />
        </View>
      </View>
    </View>
  );
};

export default FoodResultCardSkeleton;
