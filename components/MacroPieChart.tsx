import { Dimensions, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

type Props = {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories: number;
};

const MACRO_COLORS = {
  protein: "#00BFFF",
  carbs: "#22c55e",
  fat: "#f97316",
};

const MacroPieChart = ({ protein, carbs, fat, totalCalories }: Props) => {
  const hasData = protein > 0 || carbs > 0 || fat > 0;

  const data = [
    {
      name: "Protein",
      grams: Math.round(protein),
      color: MACRO_COLORS.protein,
      legendFontColor: "#8E8E93",
      legendFontSize: 12,
    },
    {
      name: "Carbs",
      grams: Math.round(carbs),
      color: MACRO_COLORS.carbs,
      legendFontColor: "#8E8E93",
      legendFontSize: 12,
    },
    {
      name: "Fat",
      grams: Math.round(fat),
      color: MACRO_COLORS.fat,
      legendFontColor: "#8E8E93",
      legendFontSize: 12,
    },
  ];

  return (
    <View className="bg-[#1C2A4A] rounded-xl p-4 mb-4">
      <Text className="text-white font-bold text-lg uppercase tracking-widest mb-1">
        {"Today's Macros"}
      </Text>
      <Text className="text-[#00BFFF] font-bold text-2xl mb-4">
        {Math.round(totalCalories)} kcal
      </Text>

      {!hasData ? (
        <Text className="text-[#8E8E93] text-center py-4">
          No meals logged today
        </Text>
      ) : (
        <>
          <PieChart
            data={data}
            width={Dimensions.get("window").width - 64}
            height={180}
            chartConfig={{
              color: () => "#00BFFF",
              labelColor: () => "#8E8E93",
            }}
            accessor="grams"
            backgroundColor="transparent"
            paddingLeft="10"
            hasLegend={true}
          />

          {/* Macro breakdown pills */}
          <View className="flex-row justify-between mt-2">
            {data.map((macro) => (
              <View key={macro.name} className="flex-1 items-center">
                <View
                  style={{ backgroundColor: macro.color }}
                  className="w-2 h-2 rounded-full mb-1"
                />
                <Text className="text-white font-bold text-sm">
                  {macro.grams}g
                </Text>
                <Text className="text-[#8E8E93] text-xs">{macro.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default MacroPieChart;
