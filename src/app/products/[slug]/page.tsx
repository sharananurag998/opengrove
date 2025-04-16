import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Navbar } from '@/components/navbar';
import { ProductType, PricingModel } from '@/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      creator: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      files: true,
      versions: {
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          lineItems: true,
        },
      },
    },
  });

  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found - OpenGrove',
    };
  }

  return {
    title: `${product.name} - OpenGrove`,
    description: product.description || `${product.name} by ${product.creator.user.name || product.creator.username}`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} by ${product.creator.user.name || product.creator.username}`,
      images: product.coverImage ? [product.coverImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: Decimal | number | null | undefined) => {
    if (!price) return 'Free';
    const numericPrice = price instanceof Decimal ? price.toNumber() : Number(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(numericPrice);
  };

  const getProductTypeLabel = (type: ProductType) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  const getPricingModelLabel = (model: PricingModel) => {
    return model.replace(/_/g, ' ').toLowerCase();
  };

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Product images and info */}
            <div className="lg:col-span-2">
              {/* Product image */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-lg">No image available</span>
                  </div>
                )}
              </div>

              {/* Preview images */}
              {product.previewImages && product.previewImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {product.previewImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              )}

              {/* Product description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About this product
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {product.description || 'No description available'}
                </p>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Customer Reviews
                </h2>
                {product.reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${
                              star <= averageRating
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {averageRating.toFixed(1)} out of 5 ({product._count.reviews} reviews)
                      </span>
                    </div>
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {review.customer.user.name || 'Anonymous'}
                            </span>
                            <div className="flex items-center ml-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Purchase info */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>

                {/* Creator info */}
                <div className="flex items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {product.creator.avatar ? (
                    <img
                      src={product.creator.avatar}
                      alt={product.creator.user.name || product.creator.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {(product.creator.user.name || product.creator.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.creator.user.name || product.creator.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                  </div>
                </div>

                {/* Product details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {getProductTypeLabel(product.type)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pricing Model</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {getPricingModelLabel(product.pricingModel)}
                    </p>
                  </div>
                  {product._count.lineItems > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Sales</span>
                      <p className="text-gray-900 dark:text-white">{product._count.lineItems}</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </div>
                  {product.pricingModel === PricingModel.PAY_WHAT_YOU_WANT && product.minimumPrice && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Minimum: {formatPrice(product.minimumPrice)}
                    </p>
                  )}
                </div>

                {/* Add to cart button */}
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>

                {/* Additional info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    {product.requiresLicense && (
                      <p className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        License included
                      </p>
                    )}
                    {product.files.length > 0 && (
                      <p className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {product.files.length} file{product.files.length > 1 ? 's' : ''} included
                      </p>
                    )}
                    {product.versions.length > 0 && (
                      <p className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {product.versions.length} version{product.versions.length > 1 ? 's' : ''} available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}