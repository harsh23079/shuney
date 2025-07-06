import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clapperboard,
    Users,
    Crown,
    Music,
    LogOut,
    Shield,
    UserX,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export default function ServicesPage() {
    const services = [
        {
            title: "Become Creator With Us",
            description: "Join our creator program and start earning",
            icon: Clapperboard,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Contact Us",
            description: "Get in touch with our support team",
            icon: Users,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Get Premium",
            description: "Unlock exclusive content and features",
            icon: Crown,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Turn on Music",
            description: "Enable background music for better experience",
            icon: Music,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Sign Out",
            description: "Safely logout from your account",
            icon: LogOut,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Privacy Policy",
            description: "Read our privacy policy and terms",
            icon: Shield,
            color: "bg-gradient-to-r from-orange-500 to-red-500",
        },
        {
            title: "Delete Account",
            description: "Permanently delete your account",
            icon: UserX,
            color: "bg-gradient-to-r from-red-600 to-red-700",
        },
    ];
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gray-900/50 border-b border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-white hover:text-orange-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold">
                            <span className="text-orange-500">Our</span>{" "}
                            Services
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-4">
                    {services.map((service, index) => {
                        const IconComponent = service.icon;
                        return (
                            <Card
                                key={index}
                                className="bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden"
                            >
                                <CardContent className="p-0">
                                    <Button
                                        className={`w-full h-auto p-6 ${service.color} hover:opacity-90 transition-opacity justify-start text-left`}
                                        variant="ghost"
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="bg-black/20 p-3 rounded-lg">
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold text-lg mb-1">
                                                    {service.title}
                                                </h3>
                                                <p className="text-white/80 text-sm">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
