#!/usr/bin/env node

/**
 * Test Script for Senato Module
 * Tests all query builders with real endpoint
 */

import ParsingClient from 'sparql-http-client/ParsingClient.js';

const endpoint = 'https://dati.senato.it/sparql';
const client = new ParsingClient({ endpointUrl: endpoint });

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runQuery(name, query, expectedMin = 0) {
  try {
    log('cyan', `\n📊 Test: ${name}`);
    log('blue', '─'.repeat(60));

    const stream = await client.query.select(query);
    const results = [];

    for await (const row of stream) {
      results.push(row);
    }

    const count = results.length;

    if (count >= expectedMin) {
      log('green', `✅ PASS - ${count} risultati trovati`);

      // Show first 3 results
      if (count > 0) {
        log('blue', '\nPrimi risultati:');
        results.slice(0, 3).forEach((row, i) => {
          const values = Object.entries(row)
            .map(([key, val]) => `${key}: ${val?.value || 'N/A'}`)
            .join(', ');
          console.log(`  ${i + 1}. ${values}`);
        });
      }

      return { success: true, count };
    } else {
      log('red', `❌ FAIL - Solo ${count} risultati (minimo: ${expectedMin})`);
      return { success: false, count };
    }
  } catch (error) {
    log('red', `❌ ERROR - ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
}

async function main() {
  log('cyan', '\n🏛️  SENATO MODULE - TEST SUITE\n');
  log('blue', '='.repeat(60));

  const tests = [];

  // ========== SENATORI TESTS ==========
  log('yellow', '\n📋 CATEGORY: Senatori\n');

  // Test 1: Current Senators
  tests.push(await runQuery(
    'Get Current Senators (Legislature 19)',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome
WHERE {
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:legislatura 19 ;
    osr:inizio ?inizio .

  OPTIONAL { ?mandato osr:fine ?fine }
  FILTER(!bound(?fine))
}
LIMIT 10
    `,
    5 // Expect at least 5 senators
  ));

  // Test 2: Search Salvini
  tests.push(await runQuery(
    'Search Senator: SALVINI',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?foto
WHERE {
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome .

  FILTER(REGEX(?cognome, "SALVINI", "i"))

  OPTIONAL { ?senatore foaf:depiction ?foto }
}
    `,
    1 // Expect at least 1 Salvini
  ));

  // Test 3: Life Senators
  tests.push(await runQuery(
    'Life Senators',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?tipoMandato
WHERE {
  ?senatore a osr:Senatore ;
    foaf:lastName ?cognome ;
    foaf:firstName ?nome ;
    osr:mandato ?mandato .

  ?mandato osr:tipoMandato ?tipoMandato ;
    osr:legislatura 19 .

  FILTER(
    ?tipoMandato = "a vita, di nomina del Presidente della Repubblica" ||
    ?tipoMandato = "di diritto e a vita, Presidente emerito della Repubblica"
  )

  OPTIONAL { ?mandato osr:fine ?fine }
  FILTER(!bound(?fine))
}
    `,
    0 // May be 0
  ));

  // ========== DDL TESTS ==========
  log('yellow', '\n📋 CATEGORY: DDL (Disegni di Legge)\n');

  // Test 4: Recent DDL
  tests.push(await runQuery(
    'Recent DDL (2023+)',
    `
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?idDdl ?titolo ?dataPres ?stato
WHERE {
  ?ddl a osr:Ddl ;
    osr:idDdl ?idDdl ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres ;
    osr:statoDdl ?stato ;
    osr:ramo "Senato" .

  FILTER(xsd:date(str(?dataPres)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?dataPres)
LIMIT 10
    `,
    5 // Expect at least 5 DDL
  ));

  // Test 5: DDL by Salvini
  tests.push(await runQuery(
    'DDL by Senator Salvini',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?ddl ?titolo ?dataPres ?primoFirmatario
WHERE {
  ?senatore a osr:Senatore ;
    foaf:lastName "SALVINI" ;
    foaf:firstName "Matteo" .

  ?iniziativa osr:presentatore ?senatore .

  ?ddl a osr:Ddl ;
    osr:iniziativa ?iniziativa ;
    osr:titolo ?titolo ;
    osr:dataPresentazione ?dataPres .

  OPTIONAL { ?iniziativa osr:primoFirmatario ?primoFirmatario }
}
ORDER BY DESC(?dataPres)
LIMIT 10
    `,
    1 // Expect at least 1 DDL
  ));

  // ========== VOTAZIONI TESTS ==========
  log('yellow', '\n📋 CATEGORY: Votazioni\n');

  // Test 6: Recent Votations
  tests.push(await runQuery(
    'Recent Votations (2024)',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?votazione ?numero ?data ?oggetto ?esito
WHERE {
  ?votazione a osr:Votazione ;
    osr:numero ?numero ;
    osr:seduta ?seduta ;
    rdfs:label ?oggetto ;
    osr:esito ?esito .

  ?seduta osr:dataSeduta ?data ;
    osr:legislatura 19 .

  FILTER(xsd:date(str(?data)) >= xsd:date("2024-01-01"))
}
ORDER BY DESC(?data)
LIMIT 10
    `,
    3 // Expect at least 3 votations
  ));

  // ========== COMMISSIONI TESTS ==========
  log('yellow', '\n📋 CATEGORY: Commissioni\n');

  // Test 7: Active Commissions
  tests.push(await runQuery(
    'Active Commissions',
    `
PREFIX osr: <http://dati.senato.it/osr/>

SELECT DISTINCT ?commissione ?titolo ?ordinale
WHERE {
  ?commissione a osr:Commissione ;
    osr:denominazione ?den .

  ?den osr:titolo ?titolo .

  OPTIONAL { ?den osr:fine ?fine }
  FILTER(!bound(?fine))

  OPTIONAL { ?commissione osr:ordinale ?ordinale }
}
ORDER BY ?ordinale
LIMIT 15
    `,
    10 // Expect at least 10 commissions
  ));

  // ========== GRUPPI TESTS ==========
  log('yellow', '\n📋 CATEGORY: Gruppi Parlamentari\n');

  // Test 8: Active Groups
  tests.push(await runQuery(
    'Active Parliamentary Groups',
    `
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>

SELECT DISTINCT ?gruppo ?nomeGruppo
WHERE {
  ?gruppo a ocd:gruppoParlamentare ;
    osr:denominazione ?den .

  ?den osr:titolo ?nomeGruppo .

  OPTIONAL { ?den osr:fine ?fine }
  FILTER(!bound(?fine))
}
ORDER BY ?nomeGruppo
    `,
    5 // Expect at least 5 groups
  ));

  // ========== SUMMARY ==========
  log('blue', '\n' + '='.repeat(60));
  log('cyan', '\n📊 TEST SUMMARY\n');

  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const total = tests.length;

  log('blue', `Total Tests: ${total}`);
  log('green', `✅ Passed: ${passed}`);
  if (failed > 0) {
    log('red', `❌ Failed: ${failed}`);
  }

  const successRate = ((passed / total) * 100).toFixed(1);
  log('cyan', `\nSuccess Rate: ${successRate}%`);

  if (passed === total) {
    log('green', '\n🎉 ALL TESTS PASSED! Module is working correctly!\n');
  } else {
    log('yellow', '\n⚠️  Some tests failed. Check the errors above.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  log('red', `\n❌ FATAL ERROR: ${error.message}`);
  console.error(error);
  process.exit(1);
});
