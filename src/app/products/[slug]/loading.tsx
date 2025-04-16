import { Navbar } from '@/components/navbar';

export default function ProductLoading() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Product images and info */}
            <div className="lg:col-span-2">
              {/* Product image skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>

              {/* Preview images skeleton */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>

              {/* Product description skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>

              {/* Reviews skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-4 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Purchase info skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>

                {/* Creator info skeleton */}
                <div className="flex items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="ml-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>

                {/* Product details skeleton */}
                <div className="space-y-4 mb-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index}>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Price skeleton */}
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse"></div>

                {/* Add to cart button skeleton */}
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}