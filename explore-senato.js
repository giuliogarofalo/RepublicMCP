#!/usr/bin/env node

/**
 * Esplora l'endpoint SPARQL del Senato per capire la struttura dati
 */

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.senato.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

console.log('🔍 Esplorando endpoint Senato...\n');
console.log('Endpoint:', endpoint);
console.log('');

// Test 1: Query base per capire la struttura
const exploreQuery = `
SELECT DISTINCT ?type (COUNT(?s) as ?count)
WHERE {
  ?s a ?type
}
GROUP BY ?type
ORDER BY DESC(?count)
LIMIT 20
`;

console.log('📊 Test 1: Tipi di entità disponibili\n');
console.log('Query:');
console.log(exploreQuery);
console.log('\n⏳ Executing...\n');

try {
  const stream = await client.query.select(exploreQuery);

  let count = 0;
  console.log('Tipi trovati:');
  console.log('─'.repeat(70));
  for await (const row of stream) {
    count++;
    const type = row.type?.value || 'N/A';
    const cnt = row.count?.value || '0';
    console.log(`${count.toString().padStart(2)}. ${type}`);
    console.log(`    Count: ${cnt}\n`);
  }

  if (count === 0) {
    console.log('❌ Nessun tipo trovato - endpoint potrebbe avere struttura diversa');
  } else {
    console.log(`✅ Trovati ${count} tipi di entità`);
  }

  // Test 2: Cerca senatori
  console.log('\n\n📊 Test 2: Cerca senatori\n');

  const senatoriQuery = `
  SELECT DISTINCT ?senatore ?nome ?cognome
  WHERE {
    ?senatore a ?tipo .
    OPTIONAL { ?senatore ?nomeProperty ?nome }
    OPTIONAL { ?senatore ?cognomeProperty ?cognome }
    FILTER(
      CONTAINS(STR(?tipo), "senatore") ||
      CONTAINS(STR(?tipo), "Senatore") ||
      CONTAINS(STR(?nomeProperty), "nome") ||
      CONTAINS(STR(?cognomeProperty), "cognome")
    )
  }
  LIMIT 10
  `;

  console.log('Query senatori:');
  console.log(senatoriQuery);
  console.log('\n⏳ Executing...\n');

  const stream2 = await client.query.select(senatoriQuery);
  let count2 = 0;

  for await (const row of stream2) {
    count2++;
    console.log(`${count2}. Senatore: ${row.senatore?.value || 'N/A'}`);
    console.log(`   Nome: ${row.nome?.value || 'N/A'}`);
    console.log(`   Cognome: ${row.cognome?.value || 'N/A'}\n`);
  }

  if (count2 === 0) {
    console.log('⚠️  Nessun senatore trovato con questa query');
    console.log('Bisogna esplorare l\'ontologia più in dettaglio\n');
  }

  // Test 3: Esplora predicati comuni
  console.log('\n📊 Test 3: Predicati più comuni\n');

  const predicatesQuery = `
  SELECT DISTINCT ?predicate (COUNT(?s) as ?count)
  WHERE {
    ?s ?predicate ?o
  }
  GROUP BY ?predicate
  ORDER BY DESC(?count)
  LIMIT 30
  `;

  const stream3 = await client.query.select(predicatesQuery);
  let count3 = 0;

  console.log('Predicati trovati:');
  console.log('─'.repeat(70));
  for await (const row of stream3) {
    count3++;
    const pred = row.predicate?.value || 'N/A';
    const cnt = row.count?.value || '0';
    console.log(`${count3.toString().padStart(2)}. ${pred} (${cnt})`);
  }

  console.log(`\n✅ Trovati ${count3} predicati\n`);

} catch (error) {
  console.error('❌ Errore:', error.message);
  console.error('\nDettagli:');
  console.error(error);
}
