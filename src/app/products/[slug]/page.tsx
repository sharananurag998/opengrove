import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Navbar } from '@/components/navbar';
import { ProductDetails } from '@/components/product/product-details';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
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

  if (!product) return null;

  // Serialize the product data to avoid issues with Decimal types
  return {
    ...product,
    price: product.price ? product.price.toString() : null,
    minimumPrice: product.minimumPrice ? product.minimumPrice.toString() : null,
    suggestedPrice: product.suggestedPrice ? product.suggestedPrice.toString() : null,
    affiliateCommission: product.affiliateCommission ? product.affiliateCommission.toString() : null,
    files: product.files.map(file => ({
      ...file,
      fileSize: file.fileSize.toString(),
    })),
    versions: product.versions.map(version => ({
      ...version,
      price: version.price ? version.price.toString() : null,
    })),
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductDetails product={product} />
        </div>
      </div>
    </>
  );
}