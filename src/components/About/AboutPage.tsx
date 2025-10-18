import React from "react";
import { Info, Facebook, Instagram, Play } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About Fyndak
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your premier destination for online auctions and unique finds
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Fyndak connects buyers and sellers through an innovative auction
                platform that makes finding unique items exciting and
                accessible. We believe in fair bidding, secure transactions, and
                building a community of passionate collectors.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Why Choose Us?
              </h2>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>✓ Real-time bidding system</li>
                <li>✓ Secure payment processing</li>
                <li>✓ Mobile-responsive design</li>
                <li>✓ 24/7 customer support</li>
                <li>✓ Verified sellers and buyers</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Address
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Kummelvägen 2, 37161
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Phone
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    0455-210 55
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Service Areas
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Olofström • Karlskrona • Karlshamn • Kalmar • Kristianstad •
                  Sölvesborg • Tingsryd • Ronneby • Växjö, Sweden
                </p>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-6">
                <a
                  href="https://www.facebook.com/share/1BWKCsbGW2/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <div
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  aria-label="Follow us on Instagram (Coming Soon)"
                >
                  <Instagram className="w-6 h-6" />
                </div>
                <div
                  className="flex items-center justify-center w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  aria-label="Follow us on TikTok (Coming Soon)"
                >
                  <Play className="w-6 h-6" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                Follow us for the latest updates and exclusive auction previews
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Get Started Today
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Join thousands of users who have already discovered amazing items
              through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200">
                Browse Auctions
              </button>
              <button className="px-6 py-3 border border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200">
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
