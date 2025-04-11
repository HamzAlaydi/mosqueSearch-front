import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "MosqueMatch - Find Your Muslim Partner",
  description: "Find your perfect match on MosqueMatch.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* External CSS for slick carousel and font-awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body>
        <Navbar />
        {children}

        {/* JS Scripts for jQuery & slick-carousel */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js"></script>
      </body>
    </html>
  );
}
