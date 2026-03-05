import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CardInfo {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

const CARD_STORAGE_KEY = "user_cards_list";

export const saveCards = async (cards: CardInfo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error("Error saving cards", error);
    throw error;
  }
};

export const getCards = async (): Promise<CardInfo[]> => {
  try {
    const cards = await AsyncStorage.getItem(CARD_STORAGE_KEY);
    return cards ? JSON.parse(cards) : [];
  } catch (error) {
    console.error("Error getting cards", error);
    return [];
  }
};

export const addCard = async (card: Omit<CardInfo, "id">): Promise<void> => {
  const cards = await getCards();
  const newCard: CardInfo = {
    ...card,
    id: Math.random().toString(36).substring(2, 11), // Simple unique ID
  };
  await saveCards([...cards, newCard]);
};

export const deleteCard = async (id: string): Promise<void> => {
  const cards = await getCards();
  await saveCards(cards.filter((c) => c.id !== id));
};

export const clearCards = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CARD_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cards", error);
  }
};

// Compatibility helpers (if still needed elsewhere)
export const getCard = async (): Promise<CardInfo | null> => {
  const cards = await getCards();
  return cards.length > 0 ? cards[0] : null;
};
