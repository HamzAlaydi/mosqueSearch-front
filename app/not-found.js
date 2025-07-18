import Link from "next/link";
import Image from "next/image";
import "./not-found.css";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="content">
          <div className="text-content">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p className="verse">
              &ldquo;And whoever relies upon Allah - then He is sufficient for
              him.&rdquo;
              <br />
              <span className="verse-reference">(Quran 65:3)</span>
            </p>
            <p className="message">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
              <br />
              Let&apos;s guide you back to the right path.
            </p>
            <Link href="/" className="home-button">
              Return to Home
            </Link>
          </div>
          <div className="image-container"></div>
        </div>
      </div>
    </div>
  );
}
