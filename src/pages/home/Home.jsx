import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import NavBar from "../../components/NavBar";
import LoginModal from "./LoginModal";
import { Mic, Play, Rocket } from "lucide-react";
import DemoSession from "./DemoSession";

// Add Material Icons CSS
const materialIconsLink = document.createElement("link");
materialIconsLink.href =
  "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIconsLink.rel = "stylesheet";
document.head.appendChild(materialIconsLink);

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const features = [
    {
      icon: "mic",
      iconColor: "purple",
      title: "Voice Transcription",
      description:
        "Real-time conversion of patient conversations into accurate text transcripts with medical terminology recognition.",
    },
    {
      icon: "psychology",
      iconColor: "orange",
      title: "AI-Powered Notes",
      description:
        "Intelligent generation of clinical notes using advanced AI technology trained on dental terminology and best practices.",
    },
    {
      icon: "description",
      iconColor: "red",
      title: "Template System",
      description:
        "SOAP, Periodontal, Restorative, and custom note templates to match your practice workflow.",
    },
    {
      icon: "lock",
      iconColor: "yellow",
      title: "HIPAA Compliant",
      description:
        "Secure, encrypted storage and processing of patient health information with full HIPAA compliance.",
    },
    {
      icon: "timer",
      iconColor: "green",
      title: "Time Saving",
      description:
        "Reduce documentation time by up to 50% with automated note generation and smart templates.",
    },
    {
      icon: "groups",
      iconColor: "blue",
      title: "Practice Management",
      description:
        "Integrated patient management and analytics dashboard to track practice performance.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavBar onLoginClick={() => setIsLoginModalOpen(true)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="text-center py-20 px-4 relative shadow-[0_8px_24px_0_rgba(0,0,0,0.01)]">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating circles */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200/30 dark:bg-teal-800/20 rounded-full animate-float-slow"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-40 left-20 w-24 h-24 bg-blue-200/30 dark:bg-blue-800/20 rounded-full animate-float-fast"></div>
            <div className="absolute bottom-20 right-10 w-12 h-12 bg-purple-200/30 dark:bg-purple-800/20 rounded-full animate-float-slow"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-pink-200/30 dark:bg-pink-800/20 rounded-full animate-float-medium"></div>
            <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-yellow-200/30 dark:bg-yellow-800/20 rounded-full animate-float-fast"></div>

            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 dark:from-teal-600/10 dark:to-emerald-600/10 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-xl animate-pulse-medium"></div>

            {/* Moving lines */}
            {/* <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-300/30 dark:via-teal-600/20 to-transparent animate-slide-right"></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300/30 dark:via-emerald-600/20 to-transparent animate-slide-left"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/30 dark:via-blue-600/20 to-transparent animate-slide-right-slow"></div>
            </div> */}

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>
          </div>
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-6 leading-tight">
              <span className="text-teal-600">AI-Powered</span> Dental Scribe
              Assistant
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
                <Mic size={24} />
                Start Free Trial
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-all transform hover:scale-105"
                onClick={() => (window.location.href = "/dashboard/demo")}
              >
                <Play size={24} />
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800" id="features">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
              Powerful Features for Modern{" "}
              <span className="text-teal-600">Dental Practice</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xxl:px-60 lg:px-20 md:px-10 px-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-xl shadow-lg  transition-shadow duration-300 p-8 flex flex-col items-center text-center transform "
                >
                  <div
                    className={`bg-${feature.iconColor}-100 dark:bg-${feature.iconColor}-900/20 rounded-full p-4 mb-6 inline-flex`}
                  >
                    <span
                      className={`material-icons text-${feature.iconColor}-600 dark:text-${feature.iconColor}-400`}
                      style={{ fontSize: "36px" }}
                    >
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-s">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="container mx-auto px-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="text-white">
                <div className="text-3xl md:text-4xl font-bold mb-2">50%</div>
                <div className="text-teal-100 text-lg">Time Saved</div>
              </div>
              <div className="text-white">
                <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
                <div className="text-teal-100 text-lg">Accuracy Rate</div>
              </div>
              <div className="text-white">
                <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
                <div className="text-teal-100 text-lg">Support Available</div>
              </div>
            </div>
          </div>
        </section>
        {/* <!-- Demo Dashboard --> */}
        <DemoSession />
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
                <Rocket size={20} />
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
