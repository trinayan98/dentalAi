import React from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const Home = () => {
  const features = [
    {
      icon: "🎤",
      title: "Voice Transcription",
      description:
        "Real-time conversion of patient conversations into accurate text transcripts with medical terminology recognition.",
    },
    {
      icon: "🧠",
      title: "AI-Powered Notes",
      description:
        "Intelligent generation of clinical notes using advanced AI technology trained on dental terminology and best practices.",
    },
    {
      icon: "📋",
      title: "Template System",
      description:
        "SOAP, Periodontal, Restorative, and custom note templates to match your practice workflow.",
    },
    {
      icon: "🔒",
      title: "HIPAA Compliant",
      description:
        "Secure, encrypted storage and processing of patient health information with full HIPAA compliance.",
    },
    {
      icon: "⏱️",
      title: "Time Saving",
      description:
        "Reduce documentation time by up to 50% with automated note generation and smart templates.",
    },
    {
      icon: "👥",
      title: "Practice Management",
      description:
        "Integrated patient management and analytics dashboard to track practice performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🦷</span>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                AI Dental Scribe
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                href="#demo"
              >
                Demo
              </a>
              <a
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                href="#pricing"
              >
                Pricing
              </a>
              <a
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                href="#contact"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                onClick={() => (window.location.href = "/auth/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                onClick={() => (window.location.href = "/auth/signup")}
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-6 leading-tight">
              AI-Powered Dental Scribe Assistant
            </h1>
            <p className="text-lg md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your dental practice with intelligent voice
              transcription and automated clinical note generation. Save time,
              improve accuracy, and focus on what matters most - your patients.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:scale-105"
                onClick={() => (window.location.href = "/auth/signup")}
              >
                <span className="text-xl">🎤</span>
                Start Free Trial
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-all transform hover:scale-105"
                onClick={() => (window.location.href = "/dashboard/demo")}
              >
                <span className="text-xl">▶️</span>
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-800" id="features px-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
              Powerful Features for Modern Dental Practice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-8 shadow-lg hover:shadow-xl m-8 transition-all duration-300 transform hover:-translate-y-2 border-0"
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6 mx-auto">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="text-white">
                <div className="text-3xl md:text-5xl font-bold mb-2">50%</div>
                <div className="text-teal-100">Time Saved</div>
              </div>
              <div className="text-white">
                <div className="text-3xl md:text-5xl font-bold mb-2">99.9%</div>
                <div className="text-teal-100">Accuracy Rate</div>
              </div>
              <div className="text-white">
                <div className="text-3xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-teal-100">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of dental professionals who have already
              streamlined their workflow with AI-powered transcription.
            </p>
            <div className="w-full flex justify-center">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:scale-105"
                onClick={() => (window.location.href = "/auth/signup")}
              >
                <span className="text-xl">🚀</span>
                Get Started Today
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 AI Dental Scribe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
