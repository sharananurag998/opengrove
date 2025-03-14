import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            OpenGrove
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            The open-source creator commerce platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Sell your digital products with 0% platform fees. Keep 100% of your revenue.
            Built for creators, by creators.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              0% Platform Fees
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Unlike other platforms that take 10%+ of your sales, OpenGrove is free to self-host.
              You only pay payment processor fees.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Unlimited Customization
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Full control over your storefront appearance, custom domains, and complete API access
              for endless possibilities.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Own Your Data
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Export all your customer data, sales history, and content anytime. No vendor lock-in,
              ever.
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Selling
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Free and open source. Deploy anywhere.
          </p>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Perfect for Digital Creators
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">eBooks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">PDFs, ePubs, Mobi</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎵</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Music</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">MP3s, Albums, Beats</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💻</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Software</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apps, Plugins, Themes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎥</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Courses</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Videos, Tutorials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}