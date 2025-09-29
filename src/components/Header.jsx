import { Link, useNavigate } from "react-router-dom";
import { Play, Settings, LogIn } from "lucide-react";
import { Button } from "./ui/Button";

export function Header() {
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                            <Play className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
                            <span className="text-orange-500">Shunye</span> OTT
                        </h1>
                    </Link>

                    {/* Right-side actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-orange-500"
                            onClick={handleLoginClick}
                        >
                            <LogIn className="w-5 h-5" />
                        </Button>
                        <Link to="/services">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-orange-500"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
