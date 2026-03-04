import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { CardInfo, getCard, saveCard } from "../src/storage/card";

export default function CardPaymentScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadCard() {
      try {
        const card = await getCard();
        if (card) {
          setCardNumber(card.cardNumber);
          setExpiryDate(card.expiryDate);
          setCvv(card.cvv);
          setCardHolderName(card.cardHolderName);
        }
      } catch (error) {
        console.error("Failed to load card", error);
      } finally {
        setFetching(false);
      }
    }
    loadCard();
  }, []);

  const handleExpiryChange = (text: string) => {
    // Remove any non-numeric characters
    const cleanText = text.replace(/[^0-9]/g, "");

    let formattedText = cleanText;
    if (cleanText.length > 2) {
      formattedText = `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`;
    }

    setExpiryDate(formattedText);
  };

  const validateExpiry = (date: string) => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;

    const [month, year] = date.split("/").map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  const handleSave = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    // Basic validation
    if (cardNumber.length < 16) {
      Alert.alert("Error", "Invalid card number.");
      return;
    }

    if (!validateExpiry(expiryDate)) {
      Alert.alert("Error", "Invalid or expired date (MM/YY).");
      return;
    }

    setLoading(true);
    try {
      const card: CardInfo = {
        cardNumber,
        expiryDate,
        cvv,
        cardHolderName,
      };
      await saveCard(card);
      Alert.alert("Success", "Card details saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save card");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 48 }}>
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-bold ml-4">Card Payment</Text>
      </View>

      <ScrollView className="p-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">
            Card Holder Name
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            placeholder="John Doe"
            value={cardHolderName}
            onChangeText={setCardHolderName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Card Number</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-gray-700 font-semibold mb-2">
              Expiry Date
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={handleExpiryChange}
              maxLength={5}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-gray-700 font-semibold mb-2">CVV</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
            />
          </View>
        </View>

        <Pressable
          className={`bg-black py-4 rounded-lg items-center mb-10 ${loading ? "opacity-70" : ""}`}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Save Card Details
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
