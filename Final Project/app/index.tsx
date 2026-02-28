import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const pages = [
    { id: '1', component: <SplashPage /> },
    {
      id: '2',
      component: (
        <View className="flex-1 items-center justify-between bg-white px-2 py-10">
          <View className="items-center mt-12 w-full">
            <Text className="text-[35px] leading-9 font-black text-[#1F1F1F] text-center mb-4 px-4 tracking-tight">
              Best Helping{"\n"}Hands for you
            </Text>
            <Text className="text-sm font-medium text-[#1F1F1F] text-center leading-snug tracking-tight px-6 opacity-80">
              With Our On-Demand Services App,{"\n"}We Give Better Services To You.
            </Text>
          </View>

          <View className="flex-1 justify-center items-center w-full">
            <Image
              source={require('../assets/images/Worker.png')}
              style={{ width: 380, height: 380, resizeMode: 'contain' }}
            />
          </View>

          <View className="w-full pb-8">
            <TouchableOpacity
              onPress={() => router.push('/onboarding' as any)}
              className="bg-[#2C2C2C] px-8 py-[18px] rounded-xl w-[90%] mx-auto items-center justify-center shadow-lg"
            >
              <Text className="text-[#DFFF00] font-bold text-[16px] tracking-wide">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  ];

  return (
    <View className="flex-1">
      <FlatList
        data={pages}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            {item.component}
          </View>
        )}
      />
    </View>
  );
}

function SplashPage() {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [slideAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-[#DFFF00]">
      {/* Central Logo */}
      <View className="items-center justify-center mb-6 mt-10">
        <View className="w-28 h-28 bg-[#1F1F1F] rounded-[32px] items-center justify-center shadow-md">
          {/* The logo inner pattern (a U shape with a vertical line) */}
          <View className="w-16 h-16 border-[10px] border-[#DFFF00] rounded-full border-b-transparent justify-center items-center">
            <View className="w-[10px] h-8 bg-[#DFFF00] absolute -top-1 rounded-full" />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text className="text-3xl font-black text-[#1F1F1F] tracking-tight">Your Services</Text>

      {/* Swipe Indicator */}
      <View className="absolute bottom-32 items-center w-full">
        <Animated.View
          style={{ transform: [{ translateX: slideAnim }] }}
          className="flex-row items-center"
        >
          <Text className="text-[#1F1F1F] font-bold text-lg mr-2">Swipe to start</Text>
          <Feather name="chevrons-right" size={24} color="#1F1F1F" />
        </Animated.View>
      </View>

      {/* Footer Logo */}
      <View className="absolute bottom-12 flex-row items-center justify-center">
        {/* Abstract Square pattern */}
        <View className="w-4 h-4 flex-row flex-wrap">
          <View className="w-2 h-2 bg-[#1F1F1F]" />
          <View className="w-2 h-2 bg-transparent" />
          <View className="w-2 h-2 bg-transparent" />
          <View className="w-2 h-2 bg-[#1F1F1F]" />
          <View className="absolute w-[18px] h-[18px] border-2 border-[#1F1F1F] top-[-1px] left-[-1px]" />
        </View>
        <View className="ml-2">
          <Text className="text-[10px] text-[#1F1F1F] font-bold leading-none mb-[2px]">Maga1090</Text>
          <Text className="text-[10px] text-[#1F1F1F] font-bold leading-none">Technologies</Text>
        </View>
      </View>
    </View>
  );
}
