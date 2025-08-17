//"use client";

import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

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
            backgroundVideo: "/demo.mp4", // replace with your own video link
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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroContent.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [currentHero, heroContent.length]);

    // Move to next hero
    const nextHero = () => {
        console.log("right");
        setCurrentHero((prev) => (prev + 1) % heroContent.length);
    };

    // Move to previous hero
    const prevHero = () => {
        console.log("left");

        setCurrentHero((prev) =>
            prev === 0 ? heroContent.length - 1 : prev - 1
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextHero}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="max-w-2xl">
                            {heroContent[currentHero].badge && (
                                <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    {heroContent[currentHero].badge}
                                </Badge>
                            )}

                            <h1 className="text-5xl lg:text-7xl font-bold mb-4">
                                <span className="text-orange-500">SHUNYE</span>{" "}
                                OTT
                            </h1>

                            <h2 className="text-2xl lg:text-4xl font-bold mb-6 text-gray-200">
                                {heroContent[currentHero].subtitle}
                            </h2>

                            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
                                {heroContent[currentHero].description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold"
                                >
                                    <Play className="w-5 h-5 mr-2 fill-current" />
                                    Watch Now
                                </Button>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="bg-gray-600/70 text-white hover:bg-gray-600 px-8 py-3 text-lg font-semibold"
                                >
                                    <Info className="w-5 h-5 mr-2" />
                                    More Info
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {heroContent.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentHero(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentHero
                                    ? "bg-white"
                                    : "bg-white/50"
                            }`}
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
                                        <div className="relative overflow-hidden rounded-lg bg-gray-900 transition-transform group-hover:scale-105">
                                            <img
                                                src={
                                                    item.image ||
                                                    "/placeholder.svg"
                                                }
                                                alt={item.name}
                                                className="w-full h-36 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-12 h-12 text-white" />
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-white font-semibold text-sm">
                                                        {item.name}
                                                    </h4>
                                                    {item.icon && (
                                                        <span className="text-xl">
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
                        <div className="space-y-2">
                            <h4 className="text-4xl font-bold text-white">
                                1000+
                            </h4>
                            <p className="text-gray-300">Business Ideas</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-4xl font-bold text-white">
                                50K+
                            </h4>
                            <p className="text-gray-300">Active Learners</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-4xl font-bold text-white">
                                4.8
                            </h4>
                            <p className="text-gray-300">Average Rating</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
