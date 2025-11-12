#!/usr/bin/env node

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.camera.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

// Test query for Meloni (we know she exists)
const testQuery = `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?deputato ?cognome ?nome ?genere
WHERE {
  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato;
    foaf:surname ?cognome;
    foaf:gender ?genere;
    foaf:firstName ?nome.

  ?mandato ocd:rif_elezione ?elezione.
  MINUS{?mandato ocd:endDate ?fineMandato.}

  FILTER(REGEX(?cognome, 'MELONI', 'i'))
}
ORDER BY ?cognome ?nome
LIMIT 100
`;

console.log('🔍 Testing query for MELONI...\n');
console.log('⏳ Executing...\n');

try {
  const stream = await client.query.select(testQuery);

  let count = 0;
  for await (const row of stream) {
    count++;
    const cognome = row.cognome?.value || 'N/A';
    const nome = row.nome?.value || 'N/A';
    const genere = row.genere?.value || 'N/A';
    const deputato = row.deputato?.value || 'N/A';

    console.log(`${count}. ${cognome} ${nome} (${genere})`);
    console.log(`   URI: ${deputato}\n`);
  }

  if (count === 0) {
    console.log('❌ No results - MELONI not found!');
  } else {
    console.log(`✅ Success! Found ${count} result(s) for MELONI`);
    console.log('\n🎉 Query structure is CORRECT!');
    console.log('The system is working as expected.');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
