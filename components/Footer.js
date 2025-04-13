import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              At Mosque Match, we are dedicated to fostering meaningful
              connections within the Muslim community. Our platform is designed
              to empower individuals to discover mosques, connect with fellow
              muslims, and build lasting relationships grounded in faith and
              shared values.
            </p>
          </div>
          <div className="footer-section">
            <h3>Sitemap</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/auth/login">User Login</Link>
              </li>
              <li>
                <Link href="/auth/register">User Register</Link>
              </li>
              <li>
                <Link href="/auth/imam/login">Imam Login</Link>
              </li>
              <li>
                <Link href="/auth/imam/register">Imam Register</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Our Social</h3>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="copyright container">
          <p>Copyright 2025 MosqueMatch.Co. All Rights are reserved</p>
          <div className="terms">
            <a href="#">Privacy Policy</a> | <a href="#">Terms of use</a>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
