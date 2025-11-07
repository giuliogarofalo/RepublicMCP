/**
 * Test script to verify SPARQL queries work correctly
 * Run with: npm run dev examples/test-queries.ts
 */

import { cameraClient } from "../src/sparql/client.js";
import { QueryBuilder } from "../src/sparql/queries.js";

async function testQueries() {
  console.log("=== Testing RepublicMCP SPARQL Queries ===\n");

  try {
    // Test 1: Get current deputies with surname filter
    console.log("1. Testing: Get deputies with surname 'Meloni'");
    const deputiesQuery = QueryBuilder.getCurrentDeputies({ surname: "Meloni" });
    console.log("Query:", deputiesQuery.substring(0, 200) + "...\n");

    const deputiesResult = await cameraClient.select(deputiesQuery);
    console.log("Results:", deputiesResult.results.bindings.length, "deputies found");
    if (deputiesResult.results.bindings.length > 0) {
      const first = deputiesResult.results.bindings[0];
      console.log("First result:", {
        nome: first.nome?.value,
        cognome: first.cognome?.value,
        gruppo: first.nomeGruppo?.value,
      });
    }
    console.log("\n---\n");

    // Test 2: Get parliamentary groups
    console.log("2. Testing: Get parliamentary groups");
    const groupsQuery = QueryBuilder.getParliamentaryGroups();
    const groupsResult = await cameraClient.select(groupsQuery);
    console.log("Results:", groupsResult.results.bindings.length, "groups found");
    if (groupsResult.results.bindings.length > 0) {
      groupsResult.results.bindings.slice(0, 3).forEach((group) => {
        console.log("-", group.nomeUfficiale?.value, `(${group.sigla?.value})`);
      });
    }
    console.log("\n---\n");

    // Test 3: Search acts
    console.log("3. Testing: Search acts with keyword 'bilancio'");
    const actsQuery = QueryBuilder.searchActs({ title: "bilancio", limit: 5 });
    const actsResult = await cameraClient.select(actsQuery);
    console.log("Results:", actsResult.results.bindings.length, "acts found");
    if (actsResult.results.bindings.length > 0) {
      const first = actsResult.results.bindings[0];
      console.log("First result:", {
        numero: first.numero?.value,
        titolo: first.titolo?.value.substring(0, 80) + "...",
        presentazione: first.presentazione?.value,
      });
    }
    console.log("\n---\n");

    // Test 4: Get recent votings
    console.log("4. Testing: Get recent votings");
    const votingsQuery = QueryBuilder.getVotings({ limit: 5 });
    const votingsResult = await cameraClient.select(votingsQuery);
    console.log("Results:", votingsResult.results.bindings.length, "votings found");
    if (votingsResult.results.bindings.length > 0) {
      const first = votingsResult.results.bindings[0];
      console.log("First result:", {
        data: first.data?.value,
        favorevoli: first.favorevoli?.value,
        contrari: first.contrari?.value,
        astenuti: first.astenuti?.value,
      });
    }
    console.log("\n---\n");

    // Test 5: Get governments
    console.log("5. Testing: Get governments");
    const governmentsQuery = QueryBuilder.getGovernments();
    const governmentsResult = await cameraClient.select(governmentsQuery);
    console.log("Results:", governmentsResult.results.bindings.length, "governments found");
    if (governmentsResult.results.bindings.length > 0) {
      governmentsResult.results.bindings.slice(0, 5).forEach((gov) => {
        console.log("-", gov.nome?.value, `(${gov.startDate?.value})`);
      });
    }
    console.log("\n---\n");

    console.log("✓ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
testQueries();
