// backend/prisma.config.ts
/**
 * Prisma configuration compatible with Prisma 6.x.
 * This removes the deprecated package.json#prisma entry.
 */
export default {
  // Path to the Prisma schema (relative to this file)
  schema: './schema.prisma',

  // Optional: you can explicitly set the datasource URL here
  // datasource: {
  //   url: process.env.DATABASE_URL,
  // },

  // Optional: generator options (keeps defaults)
  // generator: {
  //   provider: 'prisma-client-js',
  // },
};
