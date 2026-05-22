import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const skins = [
    {
      name: 'Default Cyan',
      description: 'The classic CodeBuddy colors',
      category: 'palette',
      rarity: 'common',
      palette: { body: '#00ffd5', eye: '#ffffff', accent: '#00b8a9', glow: '#00ffd5' },
      unlockType: 'level',
      unlockValue: 1,
    },
    {
      name: 'Sakura Pink',
      description: 'Cherry blossom vibes',
      category: 'palette',
      rarity: 'common',
      palette: { body: '#ff69b4', eye: '#ffffff', accent: '#ff1493', glow: '#ff69b4' },
      unlockType: 'level',
      unlockValue: 5,
    },
    {
      name: 'Matrix Green',
      description: 'Digital rain aesthetic',
      category: 'palette',
      rarity: 'uncommon',
      palette: { body: '#39ff14', eye: '#00ff00', accent: '#00cc00', glow: '#39ff14' },
      unlockType: 'streak',
      unlockValue: 7,
    },
    {
      name: 'Battle Scarred',
      description: 'Proof of combat prowess',
      category: 'palette',
      rarity: 'rare',
      palette: { body: '#ff4444', eye: '#ffcc00', accent: '#cc0000', glow: '#ff4444' },
      unlockType: 'battle',
      unlockValue: 10,
    },
    {
      name: 'Pixel Crown',
      description: 'A tiny crown for your pet',
      category: 'accessory',
      rarity: 'epic',
      accessory: 'crown',
      unlockType: 'guild_war',
      unlockValue: 1,
    },
    {
      name: 'Legend Gold',
      description: 'Only legends wear gold',
      category: 'palette',
      rarity: 'legendary',
      palette: { body: '#ffd700', eye: '#ffffff', accent: '#daa520', glow: '#ffd700' },
      animation: 'sparkle',
      unlockType: 'special',
      unlockValue: 1,
    },
    {
      name: 'Shadow Aura',
      description: 'Dark energy surrounds your pet',
      category: 'accessory',
      rarity: 'epic',
      accessory: 'aura',
      animation: 'shadow',
      unlockType: 'battle',
      unlockValue: 50,
    },
    {
      name: 'Rainbow Wings',
      description: 'Prismatic wings of light',
      category: 'accessory',
      rarity: 'legendary',
      accessory: 'wings',
      animation: 'rainbow',
      unlockType: 'special',
      unlockValue: 1,
    },
  ];

  for (const skin of skins) {
    await prisma.skin.upsert({
      where: { name: skin.name },
      update: skin,
      create: skin,
    });
  }

  console.log(`Seeded ${skins.length} skins`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
