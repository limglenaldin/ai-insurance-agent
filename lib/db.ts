import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { createLogger } from './logger';

const log = createLogger('database');

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database is now the primary data source

// Helper functions for common queries
export const dbHelpers = {
  // Get active products with optional filtering
  getProducts: async (filters: {
    vehicleKind?: string;
    mainCoverage?: string;
    category?: string;
  } = {}) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(filters.vehicleKind && {
          OR: [
            { vehicleKind: null },
            { vehicleKind: filters.vehicleKind }
          ]
        }),
        ...(filters.mainCoverage && {
          OR: [
            { mainCoverage: null },
            { mainCoverage: { contains: filters.mainCoverage } }
          ]
        }),
        ...(filters.category && {
          category: filters.category
        })
      },
      include: {
        tenant: true,
        productDocuments: {
          where: {
            deletedAt: null
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Get product by ID with documents
  getProductById: async (id: number) => {
    return prisma.product.findUnique({
      where: {
        id,
        isActive: true,
        deletedAt: null
      },
      include: {
        tenant: true,
        productDocuments: {
          where: {
            deletedAt: null
          }
        }
      }
    });
  },

  // Get product documents for AI processing
  getProductDocuments: async (productIds?: number[]) => {
    return prisma.productDocument.findMany({
      where: {
        deletedAt: null,
        ...(productIds && {
          productId: {
            in: productIds
          }
        }),
        product: {
          isActive: true,
          deletedAt: null
        }
      },
      include: {
        product: {
          include: {
            tenant: true
          }
        }
      }
    });
  },

  // Get products for comparison
  getProductsForComparison: async (productAId: number, productBId: number) => {
    return prisma.product.findMany({
      where: {
        id: {
          in: [productAId, productBId]
        },
        isActive: true,
        deletedAt: null
      },
      include: {
        tenant: true,
        productDocuments: {
          where: {
            deletedAt: null
          }
        }
      }
    });
  }
};

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error({ err: error }, 'Database connection failed');
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await prisma.$disconnect();
}