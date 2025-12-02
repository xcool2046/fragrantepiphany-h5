"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function bootstrap() {
    const filePath = path.join(__dirname, '../../assets/excel_files/事业正式.xlsx');
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const output = [];
    for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!row || row.length < 5)
            continue;
        const rawName = String(row[0] || '').trim();
        if (!rawName || rawName === 'name')
            continue;
        // Identify card (simplified logic for dump)
        let cardName = rawName; // Use raw name for now, or match if needed.
        // Better to match to ensure we have valid keys.
        // ... (Match logic same as seed) ...
        const MAJORS = [
            'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
            'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
            'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
            'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
            'Judgement', 'The World'
        ];
        const SUITS = ['Swords', 'Pentacles', 'Wands', 'Cups'];
        const RANKS = [
            'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Page', 'Knight', 'Queen', 'King'
        ];
        let matchedName;
        for (const name of MAJORS) {
            if (rawName.toLowerCase().startsWith(name.toLowerCase())) {
                matchedName = name;
                break;
            }
        }
        if (!matchedName) {
            for (const suit of SUITS) {
                for (const rank of RANKS) {
                    const name = `${rank} of ${suit}`;
                    if (rawName.toLowerCase().startsWith(name.toLowerCase())) {
                        matchedName = name;
                        break;
                    }
                }
                if (matchedName)
                    break;
            }
        }
        if (matchedName) {
            output.push({
                card: matchedName,
                past: row[2],
                present: row[3],
                future: row[4],
                sentence: row[5]
            });
        }
    }
    console.log(JSON.stringify(output, null, 2));
}
bootstrap();
