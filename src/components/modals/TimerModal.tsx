import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Image,
} from "react-native";
import { Icon } from "@ui-kitten/components";
import { TimerModalProps } from "./modalConfig";
import { rideAtom } from "../../store/atoms/ride/rideAtom";
import { useRecoilState } from "recoil";
import { convertINRtoSOL } from "../../utils/currency/currencyConverter";

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  duration = 300,
  onComplete = () => { },
  pollStatus = async () => false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [copied, setCopied] = useState(false);
  const [rideState, _] = useRecoilState(rideAtom);
  const fare = rideState.fare?.finalFare || 0;
  const [fareInSOL, setFareInSOL] = useState<number>()

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  const getFare = async () => {
    const amountInSOL = await convertINRtoSOL(fare)
    setFareInSOL(amountInSOL)
  };

  // Reset timer when modal opens
  useEffect(() => {
    getFare();
    if (isOpen) {
      setTimerStartTime(Date.now());
      setTimeLeft(duration);
    } else {
      setTimerStartTime(null);
      setTimeLeft(duration);
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, duration]);

  // Timer countdown logic
  useEffect(() => {
    if (!isOpen || timerStartTime === null) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (pollRef.current) clearInterval(pollRef.current);
        onComplete?.();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    pollRef.current = setInterval(async () => {
      const isComplete = await pollStatus();
      if (isComplete) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (pollRef.current) clearInterval(pollRef.current);
        onComplete?.();
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, timerStartTime, duration, onComplete, pollStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyAddress = async () => {
    const walletAddress = "7DfyijuUTX5LNtdMiKePdHPgw1sGd16wJ7oY813rwxb1";
    await Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleClose = () => {
    setTimerStartTime(null);
    setTimeLeft(duration);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    onClose?.();
  };

  if (timeLeft === 0) {
    return (
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close-outline" width={24} height={24} fill="#fff" />
        </TouchableOpacity>
        <Image
          source={require("../../../assets/images/icons/error-payment.png")}
          style={styles.errorPayment}
        />
        <Text style={styles.instruction}>You ran out of time!</Text>
      </View>
    );
  }

  return (
    <View style={styles.modalContent}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Icon name="close-outline" width={24} height={24} fill="#fff" />
      </TouchableOpacity>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      <Text style={styles.fare}>
        Fare: ₹{fare} ({fareInSOL} SOL)
      </Text>
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Wallet Address:</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
            7DfyijuUTX5LNtdMiKePdHPgw1sGd16wJ7oY813rwxb1
          </Text>
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
        Copy this address and send {fare} to this wallet address, and come back
        after the transaction is complete
      </Text>
    </View>
  )
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
  fare: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Montserrat-Bold"
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
  errorPayment: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#353f3b",
  },
});

export default TimerModal;
