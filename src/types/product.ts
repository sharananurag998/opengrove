export interface ProductFile {
  id: string;
  productId: string;
  versionId: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: bigint;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVersion {
  id: string;
  productId: string;
  name: string;
  version: string;
  price: number | string | null;
  changelog: string | null;
  releaseDate: Date;
  active: boolean;
  downloadLimit: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    userId: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

export interface Creator {
  id: string;
  userId: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  socialLinks: any;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

export interface ProductWithRelations {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  pricingModel: string;
  price: number | string | null;
  minimumPrice: number | string | null;
  suggestedPrice: number | string | null;
  currency: string;
  coverImage: string | null;
  previewImages: string[];
  published: boolean;
  requiresLicense: boolean;
  enableAffiliate: boolean;
  affiliateCommission: number | null;
  preOrderDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creator: Creator;
  files: ProductFile[];
  versions: ProductVersion[];
  reviews: Review[];
  _count: {
    reviews: number;
    lineItems: number;
  };
}