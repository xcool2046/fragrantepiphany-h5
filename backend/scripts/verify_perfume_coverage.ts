
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Card } from '../src/entities/card.entity';
import { Perfume } from '../src/entities/perfume.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const cardRepo = dataSource.getRepository(Card);
  const perfumeRepo = dataSource.getRepository(Perfume);

  const cards = await cardRepo.find();
  const perfumes = await perfumeRepo.find();

  console.log(`Total Cards: ${cards.length}`);
  console.log(`Total Perfumes: ${perfumes.length}`);

  const cardIdsWithPerfume = new Set(perfumes.map(p => p.card_id));
  const cardsWithoutPerfume = cards.filter(c => !cardIdsWithPerfume.has(c.id));

  console.log(`Cards with Perfume: ${cardIdsWithPerfume.size}`);
  console.log(`Cards WITHOUT Perfume: ${cardsWithoutPerfume.length}`);

  if (cardsWithoutPerfume.length > 0) {
    console.log('IDs of cards without perfume:', cardsWithoutPerfume.map(c => c.id).join(', '));
  } else {
    console.log('All cards have at least one perfume associated!');
  }

  console.log('--- Available Perfumes (First 5) ---');
  perfumes.slice(0, 5).forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.product_name}, CardID: ${p.card_id}`);
  });

  // Check JSON file coverage
  const fs = require('fs');
  const path = require('path');
  const jsonPath = path.join(__dirname, '../src/migrations/perfumes_data.json');
  const excelPath = '/home/projects/h5/backend/assets/perfume.xlsx';
  
  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonCardNames = new Set(jsonData.map((item: any) => item.card_name));
    console.log(`\nJSON File Entries: ${jsonData.length}`);
    console.log(`Unique Card Names in JSON: ${jsonCardNames.size}`);
    
    const cards = await cardRepo.find();
    const missingInJson = cards.filter(c => !jsonCardNames.has(c.name_zh));
    
    if (missingInJson.length > 0) {
      console.log(`Cards missing in JSON source (${missingInJson.length}):`);
      // console.log(missingInJson.map(c => c.name_zh).join(', '));
    } else {
      console.log('JSON source covers all cards!');
    }

    // Check Excel file coverage
    if (fs.existsSync(excelPath)) {
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        
        if (excelData.length > 0) {
            console.log('First row keys:', Object.keys(excelData[0]));
            console.log('First 10 rows data:', JSON.stringify(excelData.slice(0, 10), null, 2));
        }

        const excelCardNames = new Set(excelData.map((item: any) => item.card_name || item['牌名'] || item['Card Name'] || item['card name'])); // Try different column names
        console.log(`\nExcel File Entries: ${excelData.length}`);
        console.log(`Unique Card Names in Excel: ${excelCardNames.size}`);

        const missingInExcel = cards.filter(c => !excelCardNames.has(c.name_zh));
         if (missingInExcel.length > 0) {
            console.log(`Cards missing in Excel source (${missingInExcel.length}):`);
            console.log(missingInExcel.map(c => c.name_zh).join(', '));
        } else {
            console.log('Excel source covers all cards!');
        }

        // Check if Excel covers what JSON is missing
        const coveredByExcel = missingInJson.filter(c => excelCardNames.has(c.name_zh));
        console.log(`\nMissing cards found in Excel: ${coveredByExcel.length}`);
        if (coveredByExcel.length > 0) {
            console.log(coveredByExcel.map(c => c.name_zh).join(', '));
        }

    } else {
        console.log(`\nExcel file not found at ${excelPath}`);
    }

  } else {
    console.log('perfumes_data.json not found!');
  }

  await app.close();
}

bootstrap();
