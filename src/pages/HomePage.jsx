import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Info } from "lucide-react";

// Custom Button component
const Button = ({
    children,
    size = "default",
    variant = "default",
    className = "",
    onClick,
    ...props
}) => {
    const baseClasses =
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    const sizeClasses = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
    };

    const variantClasses = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

// Custom Badge component
const Badge = ({ children, className = "" }) => {
    return (
        <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
        >
            {children}
        </div>
    );
};

export default function HomePage() {
    const [currentHero, setCurrentHero] = useState(0);

    const heroContent = [
        {
            id: 1,
            title: "SHUNYE OTT",
            subtitle: "चलो BUSINESS सीखें",
            description:
                "Start implementing your ideas with our comprehensive business learning platform. Join 50K+ active learners on their entrepreneurial journey.",
            backgroundImage:
                "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&h=1080&fit=crop",
            type: "image",
            badge: "Every Saturday 11pm - Latest Video",
        },
        {
            id: 2,
            title: "Slow Motion Launch",
            subtitle: "Experience the journey",
            description:
                "A cinematic slow-motion background for better immersion.",
            backgroundVideo: "/demo.mp4",
            type: "video",
            badge: "Featured Slow-Mo",
        },
        {
            id: 3,
            title: "Dharm Yudh",
            subtitle: "Spiritual Business Journey",
            description:
                "Discover the spiritual aspects of entrepreneurship and how dharma guides successful business practices.",
            backgroundImage:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop",
            type: "image",
            badge: "Featured Content",
        },
        {
            id: 4,
            title: "Karm Yudh",
            subtitle: "Action-Oriented Business",
            description:
                "Learn practical business strategies through action-based learning and real-world implementations.",
            backgroundImage:
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop",
            type: "image",
            badge: "New Release",
        },
    ];

    const contentRows = [
        {
            title: "Popular Business Categories",
            items: [
                {
                    name: "Mobile Repairing",
                    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop",
                    icon: "📱",
                },
                {
                    name: "Cab Driving",
                    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop",
                    icon: "🚗",
                },
                {
                    name: "Carpenter Business",
                    image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop",
                    icon: "🔨",
                },
                {
                    name: "Plumber Business",
                    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop",
                    icon: "🔧",
                },
                {
                    name: "Electrician Business",
                    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
                    icon: "⚡",
                },
            ],
        },
        {
            title: "Featured Categories",
            items: [
                {
                    name: "Dharm Yudh",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
                },
                {
                    name: "Karm Yudh",
                    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
                },
                {
                    name: "Youtube Class",
                    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
                },
                {
                    name: "Shunye Dhristi",
                    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&h=200&fit=crop",
                },
            ],
        },
        {
            title: "Trending Now",
            items: [
                {
                    name: "Business Startup Guide",
                    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop",
                },
                {
                    name: "Digital Marketing",
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
                },
                {
                    name: "Financial Planning",
                    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop",
                },
                {
                    name: "Leadership Skills",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
                },
            ],
        },
    ];

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroContent.length);
        }, 6000); // Changed to 6 seconds for better UX

        return () => clearInterval(interval);
    }, []); // Removed dependencies to prevent recreation

    // Move to next hero
    const nextHero = () => {
        setCurrentHero((prev) => (prev + 1) % heroContent.length);
    };

    // Move to previous hero
    const prevHero = () => {
        setCurrentHero((prev) =>
            prev === 0 ? heroContent.length - 1 : prev - 1
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative h-[800px] overflow-hidden">
                <div className="absolute inset-0">
                    {heroContent[currentHero].type === "video" ? (
                        <video
                            src={heroContent[currentHero].backgroundVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onLoadedMetadata={(e) => {
                                e.currentTarget.playbackRate = 0.5;
                            }}
                        />
                    ) : (
                        <img
                            src={
                                heroContent[currentHero].backgroundImage ||
                                "/placeholder.svg"
                            }
                            alt={heroContent[currentHero].title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Hero Navigation */}
                <button
                    onClick={prevHero}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-orange-500 rounded-full p-3 transition-all duration-200 hover:scale-110"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextHero}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-orange-500 rounded-full p-3 transition-all duration-200 hover:scale-110"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Hero Content */}
                <div className="absolute bottom-28 right-8 z-10 flex gap-4">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Watch Now
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="bg-gradient-to-r from-gray-600/70 to-gray-700 text-white 
             hover:from-orange-600 hover:to-red-600 
             px-8 py-3 text-lg font-semibold border border-gray-500 
             transition-all duration-200 hover:scale-105"
                    >
                        <Info className="w-5 h-5 mr-2" />
                        More Info
                    </Button>
                </div>

                {/* Hero Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {heroContent.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentHero(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentHero
                                    ? "bg-orange-500 scale-125"
                                    : "bg-white/50 hover:bg-white/70"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Content Rows */}
            <div className="relative z-20 -mt-32 pb-16">
                {contentRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="mb-12">
                        <div className="container mx-auto px-4 lg:px-8">
                            <h3 className="text-2xl font-bold mb-6 text-white">
                                {row.title}
                            </h3>

                            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                                {row.items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className="flex-none w-64 group cursor-pointer"
                                    >
                                        <div className="relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Play className="w-12 h-12 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors duration-200">
                                                        {item.name}
                                                    </h4>
                                                    {item.icon && (
                                                        <span className="text-xl transform group-hover:scale-125 transition-transform duration-200">
                                                            {item.icon}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-2 group cursor-pointer">
                            <h4 className="text-4xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200">
                                1000+
                            </h4>
                            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                Business Ideas
                            </p>
                        </div>
                        <div className="space-y-2 group cursor-pointer">
                            <h4 className="text-4xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200">
                                50K+
                            </h4>
                            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                Active Learners
                            </p>
                        </div>
                        <div className="space-y-2 group cursor-pointer">
                            <h4 className="text-4xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200">
                                4.8
                            </h4>
                            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                                Average Rating
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
