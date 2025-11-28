import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCardCodes1764298000000 implements MigrationInterface {
  name = 'FixCardCodes1764298000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cards = [
      { id: 1, code: 'IMG_4773' }, { id: 2, code: 'IMG_4774' }, { id: 3, code: 'IMG_4775' }, { id: 4, code: 'IMG_4776' },
      { id: 5, code: 'IMG_4777' }, { id: 6, code: 'IMG_4778' }, { id: 7, code: 'IMG_4779' }, { id: 8, code: 'IMG_4780' },
      { id: 9, code: 'IMG_4781' }, { id: 10, code: 'IMG_4782' }, { id: 11, code: 'IMG_4783' }, { id: 12, code: 'IMG_4784' },
      { id: 13, code: 'IMG_4785' }, { id: 14, code: 'IMG_4786' }, { id: 15, code: 'IMG_4787' }, { id: 16, code: 'IMG_4788' },
      { id: 17, code: 'IMG_4789' }, { id: 18, code: 'IMG_4790' }, { id: 19, code: 'IMG_4791' }, { id: 20, code: 'IMG_4792' },
      { id: 21, code: 'IMG_4793' }, { id: 22, code: 'IMG_4794' }, { id: 23, code: 'IMG_4795' }, { id: 24, code: 'IMG_4796' },
      { id: 25, code: 'IMG_4797' }, { id: 26, code: 'IMG_4798' }, { id: 27, code: 'IMG_4799' }, { id: 28, code: 'IMG_4800' },
      { id: 29, code: 'IMG_4801' }, { id: 30, code: 'IMG_4802' }, { id: 31, code: 'IMG_4803' }, { id: 32, code: 'IMG_4804' },
      { id: 33, code: 'IMG_4805' }, { id: 34, code: 'IMG_4806' }, { id: 35, code: 'IMG_4807' }, { id: 36, code: 'IMG_4808' },
      { id: 37, code: 'IMG_4809' }, { id: 38, code: 'IMG_4810' }, { id: 39, code: 'IMG_4811' }, { id: 40, code: 'IMG_4812' },
      { id: 41, code: 'IMG_4813' }, { id: 42, code: 'IMG_4814' }, { id: 43, code: 'IMG_4815' }, { id: 44, code: 'IMG_4816' },
      { id: 45, code: 'IMG_4817' }, { id: 46, code: 'IMG_4818' }, { id: 47, code: 'IMG_4819' }, { id: 48, code: 'IMG_4820' },
      { id: 49, code: 'IMG_4821' }, { id: 50, code: 'IMG_4822' }, { id: 51, code: 'IMG_4823' }, { id: 52, code: 'IMG_4824' },
      { id: 53, code: 'IMG_4825' }, { id: 54, code: 'IMG_4826' }, { id: 55, code: 'IMG_4827' }, { id: 56, code: 'IMG_4828' },
      { id: 57, code: 'IMG_4829' }, { id: 58, code: 'IMG_4830' }, { id: 59, code: 'IMG_4831' }, { id: 60, code: 'IMG_4832' },
      { id: 61, code: 'IMG_4833' }, { id: 62, code: 'IMG_4834' }, { id: 63, code: 'IMG_4835' }, { id: 64, code: 'IMG_4836' },
      { id: 65, code: 'IMG_4837' }, { id: 66, code: 'IMG_4838' }, { id: 67, code: 'IMG_4839' }, { id: 68, code: 'IMG_4840' },
      { id: 69, code: 'IMG_4841' }, { id: 70, code: 'IMG_4842' }, { id: 71, code: 'IMG_4843' }, { id: 72, code: 'IMG_4844' },
      { id: 73, code: 'IMG_4845' }, { id: 74, code: 'IMG_4846' }, { id: 75, code: 'IMG_4847' }, { id: 76, code: 'IMG_4848' },
      { id: 77, code: 'IMG_4849' }, { id: 78, code: 'IMG_4850' },
    ];

    for (const card of cards) {
      const newCode = card.id.toString().padStart(2, '0');
      const newImageUrl = `/assets/cards/${newCode}.jpg`;
      
      // Update by ID to be safe, or by old code if ID is not reliable? 
      // Assuming IDs are 1-78 as per seed.
      await queryRunner.query(
        `UPDATE cards SET code = $1, image_url = $2 WHERE id = $3`,
        [newCode, newImageUrl, card.id]
      );
    }
    console.log('Updated 78 cards to new code format.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert logic if needed, but this is a fix-forward migration.
    // We can leave it empty or try to map back if strictly required.
  }
}
