import NetInfo from "@react-native-community/netinfo";
import { PropsWithChildren, useEffect, useRef } from "react";
import Toast from "react-native-toast-message";

export default function NetworkToastProvider({ children }: PropsWithChildren) {
  const wasConnectedRef = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? true;

      if (wasConnectedRef.current !== isConnected) {
        Toast.show({
          type: isConnected ? "online" : "offline",
          text1: isConnected ? "Back online" : "You are offline",
          visibilityTime: isConnected ? 5000 : 8000,
          autoHide: true,
          swipeable: true,
        });
      }

      wasConnectedRef.current = isConnected;
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
