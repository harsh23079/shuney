import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ArrowLeft, User, Briefcase } from "lucide-react";
import { phoneAuthService } from "../lib/phoneAuth";
import { userService } from "../lib/userService";

import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "../components/ui/Select";
import { Button } from "../components/ui/Button";

export default function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        phoneNumber: "",
        occupation: "",
    });
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(""); // Clear error when user types
    };

    // Handle occupation select changes
    const handleOccupationChange = (value) => {
        setFormData((prev) => ({ ...prev, occupation: value }));
        setError("");
    };

    // Validate phone number
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
        return phoneRegex.test(phone);
    };

    // Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.username.trim()) {
            setError("Please enter your username");
            return;
        }

        if (!validatePhoneNumber(formData.phoneNumber)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        if (!formData.occupation) {
            setError("Please select your occupation");
            return;
        }

        setIsLoading(true);

        try {
            const result = await phoneAuthService.sendOTP(formData.phoneNumber);

            if (result.success) {
                setIsOtpSent(true);
                setError("");
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTP and login
    const handleVerifyOtp = async () => {
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);

        try {
            // Verify OTP
            const verifyResult = await phoneAuthService.verifyOTP(otp);

            if (verifyResult.success) {
                // Save user data
                const userData = {
                    uid: verifyResult.user.uid,
                    username: formData.username,
                    phoneNumber: formData.phoneNumber,
                    occupation: formData.occupation,
                };

                const saveResult = await userService.saveUser(userData);

                if (saveResult.success) {
                    console.log("Login successful!", saveResult);
                    navigate("/dashboard"); // Redirect to dashboard
                } else {
                    setError("Login successful but failed to save user data");
                    // Still navigate since auth was successful
                    navigate("/dashboard");
                }
            } else {
                setError(verifyResult.message);
            }
        } catch (error) {
            setError("Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setIsLoading(true);
        setError("");

        const result = await phoneAuthService.sendOTP(formData.phoneNumber);

        if (result.success) {
            setError("");
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    const handleBackClick = () => navigate(-1);

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-x-clip">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('/placeholder.svg?height=1080&width=1920')",
                    filter: "blur(8px)",
                    transform: "scale(1.1)",
                }}
            />
            <div className="absolute inset-0 bg-black/70" />

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-20 text-white hover:text-orange-500"
                onClick={handleBackClick}
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-orange-500 p-3 rounded-lg">
                            <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                        <div className="text-3xl font-bold">
                            <span className="text-orange-500">Shunye</span>{" "}
                            <span className="text-white">OTT</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome Back
                    </h1>
                    <p className="text-gray-300 mt-2">
                        Sign in to continue learning business
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {!isOtpSent ? (
                        /* Registration Form */
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="username"
                                    className="text-gray-700 font-medium"
                                >
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        className="pl-10 py-3"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="phoneNumber"
                                    className="text-gray-700 font-medium"
                                >
                                    Phone Number
                                </Label>
                                <div className="flex">
                                    <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm">
                                        +91
                                    </div>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="pl-3 py-3 rounded-l-none"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="occupation"
                                    className="text-gray-700 font-medium"
                                >
                                    Occupation
                                </Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                    <Select
                                        onValueChange={handleOccupationChange}
                                        value={formData.occupation}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="pl-10 py-3">
                                            <SelectValue placeholder="Select your occupation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">
                                                Student
                                            </SelectItem>
                                            <SelectItem value="professional">
                                                Professional
                                            </SelectItem>
                                            <SelectItem value="entrepreneur">
                                                Entrepreneur
                                            </SelectItem>
                                            <SelectItem value="business-owner">
                                                Business Owner
                                            </SelectItem>
                                            <SelectItem value="freelancer">
                                                Freelancer
                                            </SelectItem>
                                            <SelectItem value="job-seeker">
                                                Job Seeker
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3 text-white font-semibold text-lg"
                                disabled={
                                    isLoading ||
                                    !formData.username ||
                                    !formData.phoneNumber ||
                                    !formData.occupation
                                }
                            >
                                {isLoading ? "Sending OTP..." : "Send OTP"}
                            </Button>
                        </form>
                    ) : (
                        /* OTP Verification */
                        <div className="space-y-6">
                            <div className="text-center mb-4">
                                <p className="text-gray-600">
                                    OTP sent to +91{formData.phoneNumber}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="otp"
                                    className="text-gray-700 font-medium"
                                >
                                    Enter OTP
                                </Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    maxLength={6}
                                    className="py-3 text-center text-lg tracking-widest"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                onClick={handleVerifyOtp}
                                className="w-full py-3 text-white font-semibold text-lg"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                                    disabled={isLoading}
                                >
                                    Didn't receive OTP? Resend
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Invisible reCAPTCHA container - REQUIRED */}
                    <div id="recaptcha-container" className="hidden"></div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                        Join thousands learning business with Shunye OTT
                    </p>
                </div>
            </div>
        </div>
    );
}