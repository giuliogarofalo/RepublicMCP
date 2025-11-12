# SPARQL Query Examples - Camera dei Deputati

Questa raccolta di query SPARQL può essere utilizzata per interrogare i dati aperti della Camera dei Deputati.

## Query Base

### 1. Ottenere tutte le classi disponibili

```sparql
SELECT DISTINCT ?class
WHERE {
  [] a ?class
}
LIMIT 100
```

### 2. Contare le risorse per tipo

```sparql
SELECT ?type (COUNT(?s) AS ?count)
WHERE {
  ?s a ?type
}
GROUP BY ?type
ORDER BY DESC(?count)
LIMIT 50
```

## Query sui Deputati

### 3. Lista deputati della legislatura corrente

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?deputato ?nome ?cognome
WHERE {
  ?deputato a ocd:deputato ;
            ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> ;
            foaf:firstName ?nome ;
            foaf:surname ?cognome .
}
ORDER BY ?cognome ?nome
```

### 4. Deputati per gruppo parlamentare

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?gruppo ?nomeGruppo ?deputato ?nome ?cognome
WHERE {
  ?deputato a ocd:deputato ;
            ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> ;
            ocd:aderisce ?adesione ;
            foaf:firstName ?nome ;
            foaf:surname ?cognome .

  ?adesione ocd:rif_gruppoParlamentare ?gruppo .
  ?gruppo ocd:denominazioneUfficiale ?nomeGruppo .
}
ORDER BY ?nomeGruppo ?cognome ?nome
```

### 5. Biografia di un deputato specifico

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>

SELECT ?deputato ?nome ?cognome ?dataNascita ?luogoNascita
WHERE {
  ?deputato a ocd:deputato ;
            foaf:firstName ?nome ;
            foaf:surname ?cognome .

  OPTIONAL { ?deputato bio:birth ?nascita .
             ?nascita bio:date ?dataNascita .
             ?nascita bio:place ?luogoNascita . }

  FILTER(CONTAINS(LCASE(?cognome), "meloni"))
}
```

## Query sugli Atti Parlamentari

### 6. Ultimi atti presentati

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?atto ?titolo ?data
WHERE {
  ?atto a ocd:atto ;
        dc:title ?titolo ;
        dc:date ?data .
}
ORDER BY DESC(?data)
LIMIT 20
```

### 7. Atti per legislatura e tipo

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?tipoAtto (COUNT(?atto) AS ?numeroAtti)
WHERE {
  ?atto a ocd:atto ;
        ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> ;
        dc:type ?tipoAtto .
}
GROUP BY ?tipoAtto
ORDER BY DESC(?numeroAtti)
```

### 8. Atti con stato iter

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?atto ?titolo ?stato ?concluso
WHERE {
  ?atto a ocd:atto ;
        dc:title ?titolo ;
        ocd:statoIter ?stato .

  OPTIONAL { ?atto ocd:concluso ?concluso }
}
ORDER BY DESC(?stato)
LIMIT 50
```

## Query sulle Votazioni

### 9. Votazioni recenti

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?votazione ?descrizione ?favorevoli ?contrari ?astenuti ?data
WHERE {
  ?votazione a ocd:votazione ;
             dc:description ?descrizione ;
             ocd:favorevoli ?favorevoli ;
             ocd:contrari ?contrari ;
             ocd:astenuti ?astenuti ;
             dc:date ?data .
}
ORDER BY DESC(?data)
LIMIT 20
```

### 10. Votazioni su un atto specifico

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?votazione ?descrizione ?favorevoli ?contrari ?astenuti
WHERE {
  ?votazione a ocd:votazione ;
             ocd:rif_atto ?atto ;
             dc:description ?descrizione ;
             ocd:favorevoli ?favorevoli ;
             ocd:contrari ?contrari ;
             ocd:astenuti ?astenuti .

  FILTER(CONTAINS(STR(?atto), "ac19_1234"))
}
ORDER BY ?votazione
```

## Query sui Governi

### 11. Lista governi della Repubblica

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?governo ?nome ?dataInizio ?dataFine
WHERE {
  ?governo a ocd:governo ;
           dc:title ?nome ;
           ocd:startDate ?dataInizio .

  OPTIONAL { ?governo ocd:endDate ?dataFine }
}
ORDER BY DESC(?dataInizio)
```

### 12. Membri di un governo

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?persona ?nome ?cognome ?incarico
WHERE {
  ?membro a ocd:membroGoverno ;
          ocd:rif_governo ?governo ;
          ocd:rif_persona ?persona ;
          ocd:incarico ?incarico .

  ?persona foaf:firstName ?nome ;
           foaf:surname ?cognome .

  FILTER(CONTAINS(STR(?governo), "governo_meloni"))
}
ORDER BY ?cognome ?nome
```

## Query sugli Organi Parlamentari

### 13. Commissioni permanenti

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?organo ?nome ?tipo
WHERE {
  ?organo a ocd:organo ;
          dc:title ?nome ;
          ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> .

  OPTIONAL { ?organo dc:type ?tipo }

  FILTER(CONTAINS(LCASE(?nome), "commissione"))
}
ORDER BY ?nome
```

### 14. Membri di una commissione

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?deputato ?nome ?cognome ?ruolo
WHERE {
  ?appartenenza ocd:rif_organo ?organo ;
                ocd:rif_deputato ?deputato .

  ?deputato foaf:firstName ?nome ;
            foaf:surname ?cognome .

  OPTIONAL { ?appartenenza ocd:ruolo ?ruolo }

  FILTER(CONTAINS(STR(?organo), "commissione_affari_costituzionali"))
}
ORDER BY ?cognome ?nome
```

## Query Complesse

### 15. Carriera parlamentare di un deputato

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?legislatura ?gruppo ?organo ?ruolo ?dataInizio ?dataFine
WHERE {
  ?persona foaf:surname "Meloni" ;
           foaf:firstName "Giorgia" .

  ?deputato ocd:rif_persona ?persona ;
            ocd:rif_leg ?legislatura .

  OPTIONAL {
    ?deputato ocd:aderisce ?adesione .
    ?adesione ocd:rif_gruppoParlamentare ?gruppo ;
              ocd:startDate ?dataInizio ;
              ocd:endDate ?dataFine .
  }

  OPTIONAL {
    ?appartenenza ocd:rif_deputato ?deputato ;
                  ocd:rif_organo ?organo ;
                  ocd:ruolo ?ruolo .
  }
}
ORDER BY ?legislatura ?dataInizio
```

### 16. Statistiche votazioni per legislatura

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>

SELECT ?legislatura
       (COUNT(?votazione) AS ?totaleVotazioni)
       (AVG(?favorevoli) AS ?mediaFavorevoli)
       (AVG(?contrari) AS ?mediaContrari)
       (AVG(?astenuti) AS ?mediaAstenuti)
WHERE {
  ?votazione a ocd:votazione ;
             ocd:rif_leg ?legislatura ;
             ocd:favorevoli ?favorevoli ;
             ocd:contrari ?contrari ;
             ocd:astenuti ?astenuti .
}
GROUP BY ?legislatura
ORDER BY ?legislatura
```

## Note Tecniche

### Prefissi Comuni

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
PREFIX bibo: <http://purl.org/ontology/bibo/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX org: <http://www.w3.org/ns/org#>
```

### Endpoint

Tutte queste query possono essere eseguite su: `https://dati.camera.it/sparql`

### Formato Date

Le date nell'ontologia OCD utilizzano il formato `YYYYMMDD` (es: `20231015` per 15 ottobre 2023).

### Legislature

Le legislature della Repubblica sono identificate da URI come:
- `http://dati.camera.it/ocd/legislatura.rdf/repubblica_19` (XIX legislatura, corrente)
- `http://dati.camera.it/ocd/legislatura.rdf/repubblica_18` (XVIII legislatura)
- etc.
