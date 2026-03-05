import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { addCard, CardInfo, deleteCard, getCards } from "../src/storage/card";

export default function CardPaymentScreen() {
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await getCards();
      setCards(data);
    } catch (error) {
      console.error("Failed to load cards", error);
    } finally {
      setFetching(false);
    }
  };

  const handleExpiryChange = (text: string) => {
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

  const handleAddCard = async () => {
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
      await addCard({
        cardNumber,
        expiryDate,
        cvv,
        cardHolderName,
      });
      await loadCards();
      setShowAddForm(false);
      // Reset form
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardHolderName("");
      Alert.alert("Success", "Card added successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Card", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCard(id);
          await loadCards();
        },
      },
    ]);
  };

  const renderCard = ({ item }: { item: CardInfo }) => (
    <View className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="bg-black p-2 rounded-lg mr-3">
          <Ionicons name="card" size={20} color="white" />
        </View>
        <View>
          <Text className="text-gray-800 font-bold">
            **** **** **** {item.cardNumber.slice(-4)}
          </Text>
          <Text className="text-gray-500 text-xs">
            {item.cardHolderName} • Exp: {item.expiryDate}
          </Text>
        </View>
      </View>
      <Pressable onPress={() => handleDelete(item.id)} className="p-2">
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </Pressable>
    </View>
  );

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

      <View className="flex-1 p-4">
        {!showAddForm ? (
          <>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-gray-800">
                Your Cards
              </Text>
              <Pressable
                onPress={() => setShowAddForm(true)}
                className="bg-black px-4 py-2 rounded-xl flex-row items-center"
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-1">Add New</Text>
              </Pressable>
            </View>

            <FlatList
              data={cards}
              keyExtractor={(item) => item.id}
              renderItem={renderCard}
              ListEmptyComponent={
                <View className="items-center py-20">
                  <Ionicons name="card-outline" size={64} color="#D1D5DB" />
                  <Text className="text-gray-500 mt-4 text-center">
                    No cards added yet. Add a card to make payments.
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-800">
                Add New Card
              </Text>
              <Pressable onPress={() => setShowAddForm(false)} className="p-2">
                <Ionicons name="close" size={24} color="gray" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Card Holder Name
              </Text>
              <TextInput
                className={`border ${errors.cardHolderName ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
                placeholder="John Doe"
                value={cardHolderName}
                onChangeText={setCardHolderName}
              />
              {errors.cardHolderName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.cardHolderName}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Card Number
              </Text>
              <TextInput
                className={`border ${errors.cardNumber ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
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
                  onChangeText={setCvv}
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
              onPress={handleAddCard}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Add Card</Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
