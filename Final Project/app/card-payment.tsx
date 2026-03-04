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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: "" }));
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
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s\-']+$/;

    if (!cardHolderName)
      newErrors.cardHolderName = "Card holder name is required";
    else if (!nameRegex.test(cardHolderName))
      newErrors.cardHolderName = "Name should not contain numbers";

    if (!cardNumber) newErrors.cardNumber = "Card number is required";
    else if (cardNumber.length < 16)
      newErrors.cardNumber = "Invalid card number";

    if (!expiryDate) newErrors.expiryDate = "Expiry date is required";
    else if (!validateExpiry(expiryDate))
      newErrors.expiryDate = "Invalid or expired date";

    if (!cvv) newErrors.cvv = "CVV is required";
    else if (cvv.length < 3) newErrors.cvv = "Invalid CVV";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
            className={`border ${errors.cardHolderName ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
            placeholder="John Doe"
            value={cardHolderName}
            onChangeText={(text) => {
              setCardHolderName(text);
              if (errors.cardHolderName)
                setErrors((prev) => ({ ...prev, cardHolderName: "" }));
            }}
          />
          {errors.cardHolderName && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.cardHolderName}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Card Number</Text>
          <TextInput
            className={`border ${errors.cardNumber ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            maxLength={16}
            value={cardNumber}
            onChangeText={(text) => {
              setCardNumber(text);
              if (errors.cardNumber)
                setErrors((prev) => ({ ...prev, cardNumber: "" }));
            }}
          />
          {errors.cardNumber && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.cardNumber}
            </Text>
          )}
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-gray-700 font-semibold mb-2">
              Expiry Date
            </Text>
            <TextInput
              className={`border ${errors.expiryDate ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={handleExpiryChange}
              maxLength={5}
              keyboardType="numeric"
            />
            {errors.expiryDate && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.expiryDate}
              </Text>
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-gray-700 font-semibold mb-2">CVV</Text>
            <TextInput
              className={`border ${errors.cvv ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              value={cvv}
              onChangeText={(text) => {
                setCvv(text);
                if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: "" }));
              }}
            />
            {errors.cvv && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.cvv}
              </Text>
            )}
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
