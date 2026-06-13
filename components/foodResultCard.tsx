import { Text, TouchableOpacity, View } from "react-native";

const FoodResultCard = ({
  food,
  onPress,
  selected,
}: {
  food: any;
  onPress: () => void;
  selected: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl mb-2 p-4 ${selected ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"}`}
    >
      {/* Food name */}
      <Text className="text-white font-bold mb-2" numberOfLines={1}>
        {food.name}
      </Text>

      {/* Calories + macros on same line */}
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-xl font-bold ${!selected ? "text-[#00BFFF]" : "text-[#1C2A4A]"}`}
        >
          {Math.round(food.calories)} kcal
        </Text>

        <View className="flex-row gap-3">
          {[
            { label: "P", value: food.protein },
            { label: "C", value: food.carbs },
            { label: "F", value: food.fat },
          ].map((macro) => (
            <View key={macro.label} className="flex-row items-baseline gap-1">
              <Text className="text-white text-xs font-bold">
                {Math.round(macro.value)}g
              </Text>
              <Text className="text-[#8E8E93] text-xs">{macro.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default FoodResultCard;
