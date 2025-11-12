#!/usr/bin/env node

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.camera.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

// Test query for Salvini
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

  FILTER(REGEX(?cognome, 'SALVINI', 'i'))
}
ORDER BY ?cognome ?nome
LIMIT 100
`;

console.log('🔍 Testing query for SALVINI...\n');
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
    const genere = row.genere?.value || 'N/A';
    const deputato = row.deputato?.value || 'N/A';

    console.log(`${count}. ${cognome} ${nome} (${genere})`);
    console.log(`   URI: ${deputato}\n`);
  }

  if (count === 0) {
    console.log('❌ No results - SALVINI not found in XIX legislature!');
    console.log('\nLet me try without MINUS clause...');

    const simpleQuery = `
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?deputato ?cognome ?nome
WHERE {
  ?deputato a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    foaf:surname ?cognome;
    foaf:firstName ?nome.

  FILTER(REGEX(?cognome, 'SALVINI', 'i'))
}
`;

    const stream2 = await client.query.select(simpleQuery);
    let count2 = 0;
    for await (const row of stream2) {
      count2++;
      console.log(`${count2}. ${row.cognome?.value} ${row.nome?.value}`);
    }

    if (count2 === 0) {
      console.log('Still no results - Salvini not in XIX legislature');
    } else {
      console.log(`\n✅ Found ${count2} result(s) WITHOUT mandate check`);
      console.log('This means Salvini exists but mandate ended!');
    }
  } else {
    console.log(`✅ Success! Found ${count} result(s)`);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
