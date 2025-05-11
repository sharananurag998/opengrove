'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Package,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { getCustomerDownloadLinks, getDownloadUrl } from '@/lib/utils/download-links';

interface ProductDownload {
  product: {
    id: string;
    name: string;
    type: string;
    coverImage: string | null;
  };
  purchaseDate: Date;
  downloads: {
    linkId: string;
    token: string;
    expiresAt: Date;
    downloads: number;
    maxDownloads: number;
    isExpired: boolean;
    isExhausted: boolean;
  }[];
}

export default function CustomerDownloadsPage() {
  const { data: session, status } = useSession();
  const [downloads, setDownloads] = useState<ProductDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  // Redirect if not authenticated or not a customer
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/customer/downloads');
      if (!response.ok) {
        throw new Error('Failed to fetch downloads');
      }
      
      const data = await response.json();
      setDownloads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLink = async (linkId: string) => {
    try {
      setRefreshing(linkId);
      
      const response = await fetch(`/api/customer/downloads/${linkId}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh download link');
      }
      
      // Refresh the downloads list
      await fetchDownloads();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to refresh download link');
    } finally {
      setRefreshing(null);
    }
  };

  const handleDownload = (token: string, productId: string, productName: string) => {
    // Open download in new tab
    const url = getDownloadUrl(token, productId);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading downloads</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchDownloads}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Downloads</h1>
          <p className="mt-2 text-gray-600">
            Access your purchased digital products and download files
          </p>
        </div>

        {downloads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No downloads yet</h3>
            <p className="mt-2 text-gray-600">
              When you purchase digital products, they'll appear here.
            </p>
            <a
              href="/marketplace"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {downloads.map((item) => (
              <div key={item.product.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {item.product.coverImage ? (
                      <img
                        src={item.product.coverImage}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Purchased {format(new Date(item.purchaseDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {item.downloads.map((download) => {
                      const remainingDownloads = download.maxDownloads - download.downloads;
                      const daysUntilExpiry = Math.ceil(
                        (new Date(download.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div
                          key={download.linkId}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm">
                                  <Download className="h-4 w-4 mr-1 text-gray-400" />
                                  <span className="text-gray-600">
                                    {download.downloads} / {download.maxDownloads} downloads used
                                  </span>
                                </div>
                                
                                {download.isExpired ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Expired
                                  </span>
                                ) : download.isExhausted ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Download limit reached
                                  </span>
                                ) : daysUntilExpiry <= 7 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Expires in {daysUntilExpiry} days
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Expires {format(new Date(download.expiresAt), 'MMM d, yyyy')}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {download.isExpired || download.isExhausted ? (
                                <button
                                  onClick={() => handleRefreshLink(download.linkId)}
                                  disabled={refreshing === download.linkId}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {refreshing === download.linkId ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                      Refreshing...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Refresh Link
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDownload(download.token, item.product.id, item.product.name)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  const url = getDownloadUrl(download.token, item.product.id);
                                  navigator.clipboard.writeText(url);
                                  alert('Download link copied to clipboard!');
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                title="Copy download link"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Download Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Download links expire 30 days after purchase</li>
            <li>• Each link allows up to 5 downloads</li>
            <li>• You can refresh expired or exhausted links</li>
            <li>• Keep your download links secure and don't share them</li>
          </ul>
        </div>
      </div>
    </div>
  );
}