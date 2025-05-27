'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { ProductWithRelations, ProductVersion } from '@/types/product';

interface ProductDetailsProps {
  product: ProductWithRelations;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem, isLoading } = useCart();
  const [selectedVersion, setSelectedVersion] = useState<ProductVersion | null>(
    product.versions.length > 0 ? product.versions[0] : null
  );
  const [customPrice, setCustomPrice] = useState<number>(
    product.price ? Number(product.price) : 0
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price: number | string | null | undefined) => {
    if (!price) return 'Free';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(numericPrice);
  };

  const getProductTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  const getPricingModelLabel = (model: string) => {
    return model.replace(/_/g, ' ').toLowerCase();
  };

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      let priceToUse = selectedVersion ? Number(selectedVersion.price) : Number(product.price || 0);
      
      if (product.pricingModel === 'PAY_WHAT_YOU_WANT') {
        priceToUse = customPrice;
        const minPrice = product.minimumPrice ? Number(product.minimumPrice) : 0;
        if (priceToUse < minPrice) {
          alert(`Price must be at least ${formatPrice(minPrice)}`);
          setIsAddingToCart(false);
          return;
        }
      }

      // Create a simplified product object to avoid serialization issues
      const productForCart = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        type: product.type,
        pricingModel: product.pricingModel,
        price: priceToUse,
        minimumPrice: product.minimumPrice,
        suggestedPrice: product.suggestedPrice,
        currency: product.currency,
        coverImage: product.coverImage,
        previewImages: product.previewImages,
        published: product.published,
        requiresLicense: product.requiresLicense,
        enableAffiliate: product.enableAffiliate,
        affiliateCommission: product.affiliateCommission,
        preOrderDate: product.preOrderDate,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        creatorId: product.creatorId,
      } as any;

      await addItem(productForCart, selectedVersion as any || undefined);
      
      // Show success feedback
      const button = document.getElementById('add-to-cart-btn');
      if (button) {
        button.textContent = 'Added to Cart!';
        setTimeout(() => {
          button.textContent = 'Add to Cart';
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
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

          {/* Version selector */}
          {product.versions.length > 0 && (
            <div className="mb-6">
              <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                Select Version
              </label>
              <select
                value={selectedVersion?.id || ''}
                onChange={(e) => {
                  const version = product.versions.find(v => v.id === e.target.value);
                  setSelectedVersion(version || null);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {product.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} - {formatPrice(version.price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            {product.pricingModel === 'PAY_WHAT_YOU_WANT' ? (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                  Name your price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={product.minimumPrice ? Number(product.minimumPrice) : 0}
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {product.minimumPrice && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Minimum: {formatPrice(product.minimumPrice)}
                  </p>
                )}
                {product.suggestedPrice && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Suggested: {formatPrice(product.suggestedPrice)}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedVersion ? formatPrice(selectedVersion.price) : formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Add to cart button */}
          <button 
            id="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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
  );
}