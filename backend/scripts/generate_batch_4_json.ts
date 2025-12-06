
import * as fs from 'fs';
import * as path from 'path';

const translations = [
  // 1. Swords Page A (ID 5)
  "You explore the world with keen curiosity, eager to capture and share new messages. Byredo’s Young Rose resonates with your youthful mind—the slight prick of Sichuan pepper and the vibrancy of green rose mirror your thirst for knowledge. This fragrance encourages you to keep an open mind, accumulating fragments of wisdom in your exploration.",

  // 2. Swords Page B (ID 34)
  "You capture information with keen thought, passionate about exploring the world. Aesop’s Tacit resonates with your youthful wisdom—the brightness of citrus and the clarity of vetiver are perfect reflections of your thirst for knowledge. This fragrance encourages you to maintain an open and agile mind.",

  // 3. Swords Page C (ID 50)
  "You capture information with keen thought, passionate about exploring the world. Akro’s Awake resonates with your youthful wisdom—the pure aroma of concentrated espresso brings instant mental focus, a perfect reflection of your thirst for knowledge. This fragrance encourages you to maintain an open and agile mind.",

  // 4. Swords Page D (ID 78)
  "You capture information with keen thought, passionate about exploring the world. Maison Francis Kurkdjian’s Aqua Celestia resonates with your youthful wisdom—the freshness of mint and the brightness of lemon are perfect reflections of your thirst for knowledge. This fragrance encourages you to maintain an open and agile mind.",

  // 5. Swords Knight A (ID 13)
  "Your mind is swift as the wind, challenging all obstacles in pursuit of truth. Diptyque’s Ofrésia rides with your knightly sharpness—the linear green scent of freesia cuts straight to the core without detour. This fragrance gives you the courage to break through the fog, letting the sword of reason clear the path for truth.",

  // 6. Swords Knight B (ID 40)
  "Your mind is swift as the wind, charging forward in pursuit of truth. Hermès’ Terre d'Hermès rides with your knightly sharpness—the coolness of minerals and the steadfastness of vetiver break through all mental barriers. This fragrance grants you the fearless courage to pursue total honesty.",

  // 7. Swords Knight C (ID 41)
  "Your mind is swift as the wind, charging forward in pursuit of truth. Kilian’s Intoxicated rides with your knightly sharpness—the intensity of coffee and the spice of cardamom break through all mental barriers. This fragrance grants you the fearless courage to pursue total honesty.",

  // 8. Swords Knight D (ID 64)
  "Your mind is swift as the wind, charging forward in pursuit of truth. Creed’s Silver Mountain Water rides with your knightly sharpness—the clarity of melted glacial water penetrates all mist, while the chill of green tea directs your path. This fragrance grants you the fearless courage to pursue total honesty.",

  // 9. Swords Queen A (ID 7)
  "You survey the world with cool insight, possessing clear boundaries after weathering storms. Aesop’s Rozu mirrors your queenly wisdom—smoky woods and gloomy rose construct an inviolable aura. This fragrance appeals not to emotion but, with profound complexity, displays the sheer power of thought.",

  // 10. Swords Queen B (ID 22)
  "You survey the world with cool insight, possessing clear boundaries after weathering storms. Tom Ford’s Oud Wood mirrors your queenly wisdom—the depth of oud and the dignity of sandalwood construct an inviolable territory of thought. This fragrance displays the power of wisdom accumulated over time.",

  // 11. Swords Queen C (ID 55)
  "You survey the world with cool insight, possessing clear boundaries after weathering storms. Guerlain’s Tonka Imperiale mirrors your queenly wisdom—the richness of tonka bean and the warmth of tobacco construct an inviolable territory of thought. This fragrance displays the power of wisdom accumulated over time.",

  // 12. Swords Queen D (ID 61)
  "You survey the world with cool insight, possessing clear boundaries after weathering storms. Byredo’s Blanche mirrors your queenly wisdom—absolute purity and objectivity construct an inviolable territory of thought. This fragrance displays the power of wisdom accumulated over time.",

  // 13. Swords King A (ID 18)
  "You control the situation with absolute reason and fairness, the embodiment of truth and principle. Creed’s Love in White fits your kingly authority—pure orange blossom and magnolia scent, structured clearly like legal statutes. Unbiased and just, it symbolizes the regal demeanor of adjudicating disputes with wisdom.",

  // 14. Swords King B (ID 35)
  "You control the situation with absolute reason, the embodiment of truth and principle. Le Labo’s Thé Noir 29 fits your kingly authority—the rationality of black tea and the depth of tobacco are structured consistently like legal statutes. This fragrance symbolizes the regal demeanor of adjudicating disputes with wisdom.",

  // 15. Swords King C (ID 44)
  "You control the situation with absolute reason, the embodiment of truth and principle. Guerlain’s Spiritueuse Double Vanille fits your kingly authority—the sanctity of vanilla and the mellowness of rum are structured consistently like legal statutes. This fragrance symbolizes the regal demeanor of adjudicating disputes with wisdom.",

  // 16. Swords King D (ID 69)
  "You control the situation with absolute reason, the embodiment of truth and principle. Maison Francis Kurkdjian’s Aqua Universalis fits your kingly authority—extreme cleanliness and balance are structured consistently like legal statutes. This fragrance symbolizes the regal demeanor of adjudicating disputes with wisdom.",

  // 17. Pentacles Ace A (ID 5)
  "You are welcoming a brand new material opportunity, a beginning full of potential unfolding before you. Byredo’s Young Rose resonates with this nascent energy—the slight prick of Sichuan pepper and the scent of green stems symbolize vitality breaking through the soil. It promises no result, but grants you the courage to begin: every abundance starts with a brave sowing.",

  // 18. Pentacles Ace B (ID 30)
  "You are welcoming a brand new material opportunity, the seed of abundance sprouting in your hand. Kilian’s Sacred Wood resonates with this nascent energy—purest sandalwood carrying milky warmth and sanctity. This fragrance guards the potential of every new beginning: the most solid achievements start with devout belief in beauty.",

  // 19. Pentacles Ace C (ID 49)
  "You are welcoming a brand new material opportunity, the seed of abundance sprouting in your hand. Comptoir Sud Pacifique’s Vanille Abricot resonates with this nascent energy—the simple sweetness of vanilla and apricot is warm like a new sprout. This fragrance guards the potential of every new beginning, reminding you: solid achievements start with pure belief.",

  // 20. Pentacles Ace D (ID 75)
  "You are welcoming a brand new material opportunity, the seed of abundance sprouting in your hand. Acqua di Parma’s Fico di Amalfi resonates with this nascent energy—the greenness of fig leaves and the sweetness of fruit act as new sprouts. This fragrance guards the potential of every new beginning, reminding you: solid achievements start with pure belief.",

  // 21. Pentacles 2 A (ID 6)
  "You flexibly balance multiple resources, handling various challenges with ease amidst change. Goutal Paris’ Rose Pompon fits this state of mastery—the liveliness of blackcurrant and the slight spice of pink pepper make the rose appear light and agile. This fragrance reminds you: true control comes from the effortless adjustment to life's rhythm.",

  // 22. Pentacles 2 B (ID 32)
  "You flexibly circulate various resources, maintaining elegant balance amidst change. Byredo’s Bal d'Afrique fits this calm state—the brightness of bergamot and the warmth of amber flow like golden sands in sunlight. This fragrance reminds you: true control comes from confident command of life's rhythm.",

  // 23. Pentacles 2 C (ID 43)
  "You flexibly circulate various resources, maintaining joyful balance amidst change. Sol de Janeiro’s Cheirosa '62 fits this calm state—the lively sweetness of pistachio and almond, with the sunny scent of salted caramel, makes resource management feel effortless. This fragrance reminds you: true control comes from joyful command of life's rhythm.",

  // 24. Pentacles 2 D (ID 26)
  "You flexibly circulate various resources, maintaining calm balance amidst change. Jo Malone’s Wood Sage & Sea Salt fits this state of mastery—the freshness of sea breeze and the warmth of sage make resource management feel effortless. This fragrance reminds you: true control comes from joyful command of life's rhythm.",

  // 25. Pentacles 3 A (ID 7)
  "You steadily build a solid career foundation through teamwork and exquisite craftsmanship. Aesop’s Rozu echoes this focused dedication—the solid structure of smoky woods and leather supports a rose tempered by trials. It seeks not speed, but witnesses every refinement of excellence.",

  // 26. Pentacles 3 B (ID 35)
  "You build lasting value through solid cooperation and craftsmanship. Le Labo’s Thé Noir 29 echoes this focused dedication—the richness of black tea and the depth of tobacco achieve perfect collaboration in the sweetness of fig. This fragrance witnesses every process of turning concept into reality.",

  // 27. Pentacles 3 C (ID 58)
  "You build lasting value through solid cooperation and craftsmanship. Nishane’s Ani echoes this focused dedication—the spice of ginger and the richness of vanilla achieve perfect collaboration in the brightness of bergamot. This fragrance witnesses every process of turning concept into reality with meticulous care.",

  // 28. Pentacles 3 D (ID 70)
  "You build lasting value through solid cooperation and craftsmanship. Penhaligon's Castile echoes this focused dedication—the classic combination of orange blossom and soapiness displays a style tested by time. This fragrance witnesses every process of turning concept into reality with meticulous care.",

  // 29. Pentacles 4 A (ID 18)
  "You carefully guard existing achievements, establishing a solid sense of security and order. Creed’s Love in White resonates with this protective energy—pure orange blossom and magnolia are like a carefully maintained precious collection. It does not encourage risk, but adds a holy luster to your stable life.",

  // 30. Pentacles 4 B (ID 21)
  "You carefully guard existing achievements, establishing a solid security boundary. Le Labo’s Santal 33 resonates with this protective energy—the steadiness of sandalwood and the toughness of leather construct a foundation that withstands time. It does not encourage risk, but provides the most reliable companionship for your accumulation.",

  // 31. Pentacles 4 C (ID 44)
  "You carefully guard existing achievements, establishing a solid security boundary. Guerlain’s Spiritueuse Double Vanille resonates with this protective energy—the sanctity of vanilla and the mellowness of rum construct a treasure that withstands time. It does not encourage risk, but provides the most reliable guarantee for your accumulation.",

  // 32. Pentacles 4 D (ID 61)
  "You carefully guard existing achievements, establishing a solid security boundary. Byredo’s Blanche resonates with this protective energy—the absolute cleanliness of aldehydes and white musk construct a treasured space that withstands time. It does not encourage risk, but provides the most reliable guarantee for your accumulation.",

  // 33. Pentacles 5 A (ID 15)
  "You feel material deprivation and isolation, seeking a glimmer of hope in adversity. Penhaligon's Bluebell understands this hardship—damp earth and gloomy greenery outline a solitary walk in the cold. It masks not the destitution, but accompanies you as you await the moment the clouds disperse.",

  // 34. Pentacles 5 B (ID 23)
  "You feel material hardship, seeking warm solace in the cold. Maison Martin Margiela’s By the Fireplace understands this struggle—the sweet scent of roasted chestnuts and the warmth of the fire light up hope in the predicament. It changes not reality, but makes the waiting bearable.",

  // 35. Pentacles 5 C (ID 47)
  "You feel material hardship, seeking warm solace in the cold. Serge Lutens’ Jeux de Peau understands this struggle—the warm scent of toasted bread and the richness of milk light up hope in the predicament. It changes not reality, but makes low points bearable, finding warmth in simplest needs.",

  // 36. Pentacles 5 D (ID 62)
  "You feel material hardship, seeking warm solace in the cold. Maison Martin Margiela’s Lazy Sunday Morning understands this struggle—the freshness of lily of the valley and the moisture of pear light up hope in the predicament wrapped in white musk. It changes not reality, but makes the waiting bearable.",

  // 37. Pentacles 6 A (ID 2)
  "You generously share wealth and resources, maintaining balance between giving and receiving. Stella McCartney’s Stella reflects this generous spirit—a pure and warm rose, embracing every soul in need of comfort equally. This fragrance reminds you: true abundance lies in healthy flow and sharing.",

  // 38. Pentacles 6 B (ID 26)
  "You generously share resources, maintaining elegant balance between giving and receiving. Jo Malone’s Wood Sage & Sea Salt reflects this generous spirit—the freshness of sea breeze and the warmth of sage create an atmosphere of equality and inclusion. This fragrance reminds you: healthy flow makes wealth meaningful.",

  // 39. Pentacles 6 C (ID 51)
  "You generously share resources, maintaining elegant balance between giving and receiving. Kilian’s Angels' Share reflects this generous spirit—the mellowness of cognac and the warm sweetness of hazelnut create a rich and joyful atmosphere of sharing. This fragrance reminds you: healthy flow makes wealth meaningful.",

  // 40. Pentacles 6 D (ID 63)
  "You generously share resources, maintaining elegant balance between giving and receiving. Narciso Rodriguez’s For Her Eau de Toilette reflects this generous spirit—the cleanliness of musk and softness of florals create an atmosphere of equality and inclusion. This fragrance reminds you: healthy flow makes wealth meaningful.",

  // 41. Pentacles 7 A (ID 12)
  "You patiently wait for the returns on long-term investment, planning a further future in the stillness. Hermès’ Le Jardin de Monsieur Li fits this wisdom of waiting—kumquat and jasmine growing quietly in the courtyard, mossy stones recording the traces of time. It rushes not the result, but accompanies you to accumulate strength in silence.",

  // 42. Pentacles 7 B (ID 24)
  "You patiently wait for the returns on long-term investment, planning a further future in the stillness. Aesop’s Hwyl fits this wisdom of waiting—the seclusion of cypress and the persistence of moss record the accumulation of time. It rushes not the result, but accompanies you to accumulate strength in silence.",

  // 43. Pentacles 7 C (ID 55)
  "You patiently wait for the returns on long-term investment, planning a further future in the stillness. Guerlain’s Tonka Imperiale fits this wisdom of waiting—the richness of tonka bean and the warmth of tobacco record the accumulation of time. It rushes not the result, but accompanies you to accumulate strength in silence.",

  // 44. Pentacles 7 D (ID 65)
  "You patiently wait for the returns on long-term investment, planning a further future in the stillness. Acca Kappa’s White Moss fits this wisdom of waiting—the cleanliness of white musk and the wetness of moss record the accumulation of time. It rushes not the result, but accompanies you to accumulate strength in silence.",

  // 45. Pentacles 8 A (ID 13)
  "You focus on honing your skills, pursuing extreme professionalism in repetitive labor. Diptyque’s Ofrésia resonates with this focus—the green scent of freesia is linear and pure, without distraction. This fragrance witnesses every moment you transform the ordinary into the extraordinary.",

  // 46. Pentacles 8 B (ID 28)
  "You focus on honing your skills, pursuing extreme professionalism in repetition. Diptyque’s Tam Dao resonates with this focus—the purity of sandalwood and the solidity of cedar demonstrate persistent craftsmanship. This fragrance witnesses every day and night you transform the ordinary into the extraordinary.",

  // 47. Pentacles 8 C (ID 56)
  "You focus on honing your skills, pursuing extreme professionalism in repetition. BDK’s Gris Charnel resonates with this focus—the milkiness of fig and the bitterness of tea demonstrate persistent craftsmanship on a sandalwood base. This fragrance witnesses every day and night you transform the ordinary into the extraordinary.",

  // 48. Pentacles 8 D (ID 74)
  "You focus on honing your skills, pursuing extreme professionalism in repetition. Diptyque’s Eau des Sens resonates with this focus—the clarity of bitter orange and the greenery of juniper berry demonstrate persistent craftsmanship in the cleanliness of orange blossom. This fragrance witnesses every day and night you transform the ordinary into the extraordinary.",

  // 49. Pentacles 9 A (ID 4)
  "You enjoy the abundant fruits of self-discipline, feeling heartfelt satisfaction for your achievements. Frédéric Malle’s Une Rose fits this mood of self-reward—a grand and gorgeous rose, full, sexy, and undeniable. This fragrance is the best reward for your efforts, reminding you: you act worthy of all this beauty.",

  // 50. Pentacles 9 B (ID 31)
  "You enjoy the abundant fruits of self-discipline, feeling heartfelt pride for your achievements. Maison Francis Kurkdjian’s À la Rose fits this mood of self-reward—a grand rose garden blooming with luxurious joy. This fragrance is the best reward for your efforts, reminding you that you act worthy of all this beauty.",

  // 51. Pentacles 9 C (ID 53)
  "You enjoy the abundant fruits of self-discipline, feeling heartfelt pride for your achievements. Xerjoff’s Lira fits this mood of self-reward—the tempting aroma of caramel lemon cake, sweet and satisfying. This fragrance is the best reward for your efforts, reminding you that you act worthy of all this beauty.",

  // 52. Pentacles 9 D (ID 76)
  "You enjoy the abundant fruits of self-discipline, feeling heartfelt pride for your achievements. Byredo’s Sundazed fits this mood of self-reward—the sunny scent of citrus and the warm texture of musk weave a private space full of joy. This fragrance is the best reward for your efforts, reminding you that you act worthy of all this beauty.",

  // 53. Pentacles 10 A (ID 18)
  "You establish a solid material foundation, enjoying the abundance and completion of family legacy. Creed’s Love in White crowns this multigenerational achievement—the richness of rice husks set against the sanctity of orange blossom and magnolia, like the crystallization of family wisdom. Embracing all, it witnesses the lasting legacy you create.",

  // 54. Pentacles 10 B (ID 40)
  "You establish a solid material legacy, enjoying the abundance and completion of generations. Hermès’ Terre d'Hermès crowns this achievement—the vitality of grapefruit and the breadth of vetiver build a foundation worth inheriting. This fragrance embraces all, witnessing the lasting value you create.",

  // 55. Pentacles 10 D (ID 42)
  "You establish a solid material legacy, enjoying the abundance and completion of generations. Maison Francis Kurkdjian’s Grand Soir crowns this achievement—the splendor of amber and the richness of vanilla build a foundation worth inheriting. This fragrance embraces all, witnessing the lasting value you create.",

  // 56. Pentacles 10 D (ID 66)
  "You establish a solid material legacy, enjoying the completion of family and emotion. Chloe’s Love Story crowns this achievement—the cleanliness of orange blossom and the gentleness of musk build a happy community full of belonging. This fragrance witnesses the lasting value and warm heritage you create.",

  // 57. Pentacles Page A (ID 20)
  "You learn and accumulate with a pragmatic attitude, laying a solid foundation for the future. Gucci’s Mémoire d'une Odeur fits this grounded state—the simplicity of chamomile and the coolness of mineral musk record every process of serious learning. It seeks not shortcuts, but accompanies you steadily on the road of growth.",

  // 58. Pentacles Page B (ID 34)
  "You learn and accumulate with a pragmatic attitude, laying a solid foundation for the future. Aesop’s Tacit fits this grounded state—the freshness of citrus and the clarity of vetiver record every moment of serious learning. It seeks not shortcuts, but accompanies you steadily on the road of growth.",

  // 59. Pentacles Page C (ID 49)
  "You learn and accumulate with a pragmatic attitude, laying a solid foundation for the future. Comptoir Sud Pacifique’s Vanille Abricot fits this grounded state—the simple sweetness of vanilla and apricot records every moment of serious learning. It seeks not shortcuts, but accompanies you steadily on the road of growth.",

  // 60. Pentacles Page D (ID 75)
  "You learn and accumulate with a pragmatic attitude, laying a solid foundation for the future. Acqua di Parma’s Fico di Amalfi fits this grounded state—the greenness of fig leaves and the sweetness of fruit record every moment of serious learning. It seeks not shortcuts, but accompanies you steadily on the road of growth.",

  // 61. Pentacles Knight A (ID 12)
  "You move forward with reliable steps, achieving every goal with patience and persistence. Hermès’ Le Jardin de Monsieur Li walks with your knightly steadiness—kumquat and jasmine bloom leisurely in the courtyard, the breath of mossy stones enduring as ever. It pursues not speed, but guarantees the fulfillment of every promise.",

  // 62. Pentacles Knight B (ID 38)
  "You move forward with reliable steps, fulfilling every promise with patience. Serge Lutens’ Chergui walks with your knightly steadiness—the warmth of honey and the richness of hay display a character tested by time. It pursues not speed, but guarantees every goal is solidly achieved.",

  // 63. Pentacles Knight C (ID 60)
  "You move forward with reliable steps, fulfilling every promise with patience. Parfums de Marly’s Herod walks with your knightly steadiness—the dryness of tobacco and the warmth of cinnamon display a character tested by time in the freshness of grapefruit. It pursues not speed, but guarantees every goal is solidly achieved.",

  // 64. Pentacles Knight D (ID 26)
  "You move forward with reliable steps, fulfilling every promise with patience. Jo Malone’s Wood Sage & Sea Salt walks with your knightly steadiness—the freshness of sea breeze and the warmth of sage display a character tested by time. It pursues not speed, but guarantees every goal is solidly achieved.",

  // 65. Pentacles Queen A (ID 11)
  "You guard everything around you with warm nourishment, perfectly combining pragmatism with care. Goutal Paris’ Le Chèvrefeuille resonates with your queenly nurturing quality—cool honeysuckle with bitter greenness, like the embrace of Mother Earth. Unpretentious, it nourishes every life needing warmth with profound tolerance.",

  // 66. Pentacles Queen B (ID 36)
  "You guard everything around you with warm nourishment, perfectly combining pragmatism with care. Diptyque’s Philosykos resonates with your queenly nurturing quality—the greenness of fig leaves and the milky sweetness of fruit are like the generous embrace of Mother Earth. Unpretentious, it nourishes every life with natural abundance.",

  // 67. Pentacles Queen C (ID 47)
  "You guard everything around you with warm nourishment, perfectly combining pragmatism with care. Serge Lutens’ Jeux de Peau resonates with your queenly nurturing quality—the warm scent of toasted bread and the richness of milk are like the simplest generosity of Mother Earth. Unpretentious, it nourishes every life with natural warmth.",

  // 68. Pentacles Queen D (ID 65)
  "You guard everything around you with warm nourishment, perfectly combining pragmatism with care. Acca Kappa’s White Moss resonates with your queenly nurturing quality—the cleanliness of white musk and the wetness of moss are like the simplest generosity of Mother Earth. Unpretentious, it nourishes every life with natural warmth.",

  // 69. Pentacles King A (ID 9)
  "You control the material world with rich experience, a steady and successful leader. Le Labo’s Rose 31 reflects your kingly authority—the wildness of cumin and deep woods construct an unshakable business map. Powerful and complex, just like true wealth, displaying regal demeanor in calmness.",

  // 70. Pentacles King B (ID 22)
  "You control the material world with rich experience, a steady and successful leader. Tom Ford’s Oud Wood reflects your kingly authority—the depth of oud and the dignity of sandalwood construct an unshakable business map. Powerful and complex, just like true wealth, displaying regal demeanor in calmness.",

  // 71. Pentacles King C (ID 52)
  "You control the material world with rich experience, a steady and successful leader. Maison Francis Kurkdjian’s Oud Satin Mood reflects your kingly authority—the depth of oud softened by rose, velvet texture showing leadership of strength and gentleness. Powerful and complex, just like true wealth, displaying regal demeanor in calmness.",

  // 72. Pentacles King D (ID 70)
  "You control the material world with rich experience, a steady and successful leader. Penhaligon's Castile reflects your kingly authority—the classic combination of orange blossom and soapiness displays elegant power tested by time. Commanding without words, showing true leadership style in classic tone."
];

async function main() {
    const sourcePath = path.join(__dirname, '../batch_4_source.json');
    if (!fs.existsSync(sourcePath)) {
        console.error('Batch 4 source file not found');
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

    const outputPath = path.join(__dirname, '../perfume_translations_batch_new_4.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
    console.log(`Successfully generated ${outputPath} with ${mergedData.length} items.`);
}

main();
