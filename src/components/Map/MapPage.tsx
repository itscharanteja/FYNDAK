import React from "react";
import { MapPin, Navigation } from "lucide-react";

export const MapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Location Map
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find auctions and sellers near you
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Interactive map coming soon!
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  This will show auction locations and pickup points
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features Coming Soon
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>✓ Interactive auction map</li>
                <li>✓ Location-based search</li>
                <li>✓ Pickup point finder</li>
                <li>✓ Distance calculator</li>
                <li>✓ Local seller directory</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Why Use Location?
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Save on shipping costs</li>
                <li>• Meet sellers in person</li>
                <li>• Support local businesses</li>
                <li>• Inspect items before buying</li>
                <li>• Build community connections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
