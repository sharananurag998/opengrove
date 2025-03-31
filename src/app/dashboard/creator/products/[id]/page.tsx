import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/db/prisma';
import ProductEditForm from './product-edit-form';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const user = await requireRole(UserRole.CREATOR);

  const creator = await prisma.creator.findUnique({
    where: { userId: user.id },
  });

  if (!creator) {
    redirect('/dashboard/creator');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      creatorId: creator.id,
    },
    include: {
      files: true,
      versions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductEditForm product={product} />
      </div>
    </div>
  );
}