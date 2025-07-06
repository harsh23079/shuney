"use client";

import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 text-gray-400 hover:text-orange-500 transition-colors duration-200 mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        About{" "}
                        <span className="text-orange-500">Levels Learning</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Empowering individuals with practical business skills
                        and creative content to achieve their professional
                        goals.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="mb-16">
                    <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold">Our Mission</h2>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            At Levels Learning, we believe that everyone
                            deserves access to high-quality business education
                            and creative content. Our mission is to bridge the
                            gap between traditional learning and practical
                            skills that matter in today's competitive world. We
                            provide comprehensive courses, tutorials, and
                            resources that help individuals and businesses grow
                            and succeed.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500 transition-colors duration-200">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Expert Instructors
                        </h3>
                        <p className="text-gray-400">
                            Learn from industry professionals with years of
                            real-world experience in business and creative
                            fields.
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500 transition-colors duration-200">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Quality Content
                        </h3>
                        <p className="text-gray-400">
                            Carefully curated courses and tutorials designed to
                            provide practical, actionable knowledge you can
                            apply immediately.
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500 transition-colors duration-200">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            Community Support
                        </h3>
                        <p className="text-gray-400">
                            Join a thriving community of learners and creators
                            who support each other's growth and success.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-8 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold text-white mb-2">
                                1000+
                            </div>
                            <div className="text-orange-100">
                                Business Ideas
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-2">
                                50K+
                            </div>
                            <div className="text-orange-100">
                                Active Learners
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-2">
                                4.8
                            </div>
                            <div className="text-orange-100">
                                Average Rating
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">
                        Our Story
                    </h2>
                    <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            Founded with a vision to democratize business
                            education, Levels Learning started as a small
                            initiative to help individuals acquire practical
                            skills that traditional education often overlooks.
                            We recognized that many talented people struggle to
                            bridge the gap between theoretical knowledge and
                            real-world application.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            Today, we've grown into a comprehensive learning
                            platform that serves thousands of students across
                            various business domains. From mobile repairing to
                            digital marketing, from creative content creation to
                            entrepreneurship, we cover a wide spectrum of skills
                            that are in high demand in today's market.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Our commitment remains the same: to provide
                            accessible, practical, and high-quality education
                            that empowers individuals to build successful
                            careers and businesses.
                        </p>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="text-center bg-gray-900 rounded-lg p-8 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Join thousands of learners who are already transforming
                        their careers with Levels Learning.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/business")}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Explore Courses
                        </button>
                        <button
                            onClick={() => navigate("/services")}
                            className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Our Services
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
