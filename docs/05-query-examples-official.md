# Query SPARQL Ufficiali - Camera dei Deputati

Questi sono esempi di query SPARQL forniti direttamente dal sito della Camera dei Deputati.

## Prefissi Comuni

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
```

## Query sui Deputati

### 1. Tutti i deputati in carica nella XIX Legislatura con info e numero totale di mandati

```sparql
SELECT DISTINCT ?persona ?cognome ?nome ?info
?dataNascita ?luogoNascita ?genere
?collegio ?lista ?nomeGruppo COUNT(DISTINCT ?madatoCamera) as ?numeroMandati ?aggiornamento
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ## deputato
  ?d a ocd:deputato;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato.
  OPTIONAL{?d ocd:aderisce ?aderisce}
  OPTIONAL{?d dc:description ?info}

  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:firstName ?nome.
  OPTIONAL{
    ?persona bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      rdfs:label ?nato; ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

  ## mandato
  ?mandato ocd:rif_elezione ?elezione.
  MINUS{?mandato ocd:endDate ?fineMandato.}

  ## totale mandati
  ?persona ocd:rif_mandatoCamera ?madatoCamera.

  ## elezione
  OPTIONAL {?elezione dc:coverage ?collegio}
  OPTIONAL {?elezione ocd:lista ?lista}

  ## adesione a gruppo
  OPTIONAL {?aderisce ocd:rif_gruppoParlamentare ?gruppo}
  OPTIONAL {?aderisce rdfs:label ?nomeGruppo}
  MINUS{?aderisce ocd:endDate ?fineAdesione}
}
```

### 2. Deputati in carica con cognome, nome, info biografiche, collegio di elezione, gruppo di appartenenza, commissione di afferenza

```sparql
SELECT DISTINCT ?persona ?cognome ?nome
?dataNascita ?nato ?luogoNascita ?genere
?collegio ?nomeGruppo ?sigla ?commissione ?aggiornamento
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ## deputato
  ?d a ocd:deputato; ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato.

  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:firstName ?nome.
  OPTIONAL{
    ?persona bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      rdfs:label ?nato; ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

  ## mandato
  ?mandato ocd:rif_elezione ?elezione.
  MINUS{?mandato ocd:endDate ?fineMandato.}

  ## elezione
  ?elezione dc:coverage ?collegio.

  ## adesione a gruppo
  OPTIONAL{
    ?aderisce ocd:rif_gruppoParlamentare ?gruppo.
    ?gruppo dcterms:alternative ?sigla.
    ?gruppo dc:title ?nomeGruppo.
  }

  MINUS{?aderisce ocd:endDate ?fineAdesione}

  ## organo
  OPTIONAL{
    ?d ocd:membro ?membro.
    ?membro ocd:rif_organo ?organo.
    ?organo dc:title ?commissione.
  }

  MINUS{?membro ocd:endDate ?fineMembership}
}
```

### 3. Tutti gli incarichi in organi parlamentari nella XIX Legislatura con i relativi estremi

```sparql
SELECT DISTINCT ?d ?cognome ?nome ?info
?dataNascita ?luogoNascita ?genere ?ufficio ?organo ?inizioUfficio ?fineUfficio
?collegio ?aggiornamento
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ## deputato
  ?d a ocd:deputato; ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato.
  OPTIONAL{?d dc:description ?info}

  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:firstName ?nome.
  OPTIONAL{
    ?persona bio:Birth ?nascita.
    ?nascita bio:date ?dataNascita;
      rdfs:label ?nato; ocd:rif_luogo ?luogoNascitaUri.
    ?luogoNascitaUri dc:title ?luogoNascita.
  }

  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

  ## mandato
  ?mandato ocd:rif_elezione ?elezione.

  ## elezione
  ?elezione dc:coverage ?collegio.

  ## uffici parlamentari
  ?d ocd:rif_ufficioParlamentare ?ufficioUri.
  ?ufficioUri ocd:rif_organo ?organoUri; ocd:carica ?ufficio.
  OPTIONAL{?ufficioUri ocd:endDate ?fineUfficio.}
  OPTIONAL{?ufficioUri ocd:startDate ?inizioUfficio.}
  ?organoUri dc:title ?organo.
}
ORDER BY ?d
LIMIT 10000
```

### 4. Tutti gli incarichi nei gruppi parlamentari nella XIX Legislatura con i relativi estremi

```sparql
SELECT DISTINCT ?d ?cognome ?nome ?genere ?incarico ?organo ?inizioIncarico ?fineIncarico ?aggiornamento
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ## deputato
  ?d a ocd:deputato; ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato.

  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:firstName ?nome.

  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

  ## uffici parlamentari
  ?d ocd:rif_incarico ?incaricoUri.
  ?incaricoUri ocd:rif_gruppoParlamentare ?organoUri; ocd:ruolo ?incarico.
  OPTIONAL{?incaricoUri ocd:endDate ?fineIncarico.}
  OPTIONAL{?incaricoUri ocd:startDate ?inizioIncarico.}
  ?organoUri dc:title ?organo.
}
ORDER BY ?d
LIMIT 10000
```

### 5. Tutti gli incarichi di governo di deputati della XIX Legislatura con i relativi estremi

```sparql
SELECT DISTINCT ?d ?cognome ?nome ?membroGoverno
  ?dataInizio ?dataFine ?carica ?nomeGoverno ?nomeOrganoGoverno ?delega
  ?aggiornamento
WHERE {
  ?persona ocd:rif_mandatoCamera ?mandato; a foaf:Person.

  ## deputato
  ?d a ocd:deputato; ocd:aderisce ?aderisce;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:rif_mandatoCamera ?mandato.
  OPTIONAL{?d dc:description ?info}

  ##anagrafica
  ?d foaf:surname ?cognome; foaf:gender ?genere; foaf:firstName ?nome.

  ##aggiornamento del sistema
  OPTIONAL{?d <http://lod.xdams.org/ontologies/ods/modified> ?aggiornamento.}

  ?persona ocd:rif_membroGoverno ?membroGoverno.
  ?membroGoverno ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    ocd:startDate ?dataInizio;
    ocd:membroGoverno ?carica.

  ## GOVERNO
  ?membroGoverno ocd:rif_governo ?governo.
  ?governo dc:title ?nomeGoverno.

  ## ORGANO
  OPTIONAL{
    ?membroGoverno ocd:rif_organoGoverno ?organoGoverno.
    ?organoGoverno dc:title ?nomeOrganoGoverno.
  }

  OPTIONAL {?membroGoverno ocd:endDate ?dataFine}

  ## informazioni di delega
  OPTIONAL {?membroGoverno dc:description ?delega}

  ## e interim
  OPTIONAL {?membroGoverno ocd:interim ?interim}
}
ORDER BY ?nomeGoverno
LIMIT 10000
```

## Query sugli Atti

### 6. Tutti gli atti della Legislatura XVIII con relative fasi di iter ed eventuale data di approvazione

```sparql
SELECT DISTINCT ?atto ?numero ?iniziativa ?presentazione ?titolo ?fase ?dataIter ?dataApprovazione
WHERE {
  ?atto a ocd:atto;
    ocd:iniziativa ?iniziativa;
    dc:identifier ?numero;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>;
    dc:date ?presentazione;
    dc:title ?titolo;
    ocd:rif_statoIter ?statoIter.

  ?statoIter dc:title ?fase; dc:date ?dataIter.

  OPTIONAL{
    ?votazione a ocd:votazione;
      ocd:rif_attoCamera ?atto;
      ocd:approvato "1"^^xsd:integer;
      ocd:votazioneFinale "1"^^xsd:integer;
      dc:date ?dataApprovazione.
  }
}
ORDER BY ?presentazione ?dataIter
```

### 7. Tutti gli atti (pdl, mozioni, etc.) presentati da un deputato come primo e altro firmatario

```sparql
SELECT DISTINCT ?atto ?tipoRuolo ?tipo ?numeroAtto ?date ?titolo
WHERE {
  {
    ?atto ?ruolo ?deputato;
      dc:date ?date;
      dc:identifier ?numeroAtto;
      dc:title ?titolo.
    OPTIONAL{?atto dc:type ?tipo}
    FILTER(?ruolo = ocd:primo_firmatario)
  }
  UNION{
    ?atto ?ruolo ?deputato;
      dc:date ?date;
      dc:identifier ?numeroAtto;
      dc:title ?titolo.
    OPTIONAL{?atto dc:type ?tipo}
    FILTER(?ruolo = ocd:altro_firmatario)
  }

  ?ruolo rdfs:label ?tipoRuolo.

  ## seleziono deputato nella legislatura
  ?deputato foaf:surname ?cognome;
    foaf:firstName ?nome;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>

  FILTER(REGEX(?cognome,'ANZALDI','i'))
}
ORDER BY DESC(?ruolo) ASC(?tipo) ASC(?date)
LIMIT 10000
```

### 8. Numero degli atti presentati dal deputato per iniziale di cognome e per anno/mese

```sparql
SELECT DISTINCT ?cognome ?nome ?tipoRuolo ?tipo COUNT(DISTINCT ?atto) as ?numeroAtti
WHERE {
  {
    ?atto ?ruolo ?deputato;
      dc:date ?date;
      dc:identifier ?numeroAtti.
    OPTIONAL{?atto dc:type ?tipo}
    FILTER(?ruolo = ocd:primo_firmatario)
  }
  UNION{
    ?atto ?ruolo ?deputato;
      dc:date ?date;
      dc:identifier ?numeroAtti.
    OPTIONAL{?atto dc:type ?tipo}
    FILTER(?ruolo = ocd:altro_firmatario)
  }

  ?ruolo rdfs:label ?tipoRuolo.

  ## seleziono deputato nella legislatura
  ?deputato foaf:surname ?cognome;
    foaf:firstName ?nome;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>

  ## commentare la riga seguente per avere il dato per tutti i deputati
  ## sostituire la lettera A con altra per modificare l'iniziale
  ## sostituire i caratteri ^A con un cognome per avere i dati relativi ad un deputato
  FILTER(REGEX(?cognome,'^A','i'))

  ## commentare la riga seguente per avere il dato di tutta la legislatura
  ## i dati sono per anno 2018 e mese 03 per avere altri anni o mesi modificare ad es. 201309
  ## per avere i dati di tutto l'anno, eliminare il mese 03
  FILTER(REGEX(?date,'^201803','i'))
}
ORDER BY ASC(?cognome) ASC(?nome) DESC(?ruolo) ASC(?tipo)
LIMIT 10000
```

## Query sulle Votazioni

### 9. Tutte le votazioni finali della XVIII Legislatura

```sparql
SELECT DISTINCT *
WHERE {
  ?votazione a ocd:votazione;
    dc:date ?data;
    dc:title ?denominazione;
    dc:description ?descrizione;
    ocd:votanti ?votanti;
    ocd:votazioneFinale 1;
    ocd:favorevoli ?favorevoli;
    ocd:contrari ?contrari;
    ocd:astenuti ?astenuti;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>
}
ORDER BY DESC(?data)
```

### 10. Tutte le espressioni di voto di una data votazione

```sparql
SELECT DISTINCT ?votazione ?titolo ?descrizione ?numeroVotazione ?cognome ?nome ?espressione ?infoAssenza ?deputato
WHERE {
  ## prima votazione del 6 giugno 2014
  ?votazione a ocd:votazione;
    dc:date '20140611';
    rdfs:label ?titolo;
    dc:description ?descrizione;
    dc:identifier ?numeroVotazione.

  FILTER(REGEX(?numeroVotazione,'001'))

  ## voti espressi
  ?voto a ocd:voto;
    ocd:rif_votazione ?votazione;
    dc:type ?espressione;
    ocd:rif_deputato ?deputato.

  OPTIONAL{?voto dc:description ?infoAssenza}

  ## info deputato
  ?deputato foaf:surname ?cognome; foaf:firstName ?nome
}
ORDER BY ?cognome
```

### 11. Conteggio voti per tipo di espressione per un gruppo di deputati

```sparql
SELECT DISTINCT ?cognome ?nome ?espressione COUNT(DISTINCT ?votazione) as ?numero
WHERE {
  ## seleziono deputato nella legislatura
  ?deputato foaf:surname ?cognome;
    foaf:firstName ?nome;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>

  FILTER(REGEX(?cognome,'^A','i'))

  ?votazione a ocd:votazione;
    dc:date ?date.

  FILTER(REGEX(?date,'^201809','i'))

  ## voti espressi dal deputato
  ?voto a ocd:voto;
    ocd:rif_votazione ?votazione;
    dc:type ?espressione;
    ocd:rif_deputato ?deputato;
    dc:identifier ?numero.

  ## altre: Contrario, Favorevole, Ha votato, Non ha votato
  FILTER(REGEX(?espressione,'Astensione','i'))
}
ORDER BY DESC(?numero) ASC(?cognome) ASC(?nome)
LIMIT 10000
```

## Query sui Dibattiti e Interventi

### 12. Deputati intervenuti in Aula su un argomento specifico (es. immigrazione) nella XVIII Legislatura

```sparql
SELECT DISTINCT ?deputatoId ?cognome ?nome ?argomento
?titoloSeduta ?testo
WHERE {
  ?dibattito a ocd:dibattito;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>.

  ?dibattito ocd:rif_discussione ?discussione.
  ?discussione ocd:rif_seduta ?seduta.
  ?seduta dc:date ?data; dc:title ?titoloSeduta.
  ?seduta ocd:rif_assemblea ?assemblea.

  ##titolo della discussione
  ?discussione rdfs:label ?argomento.
  FILTER(REGEX(?argomento,'immigrazione','i'))

  ##deputato intervenuto
  ?discussione ocd:rif_intervento ?intervento.
  ?intervento ocd:rif_deputato ?deputatoId; dc:relation ?testo.
  ?deputatoId foaf:firstName ?nome; foaf:surname ?cognome.
}
ORDER BY ?cognome ?nome ?data
```

### 13. Interventi in Aula di un deputato specifico

```sparql
SELECT DISTINCT ?deputatoId ?cognome ?nome ?argomento
?titoloSeduta ?testo
WHERE {
  ?dibattito a ocd:dibattito;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_17>.

  ?dibattito ocd:rif_discussione ?discussione.
  ?discussione ocd:rif_seduta ?seduta.
  ?seduta dc:date ?data; dc:title ?titoloSeduta.
  ?seduta ocd:rif_assemblea ?assemblea.

  ##titolo della discussione
  ?discussione rdfs:label ?argomento.

  ##deputato intervenuto
  ?discussione ocd:rif_intervento ?intervento.
  ?intervento ocd:rif_deputato ?deputatoId; dc:relation ?testo.
  ?deputatoId foaf:firstName ?nome; foaf:surname ?cognome.

  ##filtro con uri deputato
  #FILTER(?deputatoId=<http://dati.camera.it/ocd/deputato.rdf/d302940_17>)

  ##oppure filtro su nome e cognome
  FILTER(REGEX(STR(?nome),'Ignazio','i')).
  FILTER(REGEX(STR(?cognome),'Abrignani','i'))

  #in un determinato anno
  #FILTER(REGEX(STR(?data),'^2015','i')).
}
ORDER BY ?cognome ?nome ?data
```

## Query sulla Bibliografia del Parlamento (BPR)

### 14. Elenco di tutti gli articoli con data di pubblicazione successiva al 2010, con codice di classificazione 'D40' e appartenenti al periodo repubblicano

```sparql
SELECT ?s ?titolo ?nomeAutore ?dataPubblicazione ?citazione ?tipologia ?note
FROM <http://dati.camera.it/ocd/bpr/>
WHERE {
  ?s dc:title ?titolo;
    dcterms:issued ?dataPubblicazione;
    dc:type ?tipologia.

  OPTIONAL{?s dcterms:bibliographicCitation ?citazione.}
  OPTIONAL{
    ?s dcterms:creator ?autore.
    ?autore rdfs:label ?nomeAutore
  }
  OPTIONAL{?s skos:note ?note.}

  ## FILTRO PER CLASSIFICAZIONE
  ?s dcterms:subject ?classificazione.
  ?classificazione skos:notation ?codiceClassificazione.
  FILTER(REGEX(?codiceClassificazione,"^D40$")) .

  ## FILTRO PER PERIODO
  ?s dc:coverage "Periodo repubblicano".

  ## FILTRO PER DATA DI PUBBLICAZIONE
  FILTER(?dataPubblicazione >= "2010")

  ## FILTRO PER TIPOLOGIA
  FILTER(STR(?tipologia)="spoglio")
}
ORDER BY ASC(?dataPubblicazione)
LIMIT 100
```

## Note Tecniche

### Legislature
- XIX Legislatura (corrente): `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>`
- XVIII Legislatura: `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_18>`
- XVII Legislatura: `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_17>`

### Formato Date
Le date utilizzano il formato `YYYYMMDD` (es: `20231015` per 15 ottobre 2023).

### Named Graphs
Alcuni dataset sono disponibili in named graphs specifici, come `<http://dati.camera.it/ocd/bpr/>` per la Bibliografia del Parlamento.

### Performance
Le query complesse possono richiedere tempo. È consigliato:
- Usare `LIMIT` per limitare i risultati
- Filtrare per legislatura specifica quando possibile
- Usare `OPTIONAL` solo quando necessario
- Utilizzare indici appropriati (URI diretti quando disponibili)
