
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';

const updates = [
    // Card 74 (Ten of Cups) - Critical Fixes
    {
        id: 3474,
        desc_en: "You are experiencing emotional fulfillment and harmony, where the love of family and community makes you feel complete. Le Labo's Santal 33 crowns this moment of happiness—the warmth of sandalwood and the inclusiveness of leather build an emotional community full of belonging. This scent witnesses the loving home you have created."
    },
    {
        id: 3473,
        desc_en: "You are experiencing emotional fulfillment and harmony, where the love of family and community makes you feel complete. Creed's Love in White crowns this moment of happiness—the richness of rice husks backing the holiness of orange blossom and magnolia, like family joy shining under the sun. This scent embraces all things, witnessing the community of love you have created."
    },
    {
        id: 3475,
        desc_en: "You are experiencing emotional fulfillment and harmony, where the love of family and community makes you feel complete. Maison Francis Kurkdjian's Grand Soir crowns this moment of happiness—the brilliance of amber and the longevity of vanilla build an emotional community full of belonging. This scent witnesses the loving home you have created."
    },
    // Santal 33 Variants
    {
        id: 3306, // Card 32 (Ten of Swords)
        desc_en: "You are experiencing a complete ending, where old patterns have been uprooted. Le Labo's Santal 33 resonates with this destructive finitude—the calm of sandalwood and the toughness of leather maintain a final dignity amidst the ruins. This scent witnesses the end of a cycle, reserving space for new life."
    },
    {
        id: 3402, // Card 56 (Nine of Cups)
        desc_en: "You have won deserved recognition and are confidently enjoying the glory of victory. Le Labo's Santal 33 complements your radiance—the mellowness of sandalwood and the chic of leather are like a natural aura of triumph. This scent makes no noise, yet makes your achievements impossible to ignore."
    },
    {
        id: 3434, // Card 64 (King of Pentacles)
        desc_en: "You lead the direction with mature vision, demonstrating unshakeable authority in your steadiness. Le Labo's Santal 33 resonates with your kingly control—the depth of sandalwood and the strength of leather build an influence that withstands the test of time. This scent commands respect without words, showing true leadership style."
    },
    
    // Duplicate Groups Fixes
    // Bluebell (Card 25 - Three of Swords)
    {
        id: 3277,
        desc_en: "You are experiencing the pain of heartbreak, as if sorrow pierces your heart like a sharp sword. Penhaligon's Bluebell understands this profound loss—the scent of damp earth and gloomy greenery outlines the solitary figure walking in the rain. This scent does not rush to heal, but gently accompanies you to acknowledge: pain is the mark of having truly given your heart."
    },
    // La Chasse (Card 54 - Four of Wands)
    {
        id: 3393,
        desc_en: "You have welcomed a stage victory, immersed in a stable and harmonious celebration. L'Artisan's La Chasse aux Papillons perfectly captures this joy—orange blossom, jasmine, and linden blossom dance lightly in the sunlight, the scent pure and beautiful like laughter. May this carefree garden become the happy witness to your shared success and sense of belonging."
    },
    // Sole di Positano (Card 56 - Nine of Cups) likely same as Santal 3402 theme
    {
        id: 3404,
        desc_en: "You have won deserved recognition and are confidently enjoying the glory of victory. Tom Ford's Sole di Positano complements your radiance—the brightness of citrus and the cleanliness of orange blossom are like a triumphal ceremony under the Mediterranean sun. This scent makes no noise, yet naturally attracts all appreciation and attention."
    },
    // Sole di Positano (Card 76 - Knight of Cups)
    {
        id: 3484,
        desc_en: "You walk towards the world with a romantic gesture, pursuing the ideal in your heart with poetry and sincerity. Tom Ford's Sole di Positano accompanies your knightly elegance—the brightness of citrus and the cleanliness of orange blossom tell of deep affection that asks for nothing in return. This scent gives you the courage to pursue, making every heartbeat a beautiful poem."
    },
    
    // Memoire (Card 68 - Eight of Cups)
    {
        id: 3449,
        desc_en: "You feel weary of external emotional invitations and desire to look inward for true satisfaction. Gucci's Mémoire d'une Odeur fits this introspective mood—the simplicity of chamomile and the detachment of mineral musk create an atmosphere removed from reality. This scent does not judge your retreat, but provides a peace where you can rediscover your needs in solitude."
    },
    // Rozu (Card 39 - Three of Pentacles) matched Memoire??
    {
        id: 3333,
        desc_en: "You are steadily building a solid career foundation through teamwork and exquisite craftsmanship. Aesop's Rozu echoes this dedicated artisan spirit—the solid structure of smoky woods and leather supports a rose tempered by experience. This scent does not seek quick success, but witnesses every process of striving for perfection."
    }
];

async function main() {
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    console.log(`Fixing ${updates.length} critical mismatches...`);
    
    for (const update of updates) {
        await perfumeRepo.update(update.id, { description_en: update.desc_en });
        console.log(`Updated ID ${update.id}`);
    }
    
    console.log('Done.');
    await AppDataSource.destroy();
}

main();
