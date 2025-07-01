import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 p-6">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ISSAI Avatar
                        </span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
                        <a href="#demo" className="hover:text-blue-300 transition-colors">Demo</a>
                        <a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a>
                        <a href="#contact" className="hover:text-blue-300 transition-colors">Contact</a>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
                <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="mb-8">
                        <span className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-4">
                            🚀 Next-Generation Learning Platform
                        </span>
                        <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-gray-300 text-xs font-medium">
                                Developed at ISSAI, Nazarbayev University
                            </span>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Virtual Learning
                        </span>
                        <br />
                        <span className="text-white">Reimagined</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                        Experience the future of education with AI-powered metahuman avatars,
                        immersive 3D environments, and real-time collaborative learning spaces
                        that make distance learning feel personal and engaging.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            to="/classroom"
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                        >
                            <span className="relative z-10">Start Learning Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </Link>
                        <button className="px-8 py-4 border-2 border-white/20 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                            Watch Demo
                        </button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mt-20">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">AI Metahuman Educators</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Interact with lifelike AI avatars that provide personalized instruction,
                                real-time feedback, and adaptive learning experiences.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Immersive 3D Classrooms</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Step into photorealistic virtual environments designed for optimal
                                learning, from ancient Rome to modern laboratories.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Real-time Collaboration</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Connect with peers worldwide through HD video, spatial audio,
                                and interactive whiteboards in shared virtual spaces.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* ISSAI Attribution Section */}
                    <div className="text-center mb-8">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-center justify-center mb-6">
                                <img
                                    src="/issai logo.png"
                                    alt="ISSAI Logo"
                                    className="h-20 w-auto mb-4 md:mb-0 md:mr-6 transition-transform duration-300 hover:scale-105"
                                />
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Institute of Smart Systems and Artificial Intelligence
                                    </h3>
                                    <p className="text-blue-300 font-semibold text-lg">Nazarbayev University</p>
                                    <div className="flex items-center justify-center md:justify-start mt-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-300">Research & Development</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-lg">
                                This project was developed within <span className="font-semibold text-blue-300">ISSAI</span> (Institute of Smart Systems and Artificial Intelligence)
                                at <span className="font-semibold text-blue-300">Nazarbayev University</span>, advancing the frontiers of educational technology through innovative
                                AI-powered solutions and immersive learning experiences.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium">
                                    Artificial Intelligence
                                </span>
                                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium">
                                    Educational Technology
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-sm font-medium">
                                    Immersive Learning
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8">
                        <div className="text-center text-gray-400">
                            <p>&copy; 2025 EduVerse. Transforming education through immersive technology. All rights reserved.</p>
                            <p className="mt-2 text-sm">Made by Adil Ergen | Developed at ISSAI, Nazarbayev University</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}; 