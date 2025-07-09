"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import Image1 from "@/public/images/sliders/Luxury-Interior-Of-Sheikh-Zayed-Grand-Mosque-Abu-Dhabi.webp";
import Image2 from "@/public/images/sliders/Ortakoy-Mosque-Interior.webp";
import Image3 from "@/public/images/sliders/Inside-the-Grand-Mosque.jpg";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Heart,
  Users,
  Building,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import "./homepage.css";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
  };
  const slides = [
    {
      image: Image1,
      alt: "Mosque interior",
      title: "Find a partner in any Mosque in any location",
      description:
        "Join our community and meet compatible Muslims in your local area",
      cta: "Get Started",
    },
    {
      image: Image2,
      alt: "Community members at mosque",
      title: "Find someone local that is known in the community",
      description: "Connect with verified individuals from your local mosque",
      cta: "Register Now",
    },
    {
      image: Image3,
      alt: "Muslim wedding ceremony",
      title: "An online solution for Marriage only",
      description:
        "Our platform is designed exclusively for Muslims seeking marriage",
      cta: "Join Us",
    },
    {
      image: Image2,
      alt: "Imam providing guidance",
      title: "Wali feature for full confidence",
      description:
        "Include your Wali in the process for proper Islamic guidance",
      cta: "Learn More",
    },
  ];
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const features = [
    {
      title: "Community Verified",
      description: "All members are verified by local mosque leadership",
      icon: <Users className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: "Wali Integration",
      description:
        "Include your guardian in the process for proper Islamic guidance",
      icon: <UserCheck className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: "Privacy Focused",
      description:
        "Your information is only shared with potential matches you approve",
      icon: <MessageCircle className="h-8 w-8 text-emerald-600" />,
    },
  ];

  const testimonials = [
    {
      quote:
        "MosqueZawaj helped me find a spouse who shares my values and vision for the future. The community verification gave me confidence throughout the process.",
      author: "Omar A.",
      role: "Software Engineer",
    },
    {
      quote:
        "The Wali feature allowed my father to be involved appropriately, making the whole experience comfortable and aligned with our traditions.",
      author: "Sara M.",
      role: "Teacher",
    },
    {
      quote:
        "MosqueZawaj connected me with someone from my local community who I might never have met otherwise. We&apos;re now happily married, alhamdulillah.",
      author: "Ahmed K.",
      role: "Medical Professional",
    },
  ];
  return (
    <>
      <div className="relative h-screen">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-4xl px-6">
                  <h1
                    className={`text-4xl md:text-6xl font-bold text-white mb-6 transition-all duration-700 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`text-xl md:text-2xl text-white mb-8 transition-all duration-700 delay-300 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Dots */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works!</h2>
          <p className="section-subtitle">
            <strong>Your Perfect Local Match, Completely Free!</strong>
          </p>

          <div className="steps">
            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>Register</h3>
              <p>Register your Info</p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Fill your Interests</h3>
              <p>Tell us what you are looking for</p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-mosque"></i>
              </div>
              <h3>Link to a Mosque</h3>
              <p>Link to a mosque and get approved by the imam</p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Connect</h3>
              <p>Connect and find the right partner</p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Wali</h3>
              <p>Talk to your partner&apos;s Wali to get his approval</p>
            </div>
          </div>
        </div>
      </section>

      <section className="success-stories">
        <div className="container">
          <h2 className="section-title">Success Stories</h2>
          <p className="testimonial-title">
            Your Perfect Local Match, Completely Free!
          </p>

          <div className="testimonials">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  Amidst digital spaces, thanks to MosqueZawaj. Our profiles
                  aligned, hearts connected, and dreams intertwined. Together,
                  we embarked on a beautiful journey, embracing love, faith, and
                  everlasting companionship. MosqueZawaj, the catalyst of our
                  blissful union.
                </p>
                <p className="testimonial-author">- Omar</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  MosqueZawaj, I discovered my soulmate, a beacon of light in a
                  digital realm. Our hearts synchronized, and with Allah&apos;s
                  blessings, we embarked on an eternal journey of love, faith,
                  and happiness.
                </p>
                <p className="testimonial-author">- Sara</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  Discovered my missing puzzle piece. Our hearts recognized each
                  other&apos;s essence, and in the journey of love and devotion,
                  we found solace, joy, and a lifelong partnership. MosqueZawaj,
                  the divine matchmaker.
                </p>
                <p className="testimonial-author">- Ahmed</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  MosqueZawaj unveiled a world of possibilities. Through its
                  platform, I discovered my true love, a companion whose heart
                  resonated with mine. Together, we embraced Islam, love, and a
                  lifetime of cherished moments. MosqueZawaj, the gateway to
                  eternal happiness.
                </p>
                <p className="testimonial-author">- Adam</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
