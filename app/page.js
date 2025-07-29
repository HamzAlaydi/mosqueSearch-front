"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Shield,
  Users,
  Heart,
  MessageCircle,
  UserCheck,
  ChevronRight,
  Star,
  Clock,
  Filter,
  Grid,
  List,
  Navigation,
} from "lucide-react";
import Image from "next/image";

// Local images for the hero slider
import Image1 from "@/public/images/sliders/Luxury-Interior-Of-Sheikh-Zayed-Grand-Mosque-Abu-Dhabi.webp";
import Image2 from "@/public/images/sliders/Ortakoy-Mosque-Interior.webp";
import Image3 from "@/public/images/sliders/Inside-the-Grand-Mosque.jpg";

export default function MosqueHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("professional");
  const [mapView, setMapView] = useState(true);

  // Updated heroSlides to use imported images
  const heroSlides = [
    {
      title: "Online database mosque for a marge",
      subtitle: "Professional & Mosque-based search with integrated map view",
      image: Image1,
      features: ["Dual Search Modes", "Map Integration", "Imam Verification"],
    },
    {
      title: "Find your perfect partner in a mosque",
      subtitle: "Connect with matches approved by your local mosque leadership",
      image: Image2,
      features: ["Mosque Verification", "Wali Integration", "Islamic Values"],
    },
    {
      title:
        "Your Mosque’s online database of Spouses Find your Perfect in s Mosque",
      subtitle: "secure, privacy-first messaging",
      image: Image3,
      features: [
        "Advanced Filters",
        "Secure Platform",
        "Distance-Based Search",
      ],
    },
  ];

  const features = [
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Dual Search Modes",
      description:
        "Toggle between Professional search across all users or filter by specific mosques in your area",
      highlight: "Switch modes instantly",
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      title: "Interactive Map View",
      description:
        "Visualize potential matches and mosques on an integrated map with distance-based filtering",
      highlight: "Real-time location filtering",
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      title: "Mosque Verification",
      description:
        "All members verified by local mosque leadership ensuring authentic Islamic community connections",
      highlight: "Imam-approved profiles",
    },
    {
      icon: <UserCheck className="w-8 h-8 text-emerald-600" />,
      title: "Wali Integration",
      description:
        "Built-in guardian involvement system for proper Islamic matrimonial guidance and approval",
      highlight: "Islamic compliance",
    },
    {
      icon: <Filter className="w-8 h-8 text-emerald-600" />,
      title: "Advanced Filtering",
      description:
        "Filter by religiousness, education, profession, age, children preferences, and willingness to relocate",
      highlight: "15+ filter categories",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-emerald-600" />,
      title: "Secure Messaging",
      description:
        "Privacy-focused communication system where information is shared only with mutual consent",
      highlight: "End-to-end privacy",
    },
  ];

  // Updated mockMatches with internet images
  const mockMatches = [
    {
      name: "Sarah M.",
      age: 28,
      profession: "Teacher",
      mosque: "Central London Mosque",
      distance: "2.3 miles",
      verified: true,
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    },
    {
      name: "Ahmed K.",
      age: 32,
      profession: "Software Engineer",
      mosque: "East London Mosque",
      distance: "4.1 miles",
      verified: true,
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    },
    {
      name: "Fatima A.",
      age: 26,
      profession: "Medical Professional",
      mosque: "Regent's Park Mosque",
      distance: "1.8 miles",
      verified: true,
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Function to handle smooth scrolling
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 64; // Corresponds to h-16 (4rem) navbar height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                MosqueZawaj
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, "#features")}
                className="text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, "#how-it-works")}
                className="text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                How it Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => handleSmoothScroll(e, "#testimonials")}
                className="text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Success Stories
              </a>
              <a
                href="/auth/login"
                className="text-gray-700 hover:text-emerald-600 transition-colors"
              >
                Login
              </a>
              <a
                href="/auth/signup"
                className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
            {/* Using Next.js Image component for optimization */}
            <Image
              src={slide.image}
              alt="Hero background"
              layout="fill"
              objectFit="cover"
              priority={index === 0}
              placeholder="blur"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center max-w-4xl px-6">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {slide.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth/signup"
                    className="bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </a>
                  <a
                    href="#features"
                    onClick={(e) => handleSmoothScroll(e, "#features")}
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all cursor-pointer"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all ${
                currentSlide === index ? "bg-white w-8" : "bg-white/50 w-3"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Search Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience Our Advanced Search
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Toggle between professional and mosque-based search modes with
              integrated map view
            </p>
          </div>

          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <button
                onClick={() => setActiveTab("professional")}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === "professional"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                Professional Search
              </button>
              <button
                onClick={() => setActiveTab("mosque")}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === "mosque"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                Mosque Search
              </button>
            </div>
          </div>

          {/* Mock Search Interface */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-full p-3">
                    <Search className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeTab === "professional"
                        ? "Professional Matches"
                        : "Mosque-Based Matches"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activeTab === "professional"
                        ? "Within 20 miles"
                        : "From selected mosques"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMapView(!mapView)}
                    className={`p-2 rounded-full ${
                      mapView
                        ? "bg-emerald-100 text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-400">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-96">
              {/* Matches List */}
              <div
                className={`${
                  mapView ? "w-1/2" : "w-full"
                } p-4 space-y-3 overflow-y-auto`}
              >
                {mockMatches.map((match, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={match.image}
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {match.verified && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {match.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          ({match.age})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {match.profession}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span>{match.mosque}</span>
                        <span>•</span>
                        <span>{match.distance}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>

              {/* Map View */}
              {mapView && (
                <div className="w-1/2 bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">
                        Interactive Map View
                      </p>
                      <p className="text-sm text-gray-500">
                        Visualize matches and mosques
                      </p>
                    </div>
                  </div>
                  {/* Mock map pins */}
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white p-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="absolute top-12 right-8 bg-blue-600 text-white p-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-8 left-8 bg-purple-600 text-white p-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MosqueZawaj?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines modern technology with Islamic values to
              create the most comprehensive matrimonial experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="inline-flex p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="inline-flex items-center text-emerald-600 font-medium text-sm">
                  <span>{feature.highlight}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to find your perfect match through Islamic community
            </p>
          </div>

          <div className="relative grid md:grid-cols-5 gap-8">
            {[
              {
                icon: <UserCheck className="w-8 h-8" />,
                title: "Register",
                desc: "Create your profile with Islamic values",
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Set Preferences",
                desc: "Define what you're looking for",
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Link to Mosque",
                desc: "Get verified by local imam",
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Find Matches",
                desc: "Browse professional or mosque-based",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Connect",
                desc: "Communicate with Wali involvement",
              },
            ].map((step, index, arr) => (
              <div key={index} className="text-center relative">
                <div className="inline-flex p-4 bg-emerald-600 text-white rounded-2xl mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
                {index < arr.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full">
                    <svg
                      className="w-full h-6 text-emerald-200"
                      fill="none"
                      viewBox="0 0 100 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        d="M0 12h100"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Real couples who found love through MosqueZawaj
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "MosqueZawaj's mosque verification gave us complete confidence. The imam's involvement made our families comfortable, and we found each other through our shared community values.",
                author: "Omar & Aisha",
                location: "London, UK",
                image:
                  "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg",
              },
              {
                quote:
                  "The dual search feature was perfect - we could explore both professional matches and those from our local mosque. The map view helped us find someone truly nearby.",
                author: "Ahmed & Fatima",
                location: "Manchester, UK",
                image:
                  "https://images.pexels.com/photos/3775087/pexels-photo-3775087.jpeg",
              },
              {
                quote:
                  "Having the Wali integration from the start made everything halal and comfortable. We appreciated the Islamic approach to modern matrimonial matching.",
                author: "Yusuf & Maryam",
                location: "Birmingham, UK",
                image:
                  "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of Muslims who found love through mosque-verified
            matrimony
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Join Free Today
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/auth/login"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition-all"
            >
              Already a Member?
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MosqueZawaj</span>
            </div>
            <div className="flex space-x-8">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Support
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} MosqueZawaj. All rights
              reserved. Islamic matrimony made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}