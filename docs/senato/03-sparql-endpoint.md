# SPARQL Endpoint - Senato della Repubblica

**Source:** https://dati.senato.it/sparql

## Endpoint Information

- **Service URL:** `https://dati.senato.it/sparql`
- **Protocol:** SPARQL 1.1 Query Language
- **Access:** Public, no authentication required

## Supported Formats

The endpoint supports multiple output formats:
- **RDF/XML** - Standard RDF serialization
- **Turtle** - Terse RDF Triple Language
- **N-Triples** - Line-based RDF syntax
- **N3** - Notation3
- **JSON-LD** - JSON for Linked Data
- **SPARQL Results XML** - W3C standard
- **SPARQL Results JSON** - JSON format for results
- **CSV/TSV** - Tabular formats

## Query Editor

Il Senato fornisce un'interfaccia web-based per testare query SPARQL direttamente nel browser:
- **URL**: https://dati.senato.it/sparql
- **Features**: Syntax highlighting, auto-completion, formato output selezionabile

## Default Example Query

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT DISTINCT ?type (COUNT(?s) as ?count)
WHERE {
  ?s a ?type
}
GROUP BY ?type
ORDER BY DESC(?count)
LIMIT 20
```

**Purpose:** Questa query recupera i tipi RDF (classi) più usati nel dataset con il conteggio delle istanze, limitando i risultati a 20 righe ordinate per frequenza.

## Common Prefixes

Per semplificare le query, usa questi prefissi comuni:

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
```

## Query Limits and Performance

- **Timeout**: Le query hanno un timeout per prevenire overload del server
- **Best Practice**: Usa sempre `LIMIT` nelle query esplorative
- **Filtering**: Filtra per legislatura corrente (19) per query più veloci
- **Pagination**: Usa `OFFSET` e `LIMIT` per paginare risultati grandi

## Example Queries

### Test Connectivity
```sparql
SELECT (COUNT(*) as ?count)
WHERE {
  ?s ?p ?o
}
```

### List All Classes
```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?class ?label
WHERE {
  ?class a rdfs:Class .
  OPTIONAL { ?class rdfs:label ?label }
  FILTER(STRSTARTS(STR(?class), "http://dati.senato.it/osr/"))
}
ORDER BY ?class
```

### Count Senators by Legislature
```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?legislatura (COUNT(DISTINCT ?senatore) as ?numSenatori)
WHERE {
  ?senatore a osr:Senatore ;
            osr:mandato ?mandato .
  ?mandato osr:legislatura ?legislatura .
}
GROUP BY ?legislatura
ORDER BY DESC(?legislatura)
```

## Troubleshooting

### Query Too Slow
- Aggiungi `LIMIT 100` per testare
- Filtra per legislatura specifica: `?mandato osr:legislatura 19`
- Evita pattern aperti come `?s ?p ?o` senza filtri

### No Results
- Verifica i prefissi (osr: non ocd:)
- Controlla che usi `foaf:lastName` non `foaf:surname`
- Verifica che la legislatura sia un numero intero non URI

### Timeout Errors
- Semplifica la query rimuovendo `OPTIONAL` complessi
- Limita il range temporale
- Usa subquery per pre-filtrare

## API Access

Per accesso programmatico:

```bash
# cURL example
curl -X POST https://dati.senato.it/sparql \
  -H "Accept: application/sparql-results+json" \
  -H "Content-Type: application/sparql-query" \
  --data-binary @query.sparql
```

```python
# Python example with SPARQLWrapper
from SPARQLWrapper import SPARQLWrapper, JSON

sparql = SPARQLWrapper("https://dati.senato.it/sparql")
sparql.setQuery("""
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?senatore ?cognome ?nome
WHERE {
    ?senatore a osr:Senatore ;
        foaf:lastName ?cognome ;
        foaf:firstName ?nome .
}
LIMIT 10
""")
sparql.setReturnFormat(JSON)
results = sparql.query().convert()
```

## Notes

- L'endpoint SPARQL del Senato usa un triple store per le query
- Fornisce un'interfaccia web editor per testare query direttamente nel browser
- Supporta la maggior parte delle features SPARQL 1.1 standard
- I risultati sono cached per migliorare le performance di query frequenti

---

**Ultimo aggiornamento**: 2025-11-12
**Fonte**: https://dati.senato.it/sparql
