
import * as fs from 'fs';
import * as path from 'path';

const translations = [
  // 1. Cups 5 A (ID 15)
  "You grieve for what is lost, immersed in regret and emptiness. Penhaligon's Bluebell understands this heartache—the scent of damp earth and gloomy greenery outlines a forgotten corner in the rain. It does not rush to comfort, but gently accompanies you to acknowledge: sadness is the proof that you have loved.",
  
  // 2. Cups 5 B (ID 38)
  "You grieve for what is lost, immersed in regret and sadness. Serge Lutens’ Chergui understands this heartache—the sweet warmth of honey and the richness of hay feel like an embrace full of understanding. It does not rush to heal, but gently accompanies you through this necessary sorrow.",

  // 3. Cups 5 C (ID 47)
  "You grieve for what is lost, immersed in regret and sadness. Serge Lutens’ Jeux de Peau understands this heartache—the warm scent of toasted bread and the richness of milk comfort the soul with the simplest warmth. It does not rush to heal, but gently accompanies you through this necessary sorrow.",

  // 4. Cups 5 D (ID 62)
  "You grieve for what is lost, immersed in regret and sadness. Maison Martin Margiela’s Lazy Sunday Morning understands this heartache—the freshness of lily of the valley and the moistness of pear bring gentle solace wrapped in white musk. It does not rush to heal, but fills the process of repair with hope.",

  // 5. Cups 6 A (ID 17)
  "You return to innocent emotional memories, warmed by the beauty of childhood and selfless giving. Jo Malone’s Wild Bluebell evokes this tenderness—dewy watermelon ketone and the sweetness of bluebell weave an innocent dream. Like a precious gift from childhood, it reminds you: the sincerest emotions remain forever clear.",

  // 6. Cups 6 B (ID 23)
  "You return to innocent emotional memories, childhood warmth and selfless giving welling up in your heart. Maison Martin Margiela’s By the Fireplace evokes this nostalgia—the sweet scent of roasted chestnuts and the warmth of the fire recreate beautiful times cherished in the heart. Like a childhood fireside, it forever keeps the original warmth.",

  // 7. Cups 6 C (ID 43)
  "You return to innocent emotional memories, childhood beauty and selfless giving welling up in your heart. Sol de Janeiro’s Cheirosa '62 evokes this nostalgia—the milky sweetness of pistachio and almond, with the warmth of salted caramel, recreate beautiful times cherished in the heart. Like a childhood gift, it forever keeps the original sincerity.",

  // 8. Cups 6 D (ID 66)
  "You return to innocent emotional memories, childhood beauty and selfless giving welling up in your heart. Chloe’s Love Story evokes this nostalgia—the cleanliness of orange blossom and the tenderness of musk recreate beautiful times cherished in the heart. Like a promise from youth, it forever keeps the original sincerity.",

  // 9. Cups 7 A (ID 19)
  "You are immersed in emotional fantasies, facing many possibilities but unable to choose. Aerin’s Lilac Path walks with this hazy longing—an extremely realistic lilac scent, as beautiful as a dream scene. It does not rush you to wake, but invites you to see clearly: true choice requires the courage to walk out of the mist of imagination.",

  // 10. Cups 7 B (ID 30)
  "You are immersed in emotional fantasies, facing many possibilities difficult to choose from. Kilian’s Sacred Wood walks with this hazy longing—purest sandalwood bringing sober spiritual perception. It does not break the dream, but helps you find the inner truth within the mist of emotion.",

  // 11. Cups 7 C (ID 53)
  "You are immersed in emotional fantasies, facing many possibilities difficult to choose from. Xerjoff’s Lira walks with this hazy longing—the tempting scent of caramel lemon cake, as beautiful as a dream scene. It does not rush you to wake, but invites you to see clearly the true desire of your heart.",

  // 12. Cups 7 D (ID 71)
  "You are immersed in emotional fantasies, facing many possibilities difficult to choose from. Hermès’ Un Jardin Sur La Lagune walks with this hazy longing—magnolia and lily in salty sea breeze outline a dreamy garden view. It does not rush you to wake, but invites you to find balance between imagination and reality.",

  // 13. Cups 8 A (ID 13)
  "You decide to leave an emotional state that no longer satisfies, seeking deeper meaning. Diptyque’s Ofrésia gives you the courage to turn away—the sharp, decisive green stem scent of freesia symbolizes severing and rebirth. It does not say goodbye, but lights the way forward for you: some departures are for a more complete return.",

  // 14. Cups 8 B (ID 37)
  "You decide to leave an emotional state that no longer satisfies, seeking deeper meaning. Tom Ford’s Ombré Leather gives you the courage to turn away—the independence of leather and the depth of wood symbolize a resolute farewell. It does not ask you to stay, but opens new possibilities for your emotional growth.",

  // 15. Cups 8 C (ID 60)
  "You decide to leave an emotional state that no longer satisfies, seeking deeper meaning. Parfums de Marly’s Herod gives you the courage to turn away—the dryness of tobacco and the warmth of cinnamon find new direction in the freshness of grapefruit. It does not ask you to stay, but opens new possibilities for your emotional growth.",

  // 16. Cups 8 D (ID 80)
  "You decide to leave an emotional state that no longer satisfies, seeking deeper meaning. Le Labo’s Baie 19 gives you the courage to turn away—the coldness of mineral after rain and the scent of wet earth symbolize a sober farewell. It does not ask you to stay, but opens new dimensions for your emotional growth.",

  // 17. Cups 9 A (ID 4)
  "You enjoy emotional satisfaction and self-intoxication, proud of your achievements and charm. Frédéric Malle’s Une Rose resonates with this self-recognition—a grand, magnificent rose, full, sexy, and impossible to ignore. This fragrance is a reward to yourself, reminding you: you deserve all the beauty in the world, for you are the creator of beauty.",

  // 18. Cups 9 B (ID 39)
  "You enjoy emotional self-satisfaction, delighted by your charm and achievements. Jo Malone’s Myrrh & Tonka resonates with this self-recognition—the peace of lavender and the sweetness of vanilla weave a private space full of joy. This fragrance is a reward to yourself, celebrating you becoming your favorite version of yourself.",

  // 19. Cups 9 C (ID 44)
  "You enjoy emotional self-satisfaction, delighted by your charm and achievements. Guerlain’s Spiritueuse Double Vanille resonates with this self-recognition—the sanctity of vanilla and the mellowness of rum weave a private space full of joy. This fragrance is a reward to yourself, celebrating you becoming your favorite version of yourself.",

  // 20. Cups 9 D (ID 76)
  "You enjoy emotional self-satisfaction, delighted by your charm and achievements. Byredo’s Sundazed resonates with this self-recognition—the sunny scent of citrus and the warm texture of musk weave a private space full of joy. This fragrance is a reward to yourself, celebrating you becoming your favorite version of yourself.",

  // 21. Cups 10 A (ID 18)
  "You experience emotional fulfillment and harmony, feeling complete through family and collective love. Creed’s Love in White crowns this happy moment—the richness of rice husks set against the sanctity of orange blossom and magnolia, like family joy shining in the sun. Embracing all things, it witnesses the community of love you have created.",

  // 22. Cups 10 B (ID 21)
  "You experience emotional fulfillment and harmony, feeling complete through family and collective love. Le Labo’s Santal 33 crowns this happy moment—the warmth of sandalwood and the inclusivity of leather construct an emotional community full of belonging. This fragrance witnesses the home of love you have created.",

  // 23. Cups 10 C (ID 42)
  "You experience emotional fulfillment and harmony, feeling complete through love and warmth. Maison Francis Kurkdjian’s Grand Soir crowns this happy moment—the warmth of amber and the length of vanilla construct an emotional community full of belonging. This fragrance witnesses the home of love you have created.",

  // 24. Cups 10 D (ID 26)
  "You experience emotional fulfillment and harmony, feeling complete through love and warmth. Jo Malone’s Wood Sage & Sea Salt crowns this happy moment—the freshness of sea breeze and the warmth of sage construct an emotional community full of belonging. This fragrance witnesses the home of love you have created.",

  // 25. Cups Page A (ID 17)
  "You explore the world with gentle curiosity, ready to receive new emotional messages. Jo Malone’s Wild Bluebell matches your innocent and sensitive nature—the moist, sweet scent captures every small touch in life like the sensitive eyes of a youth. May this clean fragrance guard your original intention of exploration.",

  // 26. Cups Page B (ID 36)
  "You explore the emotional world with gentle curiosity, ready to receive messages from the heart. Diptyque’s Philosykos matches your innocent and sensitive nature—the greenness of fig leaves and the milky sweetness of fruit capture the subtle changes of the emotional world. This fragrance guards your original intention, making every heartbeat a gift of growth.",

  // 27. Cups Page C (ID 49)
  "You explore the emotional world with gentle curiosity, ready to receive messages from the heart. Comptoir Sud Pacifique’s Vanille Abricot matches your innocent and sensitive nature—the simple sweetness of vanilla and apricot captures the subtle changes of the emotional world. This fragrance guards your original intention, making every heartbeat a gift of growth.",

  // 28. Cups Page D (ID 75)
  "You explore the emotional world with gentle curiosity, ready to receive messages from the heart. Acqua di Parma’s Fico di Amalfi matches your innocent and sensitive nature—the greenness of fig leaves and the sweetness of fruit capture the subtle changes of the emotional world. This fragrance guards your original intention, making every heartbeat a gift of growth.",

  // 29. Cups Knight A (ID 3)
  "You walk into the world with a romantic posture, pursuing your ideal with poetry and sincerity. Penhaligon's The Coveted Duchess Rose walks with your knightly elegance—woody rose whispering in bitter citrus, telling a destiny where beauty and sorrow coexist. It promises no ending, but grants you dignity in the process of pursuit.",

  // 30. Cups Knight B (ID 33)
  "You walk into the world with a romantic posture, pursuing your ideal with poetry and sincerity. Loewe’s 001 Woman walks with your knightly elegance—the purity of jasmine and the lingering of vanilla tell of deep affection asking for no return. This fragrance gives you the courage to pursue, making every heartbeat a beautiful poem.",

  // 31. Cups Knight C (ID 58)
  "You walk into the world with a romantic posture, pursuing your ideal with poetry and sincerity. Nishane’s Ani walks with your knightly elegance—the vitality of ginger and the richness of vanilla tell of deep affection asking for no return in the brightness of bergamot. This fragrance gives you the courage to pursue, making every heartbeat a beautiful poem.",

  // 32. Cups Knight D (ID 73)
  "You walk into the world with a romantic posture, pursuing your ideal with poetry and sincerity. Tom Ford’s Sole di Positano walks with your knightly elegance—the brightness of citrus and the cleanliness of orange blossom tell of deep affection asking for no return. This fragrance gives you the courage to pursue, making every heartbeat a beautiful poem.",

  // 33. Cups Queen A (ID 11)
  "You nourish surrounding life with profound intuition, holding powerful empathy within gentleness. Goutal Paris’ Le Chèvrefeuille resonates with your queenly compassion—the cool honeysuckle with bitter greenness feels like an embrace that accepts all. Modest yet ethereal, it soothes every soul in need of rest.",

  // 34. Cups Queen B (ID 28)
  "You nourish surrounding life with profound intuition, holding powerful empathy within gentleness. Diptyque’s Tam Dao resonates with your queenly compassion—the acceptance of sandalwood and the protection of cedar create a secure emotional space. Modest yet deeply gentle, it soothes every soul in need of rest.",

  // 35. Cups Queen C (ID 56)
  "You nourish surrounding life with profound intuition, holding powerful empathy within gentleness. BDK’s Gris Charnel resonates with your queenly compassion—the tenderness of fig and the protection of sandalwood create a secure emotional space. Modest yet deeply gentle, it soothes every soul in need of rest.",

  // 36. Cups Queen D (ID 63)
  "You nourish surrounding life with profound intuition, holding powerful empathy within gentleness. Narciso Rodriguez’s For Her Eau de Toilette resonates with your queenly compassion—the acceptance of musk and the softness of florals create a secure emotional space. Modest yet deeply gentle, it soothes every soul in need of rest.",

  // 37. Cups King A (ID 12)
  "You balance reason and emotion with mature wisdom, a spiritual mentor trusted by all. Hermès’ Le Jardin de Monsieur Li mirrors your kingly composure—kumquat and jasmine reach perfect harmony in a wet courtyard, the scent of mossy stone solid as a rock. It reveals true strength: leading with understanding, profound in calmness.",

  // 38. Cups King B (ID 35)
  "You balance reason and emotion with mature wisdom, a spiritual mentor trusted by all. Le Labo’s Thé Noir 29 mirrors your kingly composure—the richness of black tea and the depth of tobacco reach perfect balance in the sweetness of fig. It reveals true strength: leading with understanding, profound in calmness.",

  // 39. Cups King C (ID 55)
  "You balance reason and emotion with mature wisdom, a spiritual mentor trusted by all. Guerlain’s Tonka Imperiale mirrors your kingly composure—the richness of tonka bean and the warmth of tobacco show an inclusivity born of experience. It reveals true strength: leading with understanding, profound in calmness.",

  // 40. Cups King D (ID 64)
  "You balance reason and emotion with mature wisdom, a spiritual mentor trusted by all. Creed’s Silver Mountain Water mirrors your kingly composure—the clarity of melted glacial water and the chill of green tea show clear judgment born of experience. It reveals true strength: leading with understanding, profound in coolness.",

  // 41. Swords Ace A (ID 13)
  "Your mind is as clear as a blade; a breakthrough idea cuts through the mist. Diptyque’s Ofrésia resonates with this mental sharpness—the green stem scent of freesia is distinct and direct, hesitating not at all. Symbolizing purity and precision of thought, it helps you cut through distractions and grasp the essence of inspiration.",

  // 42. Swords Ace B (ID 34)
  "Your mind bursts with sharp inspiration; a clear thought cuts through the mist. Aesop’s Tacit fits this mental edge perfectly—the fresh green of basil and the clarity of vetiver are like an unsheathed blade. It helps you cut through chaotic thoughts, focusing on the core concept of greatest value.",

  // 43. Swords Ace C (ID 50)
  "Your mind bursts with sharp inspiration; a clear thought cuts through the mist. Akro’s Awake fits this mental edge perfectly—the pure aroma of concentrated espresso brings instant mental focus, like an unsheathed blade. It helps you cut through chaotic thoughts, focusing on the core concept of greatest value.",

  // 44. Swords Ace D (ID 64)
  "Your mind bursts with sharp inspiration; a breakthrough idea cuts through the mist. Creed’s Silver Mountain Water fits this mental edge perfectly—the clarity of melted glacial water and the chill of green tea bring extreme focus and clarity. It helps you cut through chaotic thoughts, focusing on the core concept of greatest value.",

  // 45. Swords 2 A (ID 20)
  "You stand at the crossroads of choice, protecting inner peace with a temporary pause. Gucci’s Mémoire d'une Odeur fits this suspended state—the simplicity of chamomile and the detachment of mineral musk create a hazy sense of boundary. It does not rush your decision, but reserves a space for calm thinking.",

  // 46. Swords 2 B (ID 28)
  "You stand at the gateway of choice, guarding inner balance with temporary silence. Diptyque’s Tam Dao permeates this suspended state—the serenity of sandalwood and the stillness of cedar create an undisturbed space for thought. It does not rush the answer, but provides a peaceful mind for your weighing process.",

  // 47. Swords 2 C (ID 56)
  "You stand at the gateway of choice, guarding inner balance with temporary silence. BDK’s Gris Charnel permeates this suspended state—the milkiness of fig and the bitterness of tea construct a hazy space for thought on a sandalwood base. It does not rush the answer, but provides a peaceful mind for your weighing process.",

  // 48. Swords 2 D (ID 65)
  "You stand at the gateway of choice, guarding inner balance with temporary silence. Acca Kappa’s White Moss permeates this suspended state—the cleanliness of white musk and the moisture of moss create an undisturbed space for thought. It does not rush the answer, but provides a peaceful mind for your weighing process.",

  // 49. Swords 3 A (ID 15)
  "You are experiencing the pain of heartbreak, sadness piercing the heart like a sword. Penhaligon's Bluebell understands this deep loss—damp earth and gloomy greenery outline a lonely figure walking in the rain. It does not rush to heal, but gently accompanies you to acknowledge: pain is the mark of a heart that has truly given.",

  // 50. Swords 3 B (ID 38)
  "You are experiencing the pain of heartbreak, sadness piercing the heart like three swords. Serge Lutens’ Chergui understands this deep loss—the warmth of honey and richness of hay gently wrap the wounded soul. It does not rush to heal, but brings a little solace with every breath.",

  // 51. Swords 3 C (ID 47)
  "You are experiencing the pain of heartbreak, sadness piercing the heart like a sword. Serge Lutens’ Jeux de Peau understands this deep loss—the warm scent of toasted bread and the richness of milk soothe the wounded soul with simplest warmth. It does not rush to heal, but brings a little solace with every breath.",

  // 52. Swords 3 D (ID 62)
  "You are experiencing the pain of heartbreak, sadness piercing the heart like a sword. Maison Martin Margiela’s Lazy Sunday Morning understands this deep loss—the freshness of lily of the valley and the moistness of pear bring gentle solace wrapped in white musk. It does not rush to heal, but brings a little soothing with every breath.",

  // 53. Swords 4 A (ID 12)
  "You actively choose rest and isolation to allow your weary mind necessary repair. Hermès’ Le Jardin de Monsieur Li offers you an ideal space for contemplation—kumquat and jasmine whisper in a wet courtyard, the scent of mossy stone solid as a rock. It does not disturb your recovery, but quietly guards this time of regaining clarity.",

  // 54. Swords 4 B (ID 24)
  "You actively choose rest and isolation to allow your overthinking mind necessary repair. Aesop’s Hwyl creates an ideal space for recovery—the seclusion of cypress and the humidity of moss build a shelter far from the noise. It guards your moment of contemplation, letting the spirit regain clarity.",

  // 55. Swords 4 C (ID 55)
  "You actively choose rest and isolation to allow your overthinking mind necessary repair. Guerlain’s Tonka Imperiale creates an ideal space for recovery—the richness of tonka bean and the warmth of tobacco create a peaceful atmosphere best for contemplation. It guards your moment of contemplation, letting the spirit regain clarity.",

  // 56. Swords 4 D (ID 69)
  "You actively choose rest and isolation to allow your overthinking mind necessary repair. Maison Francis Kurkdjian’s Aqua Universalis creates an ideal space for recovery—the absolute cleanliness of lemon and lily of the valley construct a pure land for thought. It guards your moment of contemplation, letting the spirit regain clarity.",

  // 57. Swords 5 A (ID 9)
  "You are trapped in meaningless fighting, where victory is backed by emptiness and loss. Le Labo’s Rose 31 reflects the truth of this conflict—the wildness of cumin and the elegance of rose entangle in contradiction, a scent complex and slightly ironic. It judges not right or wrong, but reminds you: some victories cost the integrity of the self.",

  // 58. Swords 5 B (ID 40)
  "You are trapped in meaningless dispute, where victory is backed by emptiness and alienation. Hermès’ Terre d'Hermès reflects the essence of this conflict—the sharpness of grapefruit and the coldness of minerals reveal the cost of certain victories. It reminds you: true wisdom lies in seeing clearly what is worth fighting for.",

  // 59. Swords 5 C (ID 58)
  "You are trapped in meaningless dispute, where victory is backed by emptiness and alienation. Nishane’s Ani reflects the essence of this conflict—the spice of ginger and the sweetness of vanilla form an interesting confrontation, with bright bergamot weaving through. It reminds you: true wisdom lies in seeing clearly what is worth fighting for.",

  // 60. Swords 5 D (ID 78)
  "You are trapped in meaningless dispute, where victory is backed by emptiness and alienation. Maison Francis Kurkdjian’s Aqua Celestia reflects the essence of this conflict—the coolness of mint and the brightness of lemon reveal the cost of certain victories. It reminds you: true wisdom lies in seeing clearly what is worth fighting for.",

  // 61. Swords 6 A (ID 14)
  "You are smoothly navigating a difficulty, moving with scars towards a calmer shore. Frédéric Malle’s En Passant accompanies this healing journey—the watery mist of lilac gently wraps unhealed wounds. It does not rush to dispel sadness, but adds a touch of poetic tenderness to your transition.",

  // 62. Swords 6 B (ID 26)
  "You are smoothly navigating an emotional difficulty, moving with scars towards a calmer shore. Jo Malone’s Wood Sage & Sea Salt accompanies this healing journey—the freshness of sea breeze and the warmth of sage bring soothing companionship to the transition. It does not rush change, but makes the repair process soft.",

  // 63. Swords 6 C (ID 44)
  "You are smoothly navigating an emotional difficulty, moving with scars towards a calmer shore. Guerlain’s Spiritueuse Double Vanille accompanies this healing journey—the sanctity of vanilla and the mellowness of rum bring soothing companionship to the transition. It does not rush change, but fills the repair process with warmth.",

  // 64. Swords 6 D (ID 26)
  "You are smoothly navigating an emotional difficulty, moving with scars towards a calmer shore. Jo Malone’s Wood Sage & Sea Salt accompanies this healing journey—the freshness of sea breeze and the warmth of sage bring soothing companionship to the transition. It does not rush change, but makes the repair process soft and natural.",

  // 65. Swords 7 A (ID 6)
  "You face challenges with wit and strategy, solving problems in unconventional ways. Goutal Paris’ Rose Pompon echoes this flexible wisdom—the playfulness of blackcurrant and the slight spice of pink pepper make the rose appear light and clever. It advocates not direct confrontation, but opening new possibilities with ingenuity.",

  // 66. Swords 7 B (ID 35)
  "You face challenges with wit and strategy, opening situations in non-traditional ways. Le Labo’s Thé Noir 29 echoes this flexible wisdom—the richness of black tea and the complexity of tobacco show multifacetedness in the sweetness of fig. It proves: sometimes the detour is more effective than the direct hit.",

  // 67. Swords 7 C (ID 41)
  "You face challenges with wit and strategy, opening situations in non-traditional ways. Kilian’s Intoxicated echoes this flexible wisdom—the intensity of coffee and the spice of cardamom reveal a wisdom that doesn't play by the rules. It proves: sometimes the detour is more effective than the direct hit.",

  // 68. Swords 7 D (ID 74)
  "You face challenges with wit and strategy, opening situations in non-traditional ways. Diptyque’s Eau des Sens echoes this flexible wisdom—the sharpness of bitter orange and the greenness of juniper berry show multifacetedness under the harmony of orange blossom. It proves: sometimes the detour is more effective than the direct hit.",

  // 69. Swords 8 A (ID 18)
  "You are bound by self-limiting thoughts, feeling helpless yet unaware the cage is an illusion. Creed’s Love in White reflects this state with pure radiance—holy orange blossom and magnolia are like moonlight penetrating the fog. It does not break the shackles, but lets you see clear: the key has always been in your hand.",

  // 70. Swords 8 B (ID 37)
  "You are bound by self-limiting thoughts, unaware the cage is an illusion. Tom Ford’s Ombré Leather responds to this plight with its uninhibited essence—the freedom of leather and the depth of wood break invisible shackles. It awakens you: true liberation begins with the awakening of consciousness.",

  // 71. Swords 8 C (ID 53)
  "You are bound by self-limiting thoughts, unaware the cage is an illusion. Xerjoff’s Lira responds to this plight with its sweet essence—the tempting scent of caramel lemon cake reminds you the world is full of beautiful possibilities. It awakens you: true liberation begins with stepping out of self-limitation.",

  // 72. Swords 8 D (ID 73)
  "You are bound by self-limiting thoughts, unaware the cage is an illusion. Tom Ford’s Sole di Positano responds to this plight with its bright essence—the sunny scent of citrus and the cleanliness of orange blossom break invisible shackles. It awakens you: true liberation begins with stepping out of self-limitation.",

  // 73. Swords 9 A (ID 7)
  "You are tormented by anxiety and fear in the dead of night, negative thoughts flooding in. Aesop’s Rozu understands this mental suffering—the heaviness of smoky wood and leather is like a lingering nightmare. It does not offer comfort easily, but accompanies you to face the darkness, until dawn comes.",

  // 74. Swords 9 B (ID 23)
  "You are troubled by anxiety in the dead of night, negative thoughts flooding in. Maison Martin Margiela’s By the Fireplace dispels this fear—the sweet scent of roasted chestnuts and the warmth of the fire light up the dark corners of the heart. It makes no promises, but fights the void of fear with tangible warmth.",

  // 75. Swords 9 C (ID 43)
  "You are troubled by anxiety in the dead of night, negative thoughts flooding in. Sol de Janeiro’s Cheirosa '62 dispels this fear—the lively sweetness of pistachio and almond, with the sunny scent of salted caramel, light up the dark corners of the heart. It fights the void of fear with pure happiness.",

  // 76. Swords 9 D (ID 61)
  "You are tormented by anxiety and fear in the dead of night, negative thoughts flooding in. Byredo’s Blanche dispels this fear with absolute purity—flawless white aldehydes and musk light up the dark corners of the heart. It makes no promises, but fights the void of fear with pure light.",

  // 77. Swords 10 A (ID 1)
  "You are experiencing a complete ending; old patterns have been uprooted. Diptyque’s L'Ombre dans L'Eau resonates with this destructive conclusion—the intense greenery of blackcurrant leaves suppresses everything, like a story coming to an abrupt halt. It promises no rebirth, but implies: only a complete end can birth a new beginning.",

  // 78. Swords 10 B (ID 21)
  "You are experiencing a complete ending; old patterns have been uprooted. Le Labo’s Santal 33 resonates with this destructive finish—the stillness of sandalwood and the tenacity of leather maintain final dignity in the ruins. It witnesses the end of a cycle, reserving space for the new.",

  // 79. Swords 10 C (ID 42)
  "You are experiencing a complete ending; old patterns have been uprooted. Maison Francis Kurkdjian’s Grand Soir resonates with this destructive finish—the splendor of amber and the richness of vanilla maintain final dignity at the end. It witnesses the end of a cycle, reserving space for the new.",

  // 80. Swords 10 D (ID 80)
  "You are experiencing a complete ending; old patterns have been uprooted. Le Labo’s Baie 19 resonates with this destructive finish—the coldness of mineral after rain and the scent of wet earth maintain final truth in the ruins. It witnesses the end of a cycle, reserving pure space for the new."
];

async function main() {
    const sourcePath = path.join(__dirname, '../batch_3_source.json');
    if (!fs.existsSync(sourcePath)) {
        console.error('Batch 3 source file not found');
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

    const outputPath = path.join(__dirname, '../perfume_translations_batch_new_3.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
    console.log(`Successfully generated ${outputPath} with ${mergedData.length} items.`);
}

main();
