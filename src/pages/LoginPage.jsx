import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Play,
    ArrowLeft,
    User,
    Briefcase,
    ChevronDown,
    Search,
} from "lucide-react";
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
        countryCode: "+91", // Default to India
        occupation: "",
    });
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

    // Country data from API
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingCountries, setLoadingCountries] = useState(true);

    // Fetch countries from REST Countries API
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch(
                    "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag"
                );
                const data = await response.json();

                // Process and sort countries
                const processedCountries = data
                    .filter((country) => country.idd && country.idd.root) // Only countries with phone codes
                    .map((country) => ({
                        name: country.name.common,
                        code: country.cca2.toLowerCase(),
                        dialCode:
                            country.idd.root +
                            (country.idd.suffixes?.[0] || ""),
                        flagUrl: `https://flagcdn.com/24x18/${country.cca2.toLowerCase()}.png`,
                        flagEmoji: country.flag,
                        // Basic regex for phone validation (can be enhanced)
                        regex: /^\d{7,15}$/, // Generic pattern, can be made country-specific
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(processedCountries);
                setFilteredCountries(processedCountries);
            } catch (error) {
                console.error("Failed to fetch countries:", error);
                // Fallback to popular countries if API fails
                const fallbackCountries = [
                    {
                        name: "India",
                        code: "in",
                        dialCode: "+91",
                        flagUrl: "https://flagcdn.com/24x18/in.png",
                        flagEmoji: "🇮🇳",
                        regex: /^[6-9]\d{9}$/,
                    },
                    {
                        name: "United States",
                        code: "us",
                        dialCode: "+1",
                        flagUrl: "https://flagcdn.com/24x18/us.png",
                        flagEmoji: "🇺🇸",
                        regex: /^\d{10}$/,
                    },
                    {
                        name: "United Kingdom",
                        code: "gb",
                        dialCode: "+44",
                        flagUrl: "https://flagcdn.com/24x18/gb.png",
                        flagEmoji: "🇬🇧",
                        regex: /^\d{10,11}$/,
                    },
                    {
                        name: "Australia",
                        code: "au",
                        dialCode: "+61",
                        flagUrl: "https://flagcdn.com/24x18/au.png",
                        flagEmoji: "🇦🇺",
                        regex: /^\d{9}$/,
                    },
                    {
                        name: "Canada",
                        code: "ca",
                        dialCode: "+1",
                        flagUrl: "https://flagcdn.com/24x18/ca.png",
                        flagEmoji: "🇨🇦",
                        regex: /^\d{10}$/,
                    },
                ];
                setCountries(fallbackCountries);
                setFilteredCountries(fallbackCountries);
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Filter countries based on search
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(
                (country) =>
                    country.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    country.dialCode.includes(searchTerm)
            );
            setFilteredCountries(filtered);
        }
    }, [searchTerm, countries]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(""); // Clear error when user types
    };

    // Handle country code selection
    const handleCountryCodeChange = (dialCode) => {
        setFormData((prev) => ({
            ...prev,
            countryCode: dialCode,
            phoneNumber: "",
        }));
        setIsCountryDropdownOpen(false);
        setSearchTerm("");
        setError("");
    };

    // Handle occupation select changes
    const handleOccupationChange = (value) => {
        setFormData((prev) => ({ ...prev, occupation: value }));
        setError("");
    };

    // Validate phone number based on selected country
    const validatePhoneNumber = (phone, countryCode) => {
        const selectedCountry = countries.find(
            (c) => c.dialCode === countryCode
        );
        if (!selectedCountry) return false;
        return selectedCountry.regex.test(phone);
    };

    // Get current country data
    const getCurrentCountry = () => {
        return (
            countries.find((c) => c.dialCode === formData.countryCode) || {
                name: "India",
                code: "in",
                dialCode: "+91",
                flagUrl: "https://flagcdn.com/24x18/in.png",
                flagEmoji: "🇮🇳",
                regex: /^[6-9]\d{9}$/,
            }
        );
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

        if (!validatePhoneNumber(formData.phoneNumber, formData.countryCode)) {
            const currentCountry = getCurrentCountry();
            setError(
                `Please enter a valid phone number for ${currentCountry.name}`
            );
            return;
        }

        if (!formData.occupation) {
            setError("Please select your occupation");
            return;
        }

        setIsLoading(true);

        try {
            // Send full phone number with country code
            const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
            const result = await phoneAuthService.sendOTP(fullPhoneNumber);

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
                // Save user data with full phone number
                const userData = {
                    uid: verifyResult.user.uid,
                    username: formData.username,
                    phoneNumber: formData.countryCode + formData.phoneNumber,
                    countryCode: formData.countryCode,
                    occupation: formData.occupation,
                };

                const saveResult = await userService.saveUser(userData);

                if (saveResult.success) {
                    console.log("Login successful!", saveResult);
                    navigate("/dashboard");
                } else {
                    setError("Login successful but failed to save user data");
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

        const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
        const result = await phoneAuthService.sendOTP(fullPhoneNumber);

        if (result.success) {
            setError("");
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    const handleBackClick = () => navigate(-1);

    const currentCountry = getCurrentCountry();

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
                                    {/* Country Code Dropdown */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsCountryDropdownOpen(
                                                    !isCountryDropdownOpen
                                                )
                                            }
                                            className="flex items-center px-3 py-3 bg-gray-50 border border-gray-300 rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors min-w-[100px]"
                                            disabled={
                                                isLoading || loadingCountries
                                            }
                                        >
                                            {loadingCountries ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <img
                                                        src={
                                                            currentCountry.flagUrl
                                                        }
                                                        alt={
                                                            currentCountry.name
                                                        }
                                                        className="w-6 h-4 mr-2 object-cover rounded-sm"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.nextSibling.style.display =
                                                                "inline";
                                                        }}
                                                    />
                                                    <span className="text-lg mr-2 hidden">
                                                        {
                                                            currentCountry.flagEmoji
                                                        }
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700 mr-1">
                                                        {
                                                            currentCountry.dialCode
                                                        }
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                </>
                                            )}
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isCountryDropdownOpen &&
                                            !loadingCountries && (
                                                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
                                                    {/* Search Input */}
                                                    <div className="p-3 border-b border-gray-200">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search countries..."
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                                value={
                                                                    searchTerm
                                                                }
                                                                onChange={(e) =>
                                                                    setSearchTerm(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Countries List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredCountries.length >
                                                        0 ? (
                                                            filteredCountries.map(
                                                                (country) => (
                                                                    <button
                                                                        key={
                                                                            country.code
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleCountryCodeChange(
                                                                                country.dialCode
                                                                            )
                                                                        }
                                                                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-left"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                country.flagUrl
                                                                            }
                                                                            alt={
                                                                                country.name
                                                                            }
                                                                            className="w-6 h-4 mr-3 object-cover rounded-sm"
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.target.style.display =
                                                                                    "none";
                                                                                e.target.nextSibling.style.display =
                                                                                    "inline";
                                                                            }}
                                                                        />
                                                                        <span className="text-lg mr-3 hidden">
                                                                            {
                                                                                country.flagEmoji
                                                                            }
                                                                        </span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                                {
                                                                                    country.name
                                                                                }
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {
                                                                                    country.dialCode
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        {formData.countryCode ===
                                                                            country.dialCode && (
                                                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                        )}
                                                                    </button>
                                                                )
                                                            )
                                                        ) : (
                                                            <div className="px-4 py-8 text-center text-gray-500">
                                                                No countries
                                                                found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="pl-3 py-3 rounded-l-none border-l-0 focus:border-l"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter your phone number without the country
                                    code
                                </p>
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
                                    loadingCountries ||
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
                                    OTP sent to {formData.countryCode}
                                    {formData.phoneNumber}
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

            {/* Overlay to close dropdown when clicking outside */}
            {isCountryDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCountryDropdownOpen(false)}
                />
            )}
        </div>
    );
}
