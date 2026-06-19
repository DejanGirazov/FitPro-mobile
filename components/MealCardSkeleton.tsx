// MealCardSkeleton.tsx
import { View } from "react-native";

const MealCardSkeleton = () => {
  return (
    <View className="bg-[#1C2A4A] rounded-xl p-4 mb-3 opacity-60">
      {/* Meal type label */}
      <View className="bg-[#0A0F1E] h-4 w-24 rounded-md mb-3" />

      {/* Calorie row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-[#0A0F1E] h-7 w-20 rounded-md" />
        <View className="bg-[#0A0F1E] h-5 w-16 rounded-md" />
      </View>

      {/* Macro pills */}
      <View className="flex-row gap-3">
        <View className="bg-[#0A0F1E] h-5 w-16 rounded-md" />
        <View className="bg-[#0A0F1E] h-5 w-16 rounded-md" />
        <View className="bg-[#0A0F1E] h-5 w-16 rounded-md" />
      </View>
    </View>
  );
};

export default MealCardSkeleton;
