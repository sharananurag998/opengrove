import { Client } from 'minio';

// Initialize MinIO client with environment variables
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || ''
});

// Bucket configuration
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'opengrove-files';
const BUCKET_REGION = process.env.MINIO_REGION || 'us-east-1';

// Types
export interface UploadedFile {
  url: string;
  key: string;
  size: number;
}

export interface FileListItem {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
}

/**
 * Create bucket if it doesn't exist
 */
export async function ensureBucket(): Promise<void> {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, BUCKET_REGION);
      console.log(`Bucket '${BUCKET_NAME}' created successfully`);
      
      // Set bucket policy to allow public read access (optional)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw new Error(`Failed to ensure bucket exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file to MinIO
 * @param buffer - File buffer
 * @param fileName - Original file name
 * @param productId - Product ID for organizing files
 * @param contentType - MIME type of the file
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  productId: string,
  contentType: string
): Promise<UploadedFile> {
  try {
    await ensureBucket();
    
    // Generate unique file key with product ID prefix
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `products/${productId}/${timestamp}-${sanitizedFileName}`;
    
    // Upload file
    const result = await minioClient.putObject(
      BUCKET_NAME,
      key,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        'x-amz-meta-product-id': productId,
        'x-amz-meta-original-name': fileName
      }
    );
    
    // Generate public URL
    const url = `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${key}`;
    
    return {
      url,
      key,
      size: buffer.length
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate presigned download URL for private files
 * @param key - File key/path in bucket
 * @param expirySeconds - URL expiry time in seconds (default: 7 days)
 * @returns Presigned download URL
 */
export async function generatePresignedUrl(
  key: string,
  expirySeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      key,
      expirySeconds
    );
    
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file from MinIO
 * @param key - File key/path to delete
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, key);
    console.log(`File deleted successfully: ${key}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete multiple files
 * @param keys - Array of file keys to delete
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  try {
    await minioClient.removeObjects(BUCKET_NAME, keys);
    console.log(`${keys.length} files deleted successfully`);
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new Error(`Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files for a given product
 * @param productId - Product ID to list files for
 * @param maxKeys - Maximum number of files to return (default: 1000)
 * @returns Array of file metadata
 */
export async function listProductFiles(
  productId: string,
  maxKeys: number = 1000
): Promise<FileListItem[]> {
  try {
    const prefix = `products/${productId}/`;
    const files: FileListItem[] = [];
    
    // Create a stream to list objects
    const stream = minioClient.listObjectsV2(
      BUCKET_NAME,
      prefix,
      true, // recursive
      '' // startAfter
    );
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.etag
          });
          
          // Stop if we've reached maxKeys
          if (files.length >= maxKeys) {
            stream.destroy();
            resolve(files.slice(0, maxKeys));
          }
        }
      });
      
      stream.on('error', (err) => {
        console.error('Error listing files:', err);
        reject(new Error(`Failed to list files: ${err.message}`));
      });
      
      stream.on('end', () => {
        resolve(files);
      });
    });
  } catch (error) {
    console.error('Error listing product files:', error);
    throw new Error(`Failed to list product files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file metadata
 * @param key - File key/path
 * @returns File metadata
 */
export async function getFileMetadata(key: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
}> {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, key);
    
    return {
      size: stat.size,
      contentType: stat.metaData['content-type'] || 'application/octet-stream',
      lastModified: stat.lastModified,
      metadata: stat.metaData
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copy file within the bucket
 * @param sourceKey - Source file key
 * @param destinationKey - Destination file key
 * @returns Destination file key
 */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<string> {
  try {
    await minioClient.copyObject(
      BUCKET_NAME,
      destinationKey,
      `/${BUCKET_NAME}/${sourceKey}`
    );
    
    return destinationKey;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if file exists
 * @param key - File key/path
 * @returns Boolean indicating if file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, key);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Not Found')) {
      return false;
    }
    throw error;
  }
}