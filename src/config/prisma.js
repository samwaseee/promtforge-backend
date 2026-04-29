import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Initialize the native Postgres connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Wrap the pool in Prisma's adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to the new v7 Prisma Client
const prisma = new PrismaClient({ adapter });

export default prisma;