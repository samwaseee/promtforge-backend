import { PrismaClient, Role, AIModel, PromptStatus, OrderStatus } from '@prisma/client';
import prisma from '../src/config/prisma.js';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Use the existing seller (Matching your Firebase ID)
  const seller = await prisma.user.upsert({
    where: { email: 'sami@gmail.com' },
    update: {},
    create: { 
      id: 'kkeE0eZAyrPwQZCnCtrSfia7GSH3',
      name: 'Samiur Rahman', 
      email: 'sami@gmail.com', 
      password: 'hashed_password_firebase_user', 
      role: Role.SELLER, 
      avatar: 'https://i.pravatar.cc/150?u=samiur',
      walletBalance: 1500.00 
    },
  });

  // 2. Define ALL prompts (Initial + 20 new)
  const allPromptsData = [
    // Initial 3
    { title: "Next.js SaaS Architect Generator", description: "Generates production-ready Next.js 14 App Router boilerplate.", price: 29.99, aiModel: AIModel.GPT4, category: "Development", imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800" },
    { title: "Cinematic Product Photography", description: "Midjourney v6 prompts for photorealistic tech gadgets.", price: 15.00, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800" },
    { title: "Advanced Financial Analyst", description: "Claude 3 prompt for analyzing quarterly earnings reports.", price: 49.99, aiModel: AIModel.CLAUDE, category: "Business", imageUrl: "https://images.unsplash.com/photo-1590283603385-fc77b09f7832?w=800" },
    // 20 New
    { title: "React Component Library Generator", description: "Creates accessible UI components.", price: 25.00, aiModel: AIModel.GPT4, category: "Development", imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800" },
    { title: "Cyberpunk Cityscape Backgrounds", description: "Midjourney prompts for futuristic urban environments.", price: 12.99, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" },
    { title: "SEO-Optimized Blog Post Writer", description: "Generates high-ranking articles.", price: 35.00, aiModel: AIModel.GEMINI, category: "Marketing", imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800" },
    { title: "Legal Contract Reviewer", description: "Analyze clauses for risks.", price: 50.00, aiModel: AIModel.CLAUDE, category: "Business", imageUrl: "https://images.unsplash.com/photo-1589829545856-d13b55c0bd31?w=800" },
    { title: "Python Script Debugger", description: "Optimizes clean code principles.", price: 20.00, aiModel: AIModel.GPT4, category: "Development", imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800" },
    { title: "Photorealistic Portrait Lighting", description: "Lighting setups for human subjects.", price: 18.50, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" },
    { title: "Marketing Email Sequence", description: "High-conversion sales funnels.", price: 40.00, aiModel: AIModel.GPT4, category: "Marketing", imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee1c032?w=800" },
    { title: "SQL Query Optimizer", description: "Convert slow queries to performant ones.", price: 29.00, aiModel: AIModel.GEMINI, category: "Development", imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800" },
    { title: "Business Plan Outline", description: "Comprehensive framework for startups.", price: 60.00, aiModel: AIModel.CLAUDE, category: "Business", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" },
    { title: "YouTube Video Scripting Pro", description: "Hook-driven video scripts.", price: 25.00, aiModel: AIModel.GPT4, category: "Marketing", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
    { title: "UI/UX Dashboard Wireframer", description: "Design complex B2B dashboards.", price: 30.00, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800" },
    { title: "Unit Test Case Generator", description: "Jest/Vitest test generator.", price: 15.00, aiModel: AIModel.GPT4, category: "Development", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800" },
    { title: "Market Research Summarizer", description: "Summarize PDFs into insights.", price: 35.00, aiModel: AIModel.CLAUDE, category: "Business", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800" },
    { title: "Abstract 3D Texture Generator", description: "Seamless patterns.", price: 10.00, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800" },
    { title: "Resume Tailor", description: "Match experience to job descriptions.", price: 25.00, aiModel: AIModel.GEMINI, category: "Business", imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800" },
    { title: "Docker Configurator", description: "Production-ready Dockerfiles.", price: 45.00, aiModel: AIModel.GPT4, category: "Development", imageUrl: "https://images.unsplash.com/photo-1667372335497-2856f6e80b67?w=800" },
    { title: "Social Media Calendar", description: "30-day content calendar.", price: 20.00, aiModel: AIModel.GPT4, category: "Marketing", imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800" },
    { title: "Language Learning Companion", description: "Spanish learning partner.", price: 9.99, aiModel: AIModel.CLAUDE, category: "Education", imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800" },
    { title: "Scientific Paper Explainer", description: "Simplifies academic research.", price: 12.00, aiModel: AIModel.GEMINI, category: "Education", imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800" },
    { title: "Logo Icon Minimalist Set", description: "Vector-style icons.", price: 15.00, aiModel: AIModel.MIDJOURNEY, category: "Design", imageUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800" }
  ];

  // 3. Create all prompts
  const createdPrompts = await Promise.all(
    allPromptsData.map((data) =>
      prisma.prompt.create({
        data: {
          ...data,
          promptContent: "You are an expert. Please generate: " + data.title,
          sellerId: seller.id,
          status: PromptStatus.APPROVED
        },
      })
    )
  );

  console.log(`✅ Created ${createdPrompts.length} prompts.`);

  // 4. Create dummy buyers
  const buyers = await Promise.all([
    prisma.user.upsert({ where: { email: 'sarah@example.com' }, update: {}, create: { name: 'Sarah Jenkins', email: 'sarah@example.com', password: 'pass', role: Role.BUYER, avatar: 'https://i.pravatar.cc/150?u=sarah' } }),
    prisma.user.upsert({ where: { email: 'david@example.com' }, update: {}, create: { name: 'David Chen', email: 'david@example.com', password: 'pass', role: Role.BUYER, avatar: 'https://i.pravatar.cc/150?u=david' } }),
  ]);

  // 5. Ensure EVERY prompt gets at least one order and one review
  let reviewCount = 0;
  for (const prompt of createdPrompts) {
    const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
    
    await prisma.order.create({
      data: {
        amountPaid: prompt.price,
        platformFee: prompt.price * 0.1,
        sellerEarnings: prompt.price * 0.9,
        status: OrderStatus.PAID,
        transactionId: `txn_${prompt.id}`,
        buyerId: randomBuyer.id,
        promptId: prompt.id,
      }
    });

    await prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellent prompt! Exactly what I needed.",
        reviewerId: randomBuyer.id,
        promptId: prompt.id,
      }
    });
    reviewCount++;
  }

  console.log(`✅ Seeded ${reviewCount} reviews across all prompts.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());