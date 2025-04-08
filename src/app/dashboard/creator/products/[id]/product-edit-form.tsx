'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, ProductFile, ProductVersion, ProductType, PricingModel } from '@/generated/prisma';

interface ProductEditFormProps {
  product: Product & {
    files: ProductFile[];
    versions: ProductVersion[];
  };
}

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [productType, setProductType] = useState(product.type);
  const [files, setFiles] = useState<ProductFile[]>(product.files);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      type: formData.get('type'),
      pricingModel: formData.get('pricingModel'),
      published: formData.get('published') === 'true',
    };

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update product');
      }

      router.push('/dashboard/creator');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      router.push('/dashboard/creator');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (fileUpload: FileUpload, index: number) => {
    const formData = new FormData();
    formData.append('file', fileUpload.file);
    formData.append('productId', product.id);

    try {
      // Update status to uploading
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, status: 'uploading' } : u
      ));

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads(prev => prev.map((u, i) => 
            i === index ? { ...u, progress } : u
          ));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const newFile = response.file;
          
          // Add to files list
          setFiles(prev => [...prev, {
            ...newFile,
            fileSize: BigInt(newFile.fileSize),
            createdAt: new Date(newFile.createdAt),
            updatedAt: newFile.updatedAt ? new Date(newFile.updatedAt) : null,
          }]);
          
          // Update upload status
          setUploads(prev => prev.map((u, i) => 
            i === index ? { ...u, status: 'success', progress: 100 } : u
          ));
          
          // Remove from uploads list after delay
          setTimeout(() => {
            setUploads(prev => prev.filter((_, i) => i !== index));
          }, 2000);
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploads(prev => prev.map((u, i) => 
            i === index ? { ...u, status: 'error', error: error.error || 'Upload failed' } : u
          ));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploads(prev => prev.map((u, i) => 
          i === index ? { ...u, status: 'error', error: 'Network error' } : u
        ));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch {
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, status: 'error', error: 'Upload failed' } : u
      ));
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const allowedTypes = [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'video/mp4', 'video/mpeg', 'video/quicktime',
      'video/x-msvideo', 'video/webm', 'application/zip', 'application/x-rar-compressed',
      'application/x-7z-compressed', 'application/x-tar', 'application/gzip', 'application/javascript',
      'application/json', 'application/xml', 'text/html', 'text/css', 'application/epub+zip',
      'application/x-mobipocket-ebook'
    ];

    const maxSize = 100 * 1024 * 1024; // 100MB

    const newUploads: FileUpload[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed: ${file.name}`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert(`File too large: ${file.name} (max 100MB)`);
        return;
      }

      newUploads.push({
        file,
        progress: 0,
        status: 'pending'
      });
    });

    if (newUploads.length > 0) {
      const startIndex = uploads.length;
      setUploads(prev => [...prev, ...newUploads]);
      
      // Start uploads
      newUploads.forEach((upload, i) => {
        uploadFile(upload, startIndex + i);
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${product.id}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑';
    return '📎';
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/creator"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Edit Product
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your product details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={product.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                defaultValue={product.description}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Type
              </label>
              <select
                id="type"
                name="type"
                required
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={ProductType.DIGITAL}>Digital Download</option>
                <option value={ProductType.SUBSCRIPTION}>Subscription</option>
                <option value={ProductType.PHYSICAL}>Physical Product</option>
                <option value={ProductType.BUNDLE}>Bundle</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pricing
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pricing Model
              </label>
              <select
                id="pricingModel"
                name="pricingModel"
                required
                defaultValue={product.pricingModel}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={PricingModel.FIXED}>Fixed Price</option>
                <option value={PricingModel.PAY_WHAT_YOU_WANT}>Pay What You Want</option>
                <option value={PricingModel.SUBSCRIPTION}>Subscription</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={product.price}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Publishing
          </h2>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              defaultChecked={product.published}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Published
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Unpublished products are not visible to customers
          </p>
        </div>

        {(productType === ProductType.DIGITAL || productType === ProductType.BUNDLE) && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Upload Files
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                  </label>
                  <span> or drag and drop</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PDF, DOC, XLS, PPT, Images, Audio, Video, Archives up to 100MB
                </p>
              </div>
              
              {/* Upload Progress */}
              {uploads.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploads.map((upload, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {upload.file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                      
                      {upload.status === 'uploading' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {upload.status === 'success' && (
                        <p className="text-sm text-green-600 dark:text-green-400">✓ Upload complete</p>
                      )}
                      
                      {upload.status === 'error' && (
                        <p className="text-sm text-red-600 dark:text-red-400">✗ {upload.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Product Files
              </h2>
              
              {files.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No files uploaded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.fileSize)} • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteFile(file.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Product
          </button>
          <div className="flex space-x-4">
            <Link
              href="/dashboard/creator"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}