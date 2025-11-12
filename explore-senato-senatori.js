#!/usr/bin/env node

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.senato.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

console.log('🔍 Cercando senatori nell\'endpoint Senato...\n');

// L'ontologia del Senato usa osr: prefix
// Cerchiamo predicati specifici per senatori
const findSenatoriQuery = `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT DISTINCT ?senatore ?nome ?cognome
WHERE {
  # Cerchiamo entità che sono persone
  ?senatore a foaf:Person .

  # Con nome e cognome
  OPTIONAL { ?senatore foaf:firstName ?nome }
  OPTIONAL { ?senatore foaf:surname ?cognome }
  OPTIONAL { ?senatore foaf:name ?nomeCompleto }
}
LIMIT 20
`;

console.log('Query:');
console.log(findSenatoriQuery);
console.log('\n⏳ Executing...\n');

try {
  const stream = await client.query.select(findSenatoriQuery);

  let count = 0;
  for await (const row of stream) {
    count++;
    const senatore = row.senatore?.value || 'N/A';
    const nome = row.nome?.value || 'N/A';
    const cognome = row.cognome?.value || 'N/A';
    const nomeCompleto = row.nomeCompleto?.value || '';

    console.log(`${count}. ${cognome} ${nome}${nomeCompleto ? ` (${nomeCompleto})` : ''}`);
    console.log(`   URI: ${senatore}\n`);
  }

  if (count > 0) {
    console.log(`✅ Trovati ${count} senatori!`);
    console.log('\nOra proviamo a cercare Salvini specificamente...\n');

    // Test con Salvini
    const salviniQuery = `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?nome ?cognome
WHERE {
  ?senatore a foaf:Person ;
    foaf:firstName ?nome ;
    foaf:surname ?cognome .

  FILTER(REGEX(?cognome, 'SALVINI', 'i'))
}
`;

    console.log('Query Salvini:');
    console.log(salviniQuery);
    console.log('\n⏳ Executing...\n');

    const stream2 = await client.query.select(salviniQuery);
    let count2 = 0;

    for await (const row of stream2) {
      count2++;
      console.log(`${count2}. ${row.cognome?.value} ${row.nome?.value}`);
      console.log(`   URI: ${row.senatore?.value}\n`);
    }

    if (count2 > 0) {
      console.log(`🎉 Salvini trovato! (${count2} risultati)`);
    } else {
      console.log('❌ Salvini non trovato con questa query');
    }

  } else {
    console.log('❌ Nessun senatore trovato');
    console.log('Proviamo query alternative...\n');

    // Query alternativa - cerca tutti i predicati usati con foaf:Person
    const predicatesQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?predicate (COUNT(?s) as ?count)
    WHERE {
      ?s a foaf:Person .
      ?s ?predicate ?o
    }
    GROUP BY ?predicate
    ORDER BY DESC(?count)
    LIMIT 30
    `;

    console.log('Query predicati foaf:Person:');
    console.log(predicatesQuery);
    console.log('\n⏳ Executing...\n');

    const stream3 = await client.query.select(predicatesQuery);
    let count3 = 0;

    for await (const row of stream3) {
      count3++;
      console.log(`${count3}. ${row.predicate?.value} (${row.count?.value})`);
    }

    console.log(`\n✅ Trovati ${count3} predicati per foaf:Person`);
  }

} catch (error) {
  console.error('❌ Errore:', error.message);
  console.error(error);
}
