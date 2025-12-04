
import * as jwt from 'jsonwebtoken';
import * as http from 'http';

const secret = 'tarot-secret-key-2024';
const token = jwt.sign({ sub: 1, username: 'admin' }, secret);

async function checkApi() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/perfumes?keyword=Castile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  console.log(`Fetching http://${options.hostname}:${options.port}${options.path}...`);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const json = JSON.parse(data);
          const items = json.items;
          
          if (items && items.length > 0) {
            const castile = items.find((p: any) => p.product_name === 'Castile');
            if (castile) {
              console.log('API Perfume Tags (ZH):', JSON.stringify(castile.tags));
              console.log('API Perfume Tags (EN):', JSON.stringify(castile.tags_en));
            } else {
              console.log('Castile not found in search results');
              console.log('Items found:', items.map((p: any) => p.product_name));
            }
          } else {
            console.log('No items found');
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      } else {
        console.error(`Error: ${res.statusCode} ${res.statusMessage}`);
        console.error(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

checkApi();
