# SPARQL Endpoint - Camera dei Deputati

**Source:** https://dati.camera.it/sparql

## Endpoint Information

- **Service URL:** `http://dati.camera.it/sparql`
- **Server:** Virtuoso version 07.10.3207 on Linux (OpenLink Software)

## Supported Formats

The endpoint supports multiple output formats:
- RDF/XML
- Turtle
- N-Triples
- N3
- RDFa
- SPARQL Results XML
- SPARQL Results JSON
- SPARQL Results CSV

## Default Example Query

```sparql
SELECT DISTINCT ?o
WHERE {
  [] a ?o
}
LIMIT 100
```

**Purpose:** This query retrieves distinct RDF types (classes) used in the dataset, limiting results to 100 rows.

## Notes

The SPARQL endpoint uses Virtuoso as the triple store and query engine. It provides a web-based query editor interface for testing queries directly in the browser.
