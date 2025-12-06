
import * as fs from 'fs';
import * as path from 'path';

const files = [
    '../missing_perfume_data.json',
    'perfume_data_en.json', // In scripts dir
    '../perfume_translations_batch_1.json',
    '../perfume_translations_batch_2.json',
    '../perfume_translations_batch_3.json',
    '../perfume_translations_batch_4.json',
    '../assets/excel_files/perfume_translations_final.json'
];

const idNameMap = new Map<number, string>();
const idDescMap = new Map<number, string>();
const nameDescMap = new Map<string, string>();

const normalize = (s: string) => {
        if (!s) return '';
        return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
};

files.forEach(f => {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
        try {
            console.log(`Loading ${f}...`);
            const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    // Extract ID -> Name
                    const name = item.product || item.product_name || item.name;
                    if (item.id && name) {
                        idNameMap.set(item.id, name);
                    }
                    
                    // Extract ID -> Desc
                     const desc = item.description_en || item.desc_en;
                     if (item.id && desc) {
                         idDescMap.set(item.id, desc);
                     }
                     
                     // Extract Name -> Desc (Direct)
                     if (name && desc) {
                         nameDescMap.set(normalize(name), desc);
                     }
                });
            }
        } catch (e) {
            console.log(`Error reading ${f}: ${e.message}`);
        }
    } else {
        console.log(`Skipping ${f} (not found)`);
    }
});

console.log(`\nMap Stats:`);
console.log(`ID->Name: ${idNameMap.size}`);
console.log(`ID->Desc: ${idDescMap.size}`);
console.log(`Name->Desc (Direct): ${nameDescMap.size}`);

// Consolidate
idDescMap.forEach((desc, id) => {
    const name = idNameMap.get(id);
    if (name) {
        nameDescMap.set(normalize(name), desc);
    }
});

console.log(`Name->Desc (Consolidated): ${nameDescMap.size}`);

// Dump "Bluebell" keys
console.log('\nKeys containing "bluebell":');
for (const k of nameDescMap.keys()) {
    if (k.includes('bluebell')) console.log(`- ${k}`);
}

// Search Values
console.log('\nValues containing "passant":');
idDescMap.forEach((v, k) => {
    if (v.toLowerCase().includes('passant')) {
        console.log(`ID ${k}: ${v.substring(0, 50)}...`);
    }
});

// Check specific target
const target = 'vanilleabricot';
console.log(`\nChecking "${target}":`);
if (nameDescMap.has(target)) {
    console.log(`FOUND!`);
    console.log(nameDescMap.get(target)?.substring(0, 100) + '...');
} else {
    console.log(`NOT FOUND.`);
    // Debug Vanille ID if possible
    // Only if we know ID? User suspected ID 151
    if (idDescMap.has(151)) console.log(`ID 151 Desc: ${idDescMap.get(151)?.substring(0,50)}`);
    if (idNameMap.has(151)) console.log(`ID 151 Name: ${idNameMap.get(151)}`);
}
