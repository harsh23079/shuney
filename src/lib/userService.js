import { db } from "../firebase/firebase-config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const userService = {
    // Save user data to Firestore
    async saveUser(userData) {
        try {
            const userRef = doc(db, "users", userData.uid);

            const userDoc = {
                uid: userData.uid,
                firstName: userData.username,
                mobile: userData.phoneNumber,
                occupation: userData.occupation,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };

            await setDoc(userRef, userDoc, { merge: true });
            console.log("User data saved successfully", userDoc);
            return { success: true };
        } catch (error) {
            console.error("Error saving user data:", error);
            return { success: false, error: error.message };
        }
    },

    // Get user data from Firestore
    async getUser(uid) {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                console.log("User found successfully", userSnap);
                return { success: true, userData: userSnap.data() };
            } else {
                console.log("User not found", userSnap);
                return { success: false, error: "User not found" };
            }
        } catch (error) {
            console.error("Error getting user data:", error);
            return { success: false, error: error.message };
        }
    },

    // Update user's last login
    async updateLastLogin(uid) {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(
                userRef,
                {
                    lastLogin: serverTimestamp(),
                },
                { merge: true }
            );

            console.log("update login successfully");

            return { success: true };
        } catch (error) {
            console.error("Error updating last login:", error);
            return { success: false, error: error.message };
        }
    },
};
