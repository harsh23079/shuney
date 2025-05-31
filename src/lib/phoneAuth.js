import { auth } from "../../firebase/firebase-config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

class PhoneAuthService {
    constructor() {
        this.recaptchaVerifier = null;
        this.confirmationResult = null;
    }

    // Initialize invisible reCAPTCHA
    initializeRecaptcha(containerId = "recaptcha-container") {
        if (!this.recaptchaVerifier) {
            this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                size: "invisible",
                callback: () => {
                    console.log("reCAPTCHA verified successfully");
                },
                "expired-callback": () => {
                    console.log("reCAPTCHA expired, reinitializing...");
                    this.clearRecaptcha();
                },
            });
        }
        return this.recaptchaVerifier;
    }

    // Send OTP to phone number
    async sendOTP(phoneNumber) {
        try {
            // Ensure reCAPTCHA is initialized
            if (!this.recaptchaVerifier) {
                this.initializeRecaptcha();
            }

            // Format phone number (assuming Indian numbers)
            const formattedPhone = phoneNumber.startsWith("+91")
                ? phoneNumber
                : `+91${phoneNumber}`;

            // Send OTP
            this.confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                this.recaptchaVerifier
            );

            console.log("OTP sent successfully");
            return { success: true, message: "OTP sent successfully!" };
        } catch (error) {
            console.error("Error sending OTP:", error);
            this.clearRecaptcha(); // Clear on error

            // Handle specific error cases
            let errorMessage = "Failed to send OTP. Please try again.";
            if (error.code === "auth/invalid-phone-number") {
                errorMessage = "Invalid phone number format.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many requests. Please try again later.";
            }

            return { success: false, message: errorMessage };
        }
    }

    // Verify OTP
    async verifyOTP(otp) {
        try {
            if (!this.confirmationResult) {
                throw new Error(
                    "No OTP request found. Please request OTP first."
                );
            }

            const result = await this.confirmationResult.confirm(otp);
            console.log("OTP verified successfully");

            return {
                success: true,
                user: result.user,
                message: "Phone number verified successfully!",
            };
        } catch (error) {
            console.error("Error verifying OTP:", error);

            let errorMessage = "Invalid OTP. Please try again.";
            if (error.code === "auth/invalid-verification-code") {
                errorMessage = "Invalid verification code.";
            } else if (error.code === "auth/code-expired") {
                errorMessage = "OTP has expired. Please request a new one.";
            }

            return { success: false, message: errorMessage };
        }
    }

    // Clear reCAPTCHA verifier
    clearRecaptcha() {
        if (this.recaptchaVerifier) {
            this.recaptchaVerifier.clear();
            this.recaptchaVerifier = null;
        }
    }

    // Reset service state
    reset() {
        this.clearRecaptcha();
        this.confirmationResult = null;
    }
}

// Export singleton instance
export const phoneAuthService = new PhoneAuthService();
