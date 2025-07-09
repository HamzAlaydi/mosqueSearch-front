import "./globals.css";
import "@/shared/styles/utilities.css";
import { ReduxProvider } from "@/redux/Provider";
import ClientLayout from "@/components/ClientLayout"; // Adjust path if needed
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "MosqueZawaj - Find Your Muslim Partner",
  description: "Find your perfect match on MosqueZawaj.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* External CSS */}
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
        <ReduxProvider>
          <ClientLayout>
            {children}
            <Toaster position="bottom-right" />
          </ClientLayout>
        </ReduxProvider>

        {/* Scripts */}
        <script
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        ></script>
        <script
          async
          src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js"
        ></script>
      </body>
    </html>
  );
}
