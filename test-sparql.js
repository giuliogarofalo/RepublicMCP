#!/usr/bin/env node

/**
 * Test script to verify SPARQL endpoint connection
 */

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.camera.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

// Simple test query - just get 5 deputies
const testQuery = `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?deputato ?cognome ?nome
WHERE {
  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    foaf:surname ?cognome;
    foaf:firstName ?nome.
}
ORDER BY ?cognome
LIMIT 5
`;

console.log('🔍 Testing SPARQL endpoint connection...\n');
console.log('Query:');
console.log(testQuery);
console.log('\n⏳ Executing...\n');

try {
  const stream = await client.query.select(testQuery);

  let count = 0;
  for await (const row of stream) {
    count++;
    const cognome = row.cognome?.value || 'N/A';
    const nome = row.nome?.value || 'N/A';
    const deputato = row.deputato?.value || 'N/A';

    console.log(`${count}. ${cognome} ${nome}`);
    console.log(`   URI: ${deputato}\n`);
  }

  if (count === 0) {
    console.log('❌ No results returned!');
    console.log('This might indicate:');
    console.log('- Endpoint is down');
    console.log('- Query syntax is incorrect');
    console.log('- Data structure has changed');
  } else {
    console.log(`✅ Success! Found ${count} deputies`);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:');
  console.error(error);
}
