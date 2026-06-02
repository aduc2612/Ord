import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export const useKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // 1. Determine the best events based on the Platform
    // iOS supports smooth 'will' transitions, Android primarily triggers 'did'
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    // 2. Add event listeners
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardOpen(false);
    });

    // 3. Clean up subscriptions to avoid memory leaks
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardOpen;
};
