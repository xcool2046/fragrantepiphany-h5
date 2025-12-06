
import * as fs from 'fs';
import * as path from 'path';

const translations = [
  // 1. Judgment A (ID 20)
  "You hear the inner call, preparing for the soul’s awakening and rebirth. Gucci’s Mémoire d'une Odeur responds with mineral clarity—chamomile sheds its disguise, musk dissolves boundaries, and fragments of the past reassemble in this moment. It judges not, but offers a lucid view: resurrection begins with the total acceptance of what was. May this olfactory mirror reflect your truest self.",
  
  // 2. Judgment B (ID 30)
  "As the soul greets its awakening, Kilian’s Sacred Wood escorts this divine transition—purest sandalwood carrying the serenity and sanctity of milky vapors. It judges not the past, but offers a lucid view, clearing the dust from your spiritual mirror. Here, every reflection becomes a catalyst for rebirth, and every breath is a sacred vow to your emerging self.",

  // 3. Judgment C (ID 51)
  "When the soul meets its awakening, Kilian’s Angels' Share crowns this divine turning point—essence of cognac and the deep sediment of oak bringing a sudden, radiant epiphany. It judges not the past, but offers a lucid view, transforming every moment of introspection into a catalyst for rebirth. In this golden warmth, you find the clarity to rise anew.",

  // 4. Judgment D (ID 62)
  "When the soul meets its awakening, Maison Martin Margiela’s Lazy Sunday Morning guards this divine transition—clean soap and fresh pear bringing a transparent sense of renewal. It judges not the past, but offers a fresh perspective, turning every reflection into a catalyst for rebirth. In this pure, unhurried light, you find the clarity to begin again.",

  // 5. World A (ID 18)
  "You arrive at the fullness of a cycle, inner and outer worlds in perfect harmony. Creed’s Love in White crowns this moment of completion—the richness of rice husks set against holy orange blossom, magnolia weaving a garland of victory. Embracing all things, it stands at the peak looking back: every journey was a necessary path to this now. May this white light witness your complete and brilliant creation.",

  // 6. World B (ID 21)
  "When the cycle reaches perfection, Le Labo’s Santal 33 crowns this moment of completion—the classic union of sandalwood and leather, steady and all-encompassing, like standing at the summit surveying the journey. It witnesses the wholeness of your creation, offering the most solid affirmation at the point where the end becomes a new beginning.",

  // 7. World C (ID 42)
  "When the cycle reaches perfection, Maison Francis Kurkdjian’s Grand Soir crowns this moment of completion—the splendor of amber and the fullness of vanilla constructing a perfect finale. It witnesses the wholeness of your creation, offering the most brilliant affirmation at the point where the end becomes a new beginning.",

  // 8. World D (ID 79)
  "When the cycle reaches perfection, Creed’s Virgin Island Water crowns this moment of completion—lime and coconut bringing tropical flair, with rum’s tipsy touch adorning the joy. It witnesses the wholeness of your creation, offering the most relaxed celebration at the point where the end becomes a new beginning.",

  // 9. Wands Ace A (ID 5)
  "You stand at the threshold of action, inspiration sparking like fire, new plans surging within. Byredo’s Young Rose resonates with your creative energy—the prick of Sichuan pepper and the scent of green stems breaking through earth, carrying unshaped courage. It promises no result but gifts the pure motive to start, whispering: the act of beginning is the most precious answer of all.",

  // 10. Wands Ace B (ID 34)
  "The spark of action ignites within, new plans awaiting practice. Aesop’s Tacit fits perfectly with this nascent energy—the fresh greenery of basil and the warm wood of vetiver, like clear vision at the break of dawn. It injects you with the courage to launch, ensuring every idea finds its path to reality.",

  // 11. Wands Ace C (ID 50)
  "The spark of action bursts forth, new plans urgent for implementation. Akro’s Awake fits perfectly with this nascent drive—the pure aroma of concentrated espresso brings instant focus and energy, like inspiration piercing the silence. It promises no result, but injects steadfast courage into every moment of beginning.",

  // 12. Wands Ace D (ID 78)
  "The spark of action bursts forth, new plans urgent for implementation. Maison Francis Kurkdjian’s Aqua Celestia fits perfectly with this nascent drive—the fresh breath of lime and mint brings instant clarity and vitality, like the light of inspiration piercing the sky. It injects transparent energy into every moment of beginning, transforming thoughts instantly into action.",

  // 13. Wands 2 A (ID 12)
  "You survey the possibilities with calm, drafting the blueprint of the future. Hermès’ Le Jardin de Monsieur Li echoes this steady foresight—the sweetness of kumquat and the faint scent of jasmine build a quiet courtyard among wet stones and moss. It does not rush your decision, but offers a space for clear thought, helping you make leisurely choices while mastering the whole.",

  // 14. Wands 2 B (ID 40)
  "You stand at the height of the whole, assessing the situation as the future's blueprint unfolds. Hermès’ Terre d'Hermès echoes this foresight—the vitality of grapefruit and the steadiness of minerals construct a broad sense of pattern. It grants you the confidence to control development, making every decision as stable as the earth.",

  // 15. Wands 2 C (ID 55)
  "You plan the future blueprint with composure, weighing possibilities with prudence. Guerlain’s Tonka Imperiale echoes this mindset of strategizing—the richness of tonka bean and the warmth of tobacco construct a steady, grand pattern. It grants you the confidence and foresight to control development.",

  // 16. Wands 2 D (ID 64)
  "You plan the future blueprint with composure, assessing the situation with an open vision. Creed’s Silver Mountain Water echoes this foresight—the clarity of melted glacial water and the chill of green tea construct a calm and profound pattern. It grants you clear thinking to control development, making every decision as transparent as crystal.",

  // 17. Wands 3 A (ID 18)
  "Your vision has transcended the present; opportunities for cooperation and distant success unfold before you. Creed’s Love in White matches this open state of mind—the richness of rice husks interwoven with bright orange blossom and magnolia, like sunlight on setting sails. It brings certainty for the future, accompanying you to welcome the fruitful results soon to come.",

  // 18. Wands 3 B (ID 32)
  "Your vision has transcended the present; distant cooperation and success dawn. Byredo’s Bal d'Afrique resonates with this open state of mind—the brightness of bergamot and the warmth of amber seem like golden sunlight on setting sails. It carries optimism for the future, witnessing every step you take to expand your boundaries.",

  // 19. Wands 3 C (ID 51)
  "Your vision has transcended the present; distant cooperation and success begin to show. Kilian’s Angels' Share resonates with this open expectation—the mellow scent of cognac and the warm sweetness of hazelnut seem like a feast pre-celebrating success. It carries optimism for the future, witnessing every step you take to expand your boundaries.",

  // 20. Wands 3 D (ID 72)
  "Your vision has transcended the present; distant cooperation and success begin to show. Louis Vuitton’s On the Beach resonates with this open expectation—the freshness of bergamot and the vitality of rosemary seem like a message from afar carried by the sea breeze. It carries optimism for the future, witnessing every step you take to expand your boundaries.",

  // 21. Wands 4 A (ID 16)
  "You have ushered in a victory of the stage, immersed in a stable and harmonious celebration. L'Artisan’s La Chasse aux Papillons perfectly captures this joy—orange blossom, jasmine, and linden flower dance lightly in the sun, the scent like laughter, pure and beautiful. May this carefree garden be a happy witness to your shared success and sense of belonging.",

  // 22. Wands 4 B (ID 23)
  "You have built a solid foundation and are enjoying the warm rewards of your efforts. Maison Martin Margiela’s By the Fireplace perfectly captures this satisfaction—the sweet scent of roasted chestnuts and the warmth of the fire create a festive family atmosphere. This fragrance is the best tribute to stable achievement.",

  // 23. Wands 4 C (ID 43)
  "You have built a solid foundation and are enjoying the festive moments earned by effort. Sol de Janeiro’s Cheirosa '62 perfectly captures this joy—the milky sweetness of pistachio and almond, with the warmth of salted caramel, creates a celebration full of laughter. This fragrance is the best tribute to stable achievement.",

  // 24. Wands 4 D (ID 76)
  "You have built a solid foundation and are enjoying the warm rewards of your efforts. Byredo’s Sundazed perfectly captures this satisfaction—the sunny scent of citrus and the warm texture of musk create a joyous atmosphere of celebration. This fragrance is the best tribute to stable achievement, like a happiness that never takes a holiday.",

  // 25. Wands 5 A (ID 1)
  "You are in the midst of challenging competition, where different views and forces clash. Diptyque’s L'Ombre dans L'Eau echoes this turbulence with intense greenery—the sharp verdancy of blackcurrant leaves creates tension with the softness of roses, like sparks from colliding thoughts. It does not avoid conflict, but grants you the sharpness to remain clear-headed in chaos.",

  // 26. Wands 5 B (ID 37)
  "You are in a competitive environment full of tension, where different views clash fiercely. Tom Ford’s Ombré Leather resonates with this conflicting energy—the wildness of leather and the depth of wood reveal an aesthetic full of confrontation. This fragrance gives you the underlying strength to maintain style amidst the chaos.",

  // 27. Wands 5 C (ID 58)
  "You are in a competitive environment full of tension, where different forces collide fiercely. Nishane’s Ani resonates with this conflicting energy—the spice of ginger and the richness of vanilla form an interesting confrontation, with bright bergamot weaving through. This fragrance gives you the underlying strength to maintain individuality amidst the chaos.",

  // 28. Wands 5 D (ID 74)
  "You are in a competitive environment full of tension, where different views collide fiercely. Diptyque’s Eau des Sens resonates with this conflicting energy—the sharpness of bitter orange and the verdancy of juniper berry form an exquisite confrontation under the harmony of orange blossom. This fragrance gives you the underlying strength to maintain clear perception amidst the chaos.",

  // 29. Wands 6 A (ID 4)
  "You are enjoying the glory of victory, confidently accepting recognition and applause. Frédéric Malle’s Une Rose complements your radiance—a grand, magnificent rose, full, sexy, and impossible to ignore, like a crown of triumph. May this extreme bloom be the best reward after winning recognition.",

  // 30. Wands 6 B (ID 21)
  "You have won well-deserved recognition and are confidently enjoying the glory of victory. Le Labo’s Santal 33 complements your radiance—the richness of sandalwood and the dash of leather feel like a natural aura of triumph. It makes no loud claims, yet makes your achievement impossible to ignore.",

  // 31. Wands 6 C (ID 42)
  "You have won well-deserved recognition and are confidently enjoying the glory of victory. Maison Francis Kurkdjian’s Grand Soir complements your radiance—the splendor of amber and the length of vanilla focus like a grand celebration of triumph. It makes no loud claims, yet makes your achievement impossible to ignore.",

  // 32. Wands 6 D (ID 73)
  "You have won well-deserved recognition and are confidently enjoying the glory of victory. Tom Ford’s Sole di Positano complements your radiance—the brightness of citrus and the cleanliness of orange blossom feel like a triumphal ceremony under the Mediterranean sun. It makes no loud claims, yet naturally attracts all admiration and gaze.",

  // 33. Wands 7 A (ID 7)
  "You stand firm in your position, holding fast for your beliefs. Aesop’s Rozu is with you in this resilience—a solid base of smoky wood and leather supports a rose that has weathered the wind and frost. Deep and tenacious, this fragrance grants you the inner strength to withstand pressure, helping you show unshakable courage in your persistence.",

  // 34. Wands 7 B (ID 35)
  "You firmly guard your position, resisting challenges from all sides for your beliefs. Le Labo’s Thé Noir 29 matches this wisdom of persistence—the richness of black tea and the tenacity of tobacco reveal lasting strength in complex layers. This fragrance grants you the depth to remain composed under pressure.",

  // 35. Wands 7 C (ID 59)
  "You firmly guard your position, resisting challenges from all sides for your beliefs. Memo Paris’s Irish Leather matches this courage of persistence—the intensity of whiskey and the toughness of leather show unyielding character within the cool of mint. This fragrance grants you the strength to maintain grace under pressure.",

  // 36. Wands 7 D (ID 26)
  "You firmly guard your position, resisting challenges from all sides for your beliefs. Jo Malone’s Wood Sage & Sea Salt matches this wisdom of persistence—the freshness of sea breeze and the steadiness of sage reveal a defensive power of softness overcoming hardness. This fragrance grants you the natural underlying strength to remain composed under pressure.",

  // 37. Wands 8 A (ID 13)
  "Action unfolds rapidly; news and progress fly like arrows. Diptyque’s Ofrésia responds to this momentum with direct sharpness—the green, stem-like scent of freesia is linear and distinct, without hesitation. Swift and focused, like a racing heartbeat, it helps you reach your goal accurately and efficiently.",

  // 38. Wands 8 B (ID 34)
  "Action unfolds rapidly; news and progress fly like arrows. Aesop’s Tacit responds to this rhythm with clear momentum—the brightness of citrus and the directiveness of vetiver bring efficiency that cuts straight to the target. This fragrance accelerates your pace, allowing plans to be realized in the most fluid way.",

  // 39. Wands 8 C (ID 54)
  "Action unfolds rapidly; plans advance at astonishing speed. Penhaligon's Changing Constance responds to this rhythm with versatile momentum—the salty scent of cardamom and the sweetness of caramel flow among cedar, symbolizing agile thinking and action. This fragrance accelerates your pace, ensuring goals are reached efficiently.",

  // 40. Wands 8 D (ID 78)
  "Action unfolds rapidly; plans advance at astonishing speed. Maison Francis Kurkdjian’s Aqua Celestia responds to this rhythm with fluid momentum—the coolness of mint and the brightness of lemon symbolize the seamless connection of thought and action. This fragrance accelerates your pace, ensuring goals are reached in the most elegant way.",

  // 41. Wands 9 A (ID 20)
  "You gather wisdom from past experiences, scarred but more alert and tough. Gucci’s Mémoire d'une Odeur resonates with this complex maturity—the simplicity of chamomile and the detachment of mineral musk weave a memory with distance. It does not hide the past but, with a sober posture, builds a protective boundary for you.",

  // 42. Wands 9 B (ID 28)
  "You gather wisdom from past experiences, scarred but more alert and tough. Diptyque’s Tam Dao resonates with this mature defense—the serenity of sandalwood and the firmness of cedar construct a protective space for contemplation. It does not hide the pain but transforms experience into inner strength.",

  // 43. Wands 9 C (ID 56)
  "You gather wisdom from past experiences, moving forward with vigilance. BDK Parfums’ Gris Charnel resonates with this mature defense—the milkiness of fig and the bitterness of tea construct a wisdom of the gray zone on a sandalwood base. This fragrance transforms experience into inner resilience.",

  // 44. Wands 9 D (ID 65)
  "You gather wisdom from past experiences, moving forward with vigilance. Acca Kappa’s White Moss resonates with this mature defense—the cleanliness of white musk and the moisture of moss construct a quiet space for settling. This fragrance transforms experience into inner resilience, preparing you for the next battle.",

  // 45. Wands 10 A (ID 9)
  "You bear heavy responsibilities, exhausted yet persisting. Le Labo’s Rose 31 understands this heavy burden—the spicy heat of cumin and deep wood tightly entwine the rose, a scent full of pressure and tension. It offers no light comfort but accompanies you through this necessary tempering, until you find inner strength at the end.",

  // 46. Wands 10 B (ID 29)
  "You bear heavy responsibilities, exhausted yet persisting forward. L'Artisan’s Bois Farine understands this burden—the simplicity of almond flour and the supportive sense of cedar feel like the most solid companionship. It does not lighten the weight, but adds a warmth to the strenuous journey.",

  // 47. Wands 10 C (ID 47)
  "You bear heavy responsibilities, exhausted yet persisting. Serge Lutens’ Jeux de Peau understands this burden—the warm scent of toasted bread and the richness of milk offer the simplest solace. It does not lighten the weight, but adds a warm companion to the strenuous journey.",

  // 48. Wands 10 D (ID 62)
  "You bear heavy responsibilities, exhausted yet persisting. Maison Martin Margiela’s Lazy Sunday Morning understands this burden—the freshness of lily of the valley and the moistness of pear offer gentle solace wrapped in white musk. It does not lighten the weight, but adds a soothing touch to the strenuous journey.",

  // 49. Wands Page A (ID 5)
  "You explore the world with curiosity and passion, eager to welcome every new discovery. Byredo’s Young Rose is on your frequency—the stimulation of Sichuan pepper and the vividness of green rose are reflected in fearless youth. Full of untamed vitality, it encourages you to try bravely, accumulating marks of growth in every exploration.",

  // 50. Wands Page B (ID 26)
  "You explore the world with curiosity, ready to turn inspiration into action. Jo Malone’s Wood Sage & Sea Salt matches your eager state of mind—the freshness of sea breeze and the natural fun of sage are the perfect portrait of a young explorer.",

  // 51. Wands Page C (ID 43)
  "You explore the world with curiosity, eager to welcome every new challenge. Sol de Janeiro’s Cheirosa '62 matches your lively nature—the lively sweetness of pistachio and almond, with the sunny scent of salted caramel, is the perfect portrait of a young explorer.",

  // 52. Wands Page D (ID 75)
  "You explore the world with curiosity, eager to welcome every new challenge. Acqua di Parma’s Fico di Amalfi matches your lively nature—the verdancy of fig leaves and the sweetness of fruit are the perfect portrait of a young explorer. This fragrance encourages you to maintain enthusiasm for exploration, accumulating experience in every attempt.",

  // 53. Wands Knight A (ID 1)
  "You throw yourself into action with full passion, pursuing speed and thrill without fear. Diptyque’s L'Ombre dans L'Eau fits your bursting energy—the surging greenery of blackcurrant leaves hits your face, full of motion and impact. Free and wild, this is the portrait of your unstoppable soul, helping you exude charm in the chase.",

  // 54. Wands Knight B (ID 37)
  "You throw yourself into action with full passion, pursuing the adventure of speed and thrill. Tom Ford’s Ombré Leather fits your bursting energy—the uninhibited nature of leather and the depth of wood reveal an adventurous spirit full of charm. This fragrance is the sexiest war song on your path of pursuit.",

  // 55. Wands Knight C (ID 41)
  "You throw yourself into action with full passion, pursuing the adventure of speed and thrill. Kilian’s Intoxicated fits your bursting energy—the intensity of coffee and the spice of cardamom reveal an adventurous spirit full of charm. This fragrance is the most intoxicating war song on your path of pursuit.",

  // 56. Wands Knight D (ID 79)
  "You throw yourself into action with full passion, pursuing the adventure of speed and thrill. Creed’s Virgin Island Water fits your bursting energy—the crispness of lime and the tropical flair of coconut reveal an adventurous spirit full of vitality. This fragrance is the most delightful war song on your path of pursuit.",

  // 57. Wands Queen A (ID 2)
  "You radiate sunny confidence and warmth, inspiring those around you with creativity. Stella McCartney’s Stella reflects your queenly aura—a pure, bright rose, warm, sincere, and full of life. Like your charisma, it naturally attracts beautiful people and things, illuminating every space you occupy.",

  // 58. Wands Queen B (ID 31)
  "You radiate sunny confidence and warmth, inspiring life around you with creativity. Maison Francis Kurkdjian’s À la Rose reflects your queenly aura—a grand rose garden blooming with charming vitality, this fragrance is the best interpretation of your charisma.",

  // 59. Wands Queen C (ID 53)
  "You radiate sunny confidence and warmth, inspiring your surroundings with creativity. Xerjoff’s Lira reflects your queenly aura—the tempting scent of caramel lemon cake, sweet and powerful. This fragrance is the best interpretation of your charisma, illuminating every space you occupy.",

  // 60. Wands Queen D (ID 66)
  "You radiate sunny confidence and warmth, inspiring your surroundings with creativity. Chloe’s Love Story reflects your queenly aura—the cleanliness of orange blossom and the tenderness of musk weave an elegant and firm charm. This fragrance is the best interpretation of your charisma, illuminating every space you occupy.",

  // 61. Wands King A (ID 7)
  "You lead with mature foresight and firm will, a leader trusted by all. Aesop’s Rozu resonates with your steady authority—a solid structure of smoky wood and leather supporting a deep rose. Powerful yet restrained, like true influence, it commands respect without anger, controlling the whole with composure.",

  // 62. Wands King B (ID 21)
  "You lead with mature foresight, showing unwavering authority in your steadiness. Le Labo’s Santal 33 resonates with your kingly control—the depth of sandalwood and the strength of leather build an influence that withstands the test of time. Commanding without words, it reveals true leadership.",

  // 63. Wands King C (ID 52)
  "You lead with mature foresight, showing unwavering authority in your steadiness. Maison Francis Kurkdjian’s Oud Satin Mood resonates with your kingly control—the depth of oud softened by rose, a velvet texture showing leadership of both strength and gentleness. Commanding without words, it reveals true leadership.",

  // 64. Wands King D (ID 70)
  "You lead with mature foresight, showing unwavering authority in your steadiness. Penhaligon's Castile resonates with your kingly control—the classic combination of orange blossom and soapy notes reveals elegant power tested by time. Commanding without words, it reveals true leadership in a classical style.",

  // 65. Cups Ace A (ID 14)
  "You feel the spring of emotion surging within, intuition and unconditional love flowing naturally. Frédéric Malle’s En Passant resonates with this pure awakening—the misty vapor of lilac and the freshness of cucumber capture the soul’s softest moment. Burden-free, it whispers: the essence of love is the willingness to open up to beauty.",

  // 66. Cups Ace B (ID 28)
  "The spring of emotion surges within you, unconditional love and intuition flowing naturally. Diptyque’s Tam Dao resonates with this pure awakening—the milky scent of sandalwood and the peace of cedar create a sacred emotional space. Setting no boundaries, it gently embraces every new feeling, accompanying you to experience the heart's first flutter.",

  // 67. Cups Ace C (ID 49)
  "The spring of emotion surges within you, innocent love flowing naturally. Comptoir Sud Pacifique’s Vanille Abricot resonates with this pure awakening—the sweet combination of vanilla and apricot is simple and warm, like a budding flower. Setting no boundaries, it gently embraces every new feeling, accompanying you to experience the heart's first flutter.",

  // 68. Cups Ace D (ID 61)
  "The spring of emotion flows naturally within you, pure love as clear as first snow. Byredo’s Blanche fits this awakening perfectly—white musk and aldehydes weave absolute cleanliness, like an unwritten beautiful chapter. Gentle, it embraces every new feeling, accompanying you to experience the heart's first flutter.",

  // 69. Cups 2 A (ID 2)
  "You are experiencing a sincere emotional connection, souls mirroring each other in equality and respect. Stella McCartney’s Stella interprets this harmonious love—a pure, warm rose, faithful from beginning to end, like the tacit understanding between souls that needs no words. May this simple, deep fragrance be the silent promise between you.",

  // 70. Cups 2 B (ID 33)
  "You are experiencing deep soul resonance, two hearts mirroring each other in equality and respect. Loewe’s 001 Woman interprets this intimate connection—the warmth of vanilla and the sweetness of jasmine weave the gentleness of skin-to-skin contact wrapped in musk. This fragrance records the moment of telepathy, becoming a wordless promise between you.",

  // 71. Cups 2 C (ID 52)
  "You are experiencing deep soul resonance, two hearts mirroring each other in equality and respect. Maison Francis Kurkdjian’s Oud Satin Mood interprets this intimate connection—the depth of oud gently wrapped in rose, a velvet texture like an inseparable embrace. This fragrance records the eternal moment of telepathy, becoming the deepest promise between you.",

  // 72. Cups 2 D (ID 63)
  "You are experiencing deep soul resonance, two hearts mirroring each other in tacit understanding. Narciso Rodriguez’s For Her Eau de Toilette interprets this intimacy—the cleanliness of musk and the softness of florals outline the warm memory of skin-to-skin contact. This fragrance records the moment of telepathy, becoming a wordless promise between you.",

  // 73. Cups 3 A (ID 16)
  "You are immersed in celebration with others, the harvest of friendship and emotion satisfying the soul. L'Artisan’s La Chasse aux Papillons echoes this joy perfectly—white flowers dance in the sun, the sweet scent of linden nectar overflowing with pure happiness. This fragrance belongs to shared times, witnessing the warmest connections between people.",

  // 74. Cups 3 B (ID 32)
  "You are immersed in celebration with others, the harvest of emotion filling the soul with joy. Byredo’s Bal d'Afrique resonates with this shared happiness—the brightness of bergamot and the warmth of amber feel like golden festive sunlight. This fragrance belongs to moments of gathering, witnessing the most sincere emotional exchanges between people.",

  // 75. Cups 3 C (ID 51)
  "You are immersed in celebration with others, the harvest of emotion filling the soul with joy. Kilian’s Angels' Share resonates with this shared happiness—the mellowness of cognac and the warm sweetness of hazelnut feel like a festive feast. This fragrance belongs to moments of gathering, witnessing the warmest emotional exchanges between people.",

  // 76. Cups 3 D (ID 79)
  "You are immersed in celebration with others, the harvest of emotion filling the soul with joy. Creed’s Virgin Island Water resonates with this shared happiness—the crispness of lime and the tropical flair of coconut feel like an island party that never ends. This fragrance belongs to moments of gathering, witnessing the most sincere emotional exchanges between people.",

  // 77. Cups 4 A (ID 20)
  "You feel weary of emotional invitations from the outside, longing to look inward for true satisfaction. Gucci’s Mémoire d'une Odeur fits this introspective mood—the simplicity of chamomile and the detachment of mineral musk create an atmosphere withdrawn from reality. It judges not your retreat, but offers quietness, letting you rediscover your needs in solitude.",

  // 78. Cups 4 B (ID 24)
  "You feel weary of emotional invitations from the outside, longing to find true satisfaction in solitude. Aesop’s Hwyl fits this introspective mood—the depth of cypress and the moisture of moss create a quiet space far from the noise. It does not disturb your contemplation, but offers a resting place for the weary soul.",

  // 79. Cups 4 C (ID 56)
  "You feel weary of emotional invitations from the outside, longing to find true satisfaction in solitude. BDK’s Gris Charnel fits this introspective mood—the milkiness of fig and the bitterness of tea weave a hazy tranquility on a sandalwood base. It does not disturb your contemplation, but offers a resting place for the weary soul.",

  // 80. Cups 4 D (ID 65)
  "You feel weary of emotional invitations from the outside, longing to find true satisfaction in solitude. Acca Kappa’s White Moss fits this introspective mood—the cleanliness of white musk and the moisture of moss create a quiet space far from the clamor. It does not disturb your contemplation, but offers a resting place for the weary soul."
];

async function main() {
    const sourcePath = path.join(__dirname, '../batch_2_source.json');
    if (!fs.existsSync(sourcePath)) {
        console.error('Batch 2 source file not found');
        process.exit(1);
    }
    const rawData = fs.readFileSync(sourcePath, 'utf-8');
    const sourceData = JSON.parse(rawData);

    if (sourceData.length !== translations.length) {
        console.error(`Mismatch: Source has ${sourceData.length} items, translations has ${translations.length} items.`);
        process.exit(1);
    }

    const mergedData = sourceData.map((item: any, index: number) => ({
        ...item,
        description_en: translations[index]
    }));

    const outputPath = path.join(__dirname, '../perfume_translations_batch_new_2.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
    console.log(`Successfully generated ${outputPath} with ${mergedData.length} items.`);
}

main();
