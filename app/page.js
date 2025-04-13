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

export default function HomePage() {
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
  return (
    <>
      <Navbar />

      <section className="hero-slider">
        <Slider {...sliderSettings}>
          {slides.map((slide, index) => (
            <div key={index} className="slide">
              <div className="image-wrapper">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
                <div className="overlay" />
                <div className="slide-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <Link href="/auth/signup" className="btn-primary">
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

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
              <p>Talk to your partner's Wali to get his approval</p>
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
                  Amidst digital spaces, thanks to Mosquematch. Our profiles
                  aligned, hearts connected, and dreams intertwined. Together,
                  we embarked on a beautiful journey, embracing love, faith, and
                  everlasting companionship. Mosquematch, the catalyst of our
                  blissful union.
                </p>
                <p className="testimonial-author">- Omar</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  Mosquematch, I discovered my soulmate, a beacon of light in a
                  digital realm. Our hearts synchronized, and with Allah's
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
                  other's essence, and in the journey of love and devotion, we
                  found solace, joy, and a lifelong partnership. Mosquematch,
                  the divine matchmaker.
                </p>
                <p className="testimonial-author">- Ahmed</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  Mosquematch unveiled a world of possibilities. Through its
                  platform, I discovered my true love, a companion whose heart
                  resonated with mine. Together, we embraced Islam, love, and a
                  lifetime of cherished moments. Mosquematch, the gateway to
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
