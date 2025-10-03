// Bulk import products from products-bulk.json to /api/products
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function importProducts() {
  const filePath = path.join(__dirname, 'products-bulk.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const product of products) {
    const res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      console.error(`Failed to import: ${product.name}`, await res.text());
    } else {
      console.log(`Imported: ${product.name}`);
    }
  }
  console.log('Bulk import complete.');
}

importProducts();
