import prisma from '../src/config/prisma.js';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create a few dummy buyers
  const buyers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: { name: 'Sarah Jenkins', email: 'sarah@example.com', password: 'hashed_password_here', role: 'BUYER', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    }),
    prisma.user.upsert({
      where: { email: 'david@example.com' },
      update: {},
      create: { name: 'David Chen', email: 'david@example.com', password: 'hashed_password_here', role: 'BUYER', avatar: 'https://i.pravatar.cc/150?u=david' },
    }),
    prisma.user.upsert({
      where: { email: 'marcus@example.com' },
      update: {},
      create: { name: 'Marcus T.', email: 'marcus@example.com', password: 'hashed_password_here', role: 'BUYER', avatar: 'https://i.pravatar.cc/150?u=marcus' },
    })
  ]);

  console.log(`Created ${buyers.length} dummy buyers.`);

  // 2. Fetch all existing prompts
  const prompts = await prisma.prompt.findMany();
  
  if (prompts.length === 0) {
    console.log('⚠️ No prompts found. Create a prompt in the UI first!');
    return;
  }

  // 3. Attach 3 reviews to every prompt
  const reviewComments = [
    "Absolutely brilliant prompt. Saved me hours of boilerplate generation.",
    "I was skeptical about paying, but the structure is meticulously crafted. Worth every penny.",
    "Great system instructions. Had to tweak the tone parameters slightly for my niche, but overall amazing."
  ];

  let reviewCount = 0;

  for (const prompt of prompts) {
    for (let i = 0; i < 3; i++) {
      await prisma.review.create({
        data: {
          rating: 5, // Feel free to randomize between 4 and 5
          comment: reviewComments[i],
          reviewerId: buyers[i].id,
          promptId: prompt.id,
        }
      });
      reviewCount++;
    }
  }

  console.log(`✅ Successfully injected ${reviewCount} reviews across ${prompts.length} prompts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });