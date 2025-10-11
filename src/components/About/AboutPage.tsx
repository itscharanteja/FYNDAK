import React from "react";
import { Info } from "lucide-react";

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
