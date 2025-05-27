import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import {Icon} from "@ui-kitten/components";
import {TimerModalProps} from "./modalConfig";
import {rideAtom} from "../../store/atoms/ride/rideAtom";
import {useRecoilState} from "recoil";

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  duration = 300,
  onComplete = () => {},
  pollStatus = async () => false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [copied, setCopied] = useState(false);
  const [rideState, _] = useRecoilState(rideAtom);
  const fare = rideState.fare?.finalFare;

  const getFare = () => {
    console.log("fare in timer modal", fare);
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const pollInterval = setInterval(async () => {
      const isComplete = await pollStatus();
      if (isComplete) {
        clearInterval(pollInterval);
        onComplete();
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [isOpen, onComplete, pollStatus, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCopyAddress = async () => {
    // replace this with test/vipasannas wallet address
    const walletAddress = "0x1234...5678";
    await Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.modalContent}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close-outline" width={24} height={24} fill="#fff" />
        {getFare()}
      </TouchableOpacity>

      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address:</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>0x1234...5678</Text>
          <TouchableOpacity
            onPress={handleCopyAddress}
            style={styles.copyButton}>
            <Text style={styles.copyButtonText}>
              {copied ? "Copied!" : "Copy"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.instruction}>
        `Copy this address and send {fare} to this wallet address, and come back
        after the transaction is complete`
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#353f3b",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
  timer: {
    fontSize: 48,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
    marginVertical: 20,
  },
  addressContainer: {
    width: "100%",
    marginVertical: 20,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    marginBottom: 10,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2f2d",
    padding: 15,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  addressText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
    flex: 1,
  },
  copyButton: {
    backgroundColor: "#01CD5D",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  copyButtonText: {
    color: "#fff",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
  },
  instruction: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
});

export default TimerModal;
