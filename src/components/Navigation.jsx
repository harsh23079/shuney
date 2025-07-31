import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Briefcase,
    Play,
    BarChart3,
    Users,
    BadgeIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

export function Navigation() {
    const location = useLocation();

    const navItems = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/feed", label: "Feed", icon: BadgeIcon },
        { href: "/business", label: "Business", icon: Briefcase },
        { href: "/reel", label: "Reels", icon: Play },
        { href: "/level/categories", label: "Levels", icon: BarChart3 },
        { href: "/creators", label: "Creators", icon: Users },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200",
                                isActive
                                    ? "text-orange-500 bg-gray-800"
                                    : "text-gray-400 hover:text-orange-400 hover:bg-gray-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}