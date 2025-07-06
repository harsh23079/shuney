import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    Play,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="bg-black border-t border-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start text-center">
                    {/* Brand Section */}
                    <div className="space-y-4 flex flex-col items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                                <Play className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-xl font-bold text-orange-500">
                                    Shunye
                                </span>{" "}
                                OTT
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empowering learners with comprehensive business
                            skills and creative content. Start your journey to
                            success today.
                        </p>
                        <div className="flex space-x-4 justify-center">
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-orange-500">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 flex flex-col items-center">
                            <li>
                                <Link
                                    to="/services"
                                    className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-orange-500">
                            Contact Us
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div className="text-gray-400 text-sm text-left">
                                    <p>D 197, Laxmi Nagar</p>
                                    <p>Delhi, East - 110092</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <a
                                    href="tel:8860702838"
                                    className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm"
                                >
                                    8860702838
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <a
                                    href="mailto:levelslearning123@gmail.com"
                                    className="text-gray-400 hover:text-orange-500 transition-colors duration-200 text-sm break-all"
                                >
                                    levelslearning123@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 py-6 space-y-2 mb-14 text-center">
                    <div className="text-gray-500 text-sm">
                        © 2024 Copyright:
                        <span className="text-orange-500 ml-1">
                            levelslearning123@gmail.com
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
