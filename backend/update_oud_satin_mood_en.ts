
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from './src/entities/perfume.entity';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
  logging: false,
});

const updates = [
  {
    id: 175, // The Lovers
    description_en: "A profound resonance echoes deep within, where two hearts intertwine in silent harmony. Oud Satin Mood embodies this ultimate intimacy—dark oud tenderly swathed in velvet roses. It captures the timeless moment when spirits align, a whispered vow of unity amidst the veil of possibilities.",
    quote_en: "A whispered vow of unity amidst the veil of possibilities."
  },
  {
    id: 459, // King of Cups
    description_en: "You command the realm of emotion with seasoned wisdom, a steady sovereign of the heart. Oud Satin Mood mirrors this regal balance—abyssal oud softened by graceful roses. A velvety texture revealing power tempered by gentleness, it unveils a majestic aura of deep, composed prosperity.",
    quote_en: "A velvety texture revealing power tempered by gentleness."
  },
  {
    id: 291, // King of Swords
    description_en: "You guide with mature foresight, embodying unshakable authority. Oud Satin Mood resonates with your sovereign control—deep mystery of oud tempered by soft roses. A scent of leadership balancing strength with grace, commanding respect without a word amidst the whispers of destiny.",
    quote_en: "Commanding respect without a word amidst the whispers of destiny."
  },
  {
    id: 299, // Two of Pentacles
    description_en: "Two hearts mirror each other in equal respect, a profound resonance of souls. Oud Satin Mood interprets this intimate connection—depth of oud gently wrapped in roses. A velvety embrace enduring forever, recording the eternal moment of spiritual communion sealed within the scent of destiny.",
    quote_en: "Recording the eternal moment of spiritual communion."
  }
];

async function updatePerfumes() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);

    for (const update of updates) {
      const perfume = await perfumeRepo.findOne({ where: { id: update.id } });
      if (perfume) {
        perfume.description_en = update.description_en;
        perfume.sentence_en = update.quote_en;
        await perfumeRepo.save(perfume);
        console.log(`Updated ID ${update.id}: ${perfume.product_name}`);
      } else {
        console.warn(`ID ${update.id} not found!`);
      }
    }

    console.log('All updates completed.');

  } catch (error) {
    console.error('Error updating perfumes:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

updatePerfumes();
