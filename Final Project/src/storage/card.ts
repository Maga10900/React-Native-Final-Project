import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CardInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

const CARD_STORAGE_KEY = "user_card_info";

export const saveCard = async (card: CardInfo): Promise<void> => {
  try {
    await AsyncStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(card));
  } catch (error) {
    console.error("Error saving card info", error);
    throw error;
  }
};

export const getCard = async (): Promise<CardInfo | null> => {
  try {
    const card = await AsyncStorage.getItem(CARD_STORAGE_KEY);
    return card ? JSON.parse(card) : null;
  } catch (error) {
    console.error("Error getting card info", error);
    return null;
  }
};

export const clearCard = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CARD_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing card info", error);
  }
};
