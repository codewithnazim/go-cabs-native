import { addDoc, collection, getFirestore, serverTimestamp } from '@react-native-firebase/firestore';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export enum TxnStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

interface SaveInDbTypes {
    userId: string;
    inrAmount: number;
    solAmount: number;
    status: TxnStatus;
    startTime: number;
}

export async function saveTxnInFirestore(data: SaveInDbTypes) {
    const db = getFirestore()
    const transactionId = uuidv4();
    const endTime = data.startTime + 5 * 60 * 1000
    const txnDoc = {
        transactionId,
        userId: data.userId,
        inrAmount: data.inrAmount,
        solAmount: data.solAmount,
        status: data.status,
        startTime: data.startTime,
        endTime,
        createdAt: serverTimestamp(),
    };
    // await firestore().collection('transactions').doc(transactionId).set(txnDoc);
    const response = await addDoc(collection(db, 'transactions'), txnDoc)
    console.log("transaction saved response: ", response)
    return transactionId;
}