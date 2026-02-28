import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: "Choose a service",
        description: "Find the right service for your needs easily, with a variety of options available at your fingertips.",
        image: require('../assets/images/1.png'),
    },
    {
        id: "2",
        title: "Get a quote",
        description: "Request price estimates from professionals to help you make informed decisions with ease.",
        image: require('../assets/images/2.png'),
    },
    {
        id: "3",
        title: "Work done",
        description: "Sit back and relax while skilled experts efficiently take care of your tasks, ensuring a job well done.",
        image: require('../assets/images/3.png'),
    }
];

export default function Onboarding() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0]?.index ?? 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.push('/login' as any);
        }
    };

    const skip = () => {
        router.push('/login' as any);
    };

    return (
        <View className="flex-1 bg-white pt-10">
            <Pressable className="px-4 py-2 rounded-lg absolute top-10 z-10" onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </Pressable>
            <View style={{ flex: 3 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => (
                        <View style={{ width }} className="flex-1 items-center justify-center px-6 mt-10">
                            <Image
                                source={item.image}
                                style={{ width: width * 0.85, height: width * 0.85, resizeMode: 'contain' }}
                            />
                            <View className="mt-12 mb-4">
                                <Text className="text-[28px] font-bold text-center text-[#1E1E1E]">
                                    {item.title}
                                </Text>
                            </View>
                            <Text className="text-sm text-center text-gray-500 leading-6 px-4">
                                {item.description}
                            </Text>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={true}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View className="flex-1 justify-between px-6 pb-12 pt-4">
                {/* Paginator */}
                <View className="flex-row justify-center items-center mt-4">
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 20, 8],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i.toString()}
                                style={{ width: dotWidth, opacity }}
                                className="h-2 rounded-full bg-[#1E1E1E] mx-1"
                            />
                        );
                    })}
                </View>

                {/* Buttons */}
                <View className="flex-row justify-between items-center w-full mt-auto">
                    <TouchableOpacity onPress={skip} className="px-4 py-2">
                        <Text className="text-[#1E1E1E] font-medium text-base">Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={scrollToNext}
                        className="bg-[#2C2C2C] px-8 py-4 rounded-xl shadow-sm"
                    >
                        <Text className="text-[#DFFF00] font-bold text-base">
                            {currentIndex === slides.length - 1 ? "Finish" : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
