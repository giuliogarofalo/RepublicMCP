# Esempi Query SPARQL - Senato della Repubblica

Esempi pratici di query per l'endpoint SPARQL del Senato.

**Endpoint:** https://dati.senato.it/sparql

## Indice

1. [Senatori](#senatori)
2. [Disegni di Legge (DDL)](#disegni-di-legge-ddl)
3. [Votazioni](#votazioni)
4. [Commissioni](#commissioni)
5. [Gruppi Parlamentari](#gruppi-parlamentari)
6. [Query Avanzate](#query-avanzate)

---

## Senatori

### 1. Senatori in Carica (Legislatura Corrente)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?legislatura
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura ?legislatura ;
        osr:inizio ?inizioMandato .

    # Solo mandati attivi (senza data fine)
    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))
}
ORDER BY ?cognome ?nome
```

### 2. Cerca Senatore Specifico

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?dataNascita ?luogoNascita
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome .

    # Cerca per cognome (case-insensitive)
    FILTER(REGEX(?cognome, "SALVINI", "i"))

    # Informazioni opzionali
    OPTIONAL { ?senatore osr:dataNascita ?dataNascita }
    OPTIONAL { ?senatore osr:cittaNascita ?luogoNascita }
}
```

### 3. Senatori per Legislatura Specifica

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?inizioMandato ?fineMandato
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    # XIX Legislatura (2022-oggi)
    ?mandato osr:legislatura 19 ;
        osr:inizio ?inizioMandato .

    OPTIONAL { ?mandato osr:fine ?fineMandato }
}
ORDER BY ?cognome ?nome
```

### 4. Senatori a Vita

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?tipoMandato ?dataNomina
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:tipoMandato ?tipoMandato ;
        osr:legislatura ?legislatura .

    # Solo senatori a vita
    FILTER(
        ?tipoMandato = "a vita, di nomina del Presidente della Repubblica" ||
        ?tipoMandato = "di diritto e a vita, Presidente emerito della Repubblica"
    )

    OPTIONAL { ?mandato osr:dataNomina ?dataNomina }

    # Solo mandati attivi
    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))
}
ORDER BY ?dataNomina
```

### 5. Senatori con Informazioni Complete

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?foto ?dataNascita
                ?cittaNascita ?provinciaNascita ?nazioneNascita
                ?legislatura ?inizioMandato ?tipoMandato
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura ?legislatura ;
        osr:inizio ?inizioMandato ;
        osr:tipoMandato ?tipoMandato .

    # Info opzionali
    OPTIONAL { ?senatore foaf:depiction ?foto }
    OPTIONAL { ?senatore osr:dataNascita ?dataNascita }
    OPTIONAL { ?senatore osr:cittaNascita ?cittaNascita }
    OPTIONAL { ?senatore osr:provinciaNascita ?provinciaNascita }
    OPTIONAL { ?senatore osr:nazioneNascita ?nazioneNascita }

    # Solo mandati attivi
    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))

    # Filtra per cognome se necessario
    # FILTER(REGEX(?cognome, "SALVINI", "i"))
}
ORDER BY ?cognome ?nome
```

---

## Disegni di Legge (DDL)

### 6. DDL Presentati (con Date)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?idDdl ?titolo ?dataPres ?stato ?dataStato
WHERE {
    ?ddl a osr:Ddl ;
        osr:idDdl ?idDdl ;
        osr:legislatura ?leg ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres ;
        osr:statoDdl ?stato ;
        osr:dataStatoDdl ?dataStato .

    # Solo XIX Legislatura (dal 13 ottobre 2022)
    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2022-10-13"))
}
ORDER BY DESC(?dataPres)
LIMIT 100
```

### 7. DDL per Senatore (come Firmatario)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?ddl ?titolo ?dataPres ?primoFirmatario ?dataFirma
WHERE {
    # Trova il senatore
    ?senatore a osr:Senatore ;
        foaf:lastName "SALVINI" ;
        foaf:firstName "Matteo" .

    # Trova le iniziative
    ?iniziativa osr:presentatore ?senatore .

    # Trova i DDL
    ?ddl a osr:Ddl ;
        osr:iniziativa ?iniziativa ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres .

    # Info sulla firma
    OPTIONAL { ?iniziativa osr:primoFirmatario ?primoFirmatario }
    OPTIONAL { ?iniziativa osr:dataAggiuntaFirma ?dataFirma }
}
ORDER BY DESC(?dataPres)
LIMIT 50
```

### 8. DDL come Primo Firmatario

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?ddl ?titolo ?dataPres ?stato
WHERE {
    # Trova il senatore
    ?senatore a osr:Senatore ;
        foaf:lastName ?cognome ;
        foaf:firstName ?nome .

    FILTER(REGEX(?cognome, "MELONI", "i"))

    # Trova le iniziative come primo firmatario
    ?iniziativa osr:presentatore ?senatore ;
        osr:primoFirmatario true .

    # Trova i DDL
    ?ddl a osr:Ddl ;
        osr:iniziativa ?iniziativa ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres ;
        osr:statoDdl ?stato ;
        osr:legislatura ?leg .

    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2022-10-13"))
}
ORDER BY DESC(?dataPres)
```

### 9. DDL con Iter Completo

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?titolo ?dataPres ?stato ?fase ?progrIter ?numeroFase
WHERE {
    ?ddl a osr:Ddl ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres ;
        osr:statoDdl ?stato ;
        osr:iter ?iter .

    ?iter osr:idDdl ?idDdl ;
        osr:fase ?faseIter .

    ?faseIter osr:progrIter ?progrIter ;
        osr:ddl ?faseDdl .

    ?faseDdl osr:numeroFase ?numeroFase ;
        osr:statoDdl ?statoFase .

    # Filtra per periodo
    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?dataPres) ?progrIter
LIMIT 50
```

### 10. DDL per Stato

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?idDdl ?titolo ?titoloBreve ?dataPres ?dataStato
WHERE {
    ?ddl a osr:Ddl ;
        osr:idDdl ?idDdl ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres ;
        osr:statoDdl ?stato ;
        osr:dataStatoDdl ?dataStato .

    OPTIONAL { ?ddl osr:titoloBreve ?titoloBreve }

    # Filtra per stato (esempi: "In corso", "Approvato", "Respinto", ecc.)
    FILTER(REGEX(?stato, "In corso", "i"))

    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?dataPres)
LIMIT 100
```

---

## Votazioni

### 11. Votazioni Recenti

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?votazione ?numero ?data ?oggetto ?esito
       ?favorevoli ?contrari ?astenuti ?presenti
WHERE {
    ?votazione a osr:Votazione ;
        osr:numero ?numero ;
        osr:seduta ?seduta ;
        rdfs:label ?oggetto ;
        osr:esito ?esito ;
        osr:favorevoli ?favorevoli ;
        osr:contrari ?contrari ;
        osr:astenuti ?astenuti ;
        osr:presenti ?presenti .

    ?seduta osr:dataSeduta ?data ;
        osr:legislatura 19 .

    # Solo votazioni recenti (2023+)
    FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?data)
LIMIT 50
```

### 12. Voto Senatore Specifico

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?votazione ?data ?oggetto ?voto
WHERE {
    # Trova il senatore
    ?senatore a osr:Senatore ;
        foaf:lastName "SALVINI" ;
        foaf:firstName "Matteo" .

    # Trova le votazioni
    ?votazione a osr:Votazione ;
        osr:seduta ?seduta ;
        rdfs:label ?oggetto .

    ?seduta osr:dataSeduta ?data ;
        osr:legislatura 19 .

    # Determina il voto (favorevole, contrario, astenuto)
    {
        ?votazione osr:favorevole ?senatore .
        BIND("Favorevole" AS ?voto)
    } UNION {
        ?votazione osr:contrario ?senatore .
        BIND("Contrario" AS ?voto)
    } UNION {
        ?votazione osr:astenuto ?senatore .
        BIND("Astenuto" AS ?voto)
    }

    FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?data)
```

### 13. Votazioni per Esito

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?votazione ?numero ?data ?oggetto
       ?favorevoli ?contrari ?maggioranza
WHERE {
    ?votazione a osr:Votazione ;
        osr:numero ?numero ;
        osr:seduta ?seduta ;
        rdfs:label ?oggetto ;
        osr:esito ?esito ;
        osr:favorevoli ?favorevoli ;
        osr:contrari ?contrari ;
        osr:maggioranza ?maggioranza .

    ?seduta osr:dataSeduta ?data ;
        osr:legislatura 19 .

    # Solo votazioni approvate
    FILTER(REGEX(?esito, "approvato", "i"))

    FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
}
ORDER BY DESC(?data)
LIMIT 100
```

### 14. Statistiche Votazioni per Senatore

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?senatore ?cognome ?nome
       (COUNT(DISTINCT ?votFav) as ?voti_favorevoli)
       (COUNT(DISTINCT ?votContr) as ?voti_contrari)
       (COUNT(DISTINCT ?votAst) as ?voti_astenuti)
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 .
    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))

    # Conta voti favorevoli
    OPTIONAL {
        ?votFav a osr:Votazione ;
            osr:favorevole ?senatore ;
            osr:seduta/osr:dataSeduta ?dataFav .
        FILTER(xsd:date(str(?dataFav)) >= xsd:date("2023-01-01"))
    }

    # Conta voti contrari
    OPTIONAL {
        ?votContr a osr:Votazione ;
            osr:contrario ?senatore ;
            osr:seduta/osr:dataSeduta ?dataContr .
        FILTER(xsd:date(str(?dataContr)) >= xsd:date("2023-01-01"))
    }

    # Conta astensioni
    OPTIONAL {
        ?votAst a osr:Votazione ;
            osr:astenuto ?senatore ;
            osr:seduta/osr:dataSeduta ?dataAst .
        FILTER(xsd:date(str(?dataAst)) >= xsd:date("2023-01-01"))
    }

    FILTER(REGEX(?cognome, "SALVINI", "i"))
}
GROUP BY ?senatore ?cognome ?nome
```

---

## Commissioni

### 15. Commissioni Attive

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT DISTINCT ?commissione ?titolo ?categoria ?ordinale
WHERE {
    ?commissione a osr:Commissione ;
        osr:denominazione ?den .

    ?den osr:titolo ?titolo .

    OPTIONAL { ?commissione osr:categoriaCommissione ?categoria }
    OPTIONAL { ?commissione osr:ordinale ?ordinale }

    # Solo denominazioni attive (senza data fine)
    OPTIONAL { ?den osr:fine ?fineDen }
    FILTER(!bound(?fineDen))
}
ORDER BY ?ordinale ?titolo
```

### 16. Composizione Commissione

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?carica ?inizio
WHERE {
    # Commissione (es: 1ª Commissione Affari Costituzionali)
    ?commissione a osr:Commissione ;
        osr:ordinale "1" ;
        osr:denominazione/osr:titolo ?titoloComm .

    # Afferenza (membership)
    ?senatore osr:afferisce ?afferenza .

    ?afferenza osr:commissione ?commissione ;
        osr:inizio ?inizio .

    OPTIONAL { ?afferenza osr:carica ?carica }
    OPTIONAL { ?afferenza osr:fine ?fine }

    # Solo afferenze attive
    FILTER(!bound(?fine))

    # Info senatore
    ?senatore foaf:firstName ?nome ;
        foaf:lastName ?cognome .
}
ORDER BY ?cognome ?nome
```

### 17. Commissioni di un Senatore

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?commissione ?titolo ?carica ?inizio ?fine
WHERE {
    # Trova il senatore
    ?senatore a osr:Senatore ;
        foaf:lastName "LA RUSSA" ;
        foaf:firstName "Ignazio" .

    # Trova le afferenze
    ?senatore osr:afferisce ?afferenza .

    ?afferenza osr:commissione ?commissione ;
        osr:inizio ?inizio .

    OPTIONAL { ?afferenza osr:carica ?carica }
    OPTIONAL { ?afferenza osr:fine ?fine }

    # Nome commissione
    ?commissione osr:denominazione ?den .
    ?den osr:titolo ?titolo .

    # Solo commissioni attuali (o tutte se rimuovi il filtro)
    FILTER(!bound(?fine))
}
ORDER BY ?inizio
```

---

## Gruppi Parlamentari

### 18. Gruppi Parlamentari Attuali

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>

SELECT DISTINCT ?gruppo ?nomeGruppo
WHERE {
    ?gruppo a ocd:gruppoParlamentare ;
        osr:denominazione ?den .

    ?den osr:titolo ?nomeGruppo .

    # Solo denominazioni attive
    OPTIONAL { ?den osr:fine ?fineDen }
    FILTER(!bound(?fineDen))
}
ORDER BY ?nomeGruppo
```

### 19. Composizione Gruppo Parlamentare

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?carica ?inizio
WHERE {
    # Gruppo (usa REGEX per trovare quello giusto)
    ?gruppo a ocd:gruppoParlamentare ;
        osr:denominazione/osr:titolo ?nomeGruppo .

    FILTER(REGEX(?nomeGruppo, "Fratelli d'Italia", "i"))

    # Adesione
    ?senatore ocd:aderisce ?adesione .

    ?adesione osr:gruppo ?gruppo ;
        osr:inizio ?inizio .

    OPTIONAL { ?adesione osr:carica ?carica }
    OPTIONAL { ?adesione osr:fine ?fine }

    # Solo adesioni attive
    FILTER(!bound(?fine))

    # Info senatore
    ?senatore foaf:firstName ?nome ;
        foaf:lastName ?cognome .
}
ORDER BY ?cognome ?nome
```

### 20. Gruppi di un Senatore (Storia)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?gruppo ?nomeGruppo ?carica ?inizio ?fine
WHERE {
    # Trova il senatore
    ?senatore a osr:Senatore ;
        foaf:lastName "RENZI" ;
        foaf:firstName "Matteo" .

    # Trova le adesioni (storiche)
    ?senatore ocd:aderisce ?adesione .

    ?adesione osr:gruppo ?gruppo ;
        osr:inizio ?inizio .

    OPTIONAL { ?adesione osr:carica ?carica }
    OPTIONAL { ?adesione osr:fine ?fine }

    # Nome gruppo
    ?gruppo osr:denominazione ?den .
    ?den osr:titolo ?nomeGruppo .

    # Per vedere solo il gruppo attuale, decommenta:
    # FILTER(!bound(?fine))
}
ORDER BY ?inizio
```

---

## Query Avanzate

### 21. Profilo Completo Senatore

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?senatore ?cognome ?nome ?foto
                ?dataNascita ?luogoNascita
                ?legislatura ?inizioMandato ?tipoMandato
                ?gruppo ?nomeGruppo ?caricaGruppo
                ?commissione ?nomeCommissione ?caricaCommissione
WHERE {
    # Senatore base
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome .

    FILTER(REGEX(?cognome, "SALVINI", "i"))

    # Info personali opzionali
    OPTIONAL { ?senatore foaf:depiction ?foto }
    OPTIONAL { ?senatore osr:dataNascita ?dataNascita }
    OPTIONAL { ?senatore osr:cittaNascita ?luogoNascita }

    # Mandato corrente
    OPTIONAL {
        ?senatore osr:mandato ?mandato .
        ?mandato osr:legislatura ?legislatura ;
            osr:inizio ?inizioMandato ;
            osr:tipoMandato ?tipoMandato .
        OPTIONAL { ?mandato osr:fine ?fineMandato }
        FILTER(!bound(?fineMandato))
    }

    # Gruppo parlamentare corrente
    OPTIONAL {
        ?senatore ocd:aderisce ?adesione .
        ?adesione osr:gruppo ?gruppo ;
            osr:inizio ?inizioAdesione .
        OPTIONAL { ?adesione osr:carica ?caricaGruppo }
        OPTIONAL { ?adesione osr:fine ?fineAdesione }
        FILTER(!bound(?fineAdesione))

        ?gruppo osr:denominazione/osr:titolo ?nomeGruppo .
    }

    # Commissioni correnti
    OPTIONAL {
        ?senatore osr:afferisce ?afferenza .
        ?afferenza osr:commissione ?commissione ;
            osr:inizio ?inizioAfferenza .
        OPTIONAL { ?afferenza osr:carica ?caricaCommissione }
        OPTIONAL { ?afferenza osr:fine ?fineAfferenza }
        FILTER(!bound(?fineAfferenza))

        ?commissione osr:denominazione/osr:titolo ?nomeCommissione .
    }
}
```

### 22. Attività Legislativa Senatore (Completa)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?senatore ?cognome ?nome
       (COUNT(DISTINCT ?ddl) as ?ddl_totali)
       (COUNT(DISTINCT ?ddlPrimo) as ?ddl_primo_firmatario)
       (COUNT(DISTINCT ?votazione) as ?votazioni_totali)
WHERE {
    # Senatore
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 .

    FILTER(REGEX(?cognome, "SALVINI", "i"))

    # DDL totali
    OPTIONAL {
        ?iniziativa osr:presentatore ?senatore .
        ?ddl osr:iniziativa ?iniziativa .
    }

    # DDL come primo firmatario
    OPTIONAL {
        ?iniziativaPrimo osr:presentatore ?senatore ;
            osr:primoFirmatario true .
        ?ddlPrimo osr:iniziativa ?iniziativaPrimo .
    }

    # Votazioni
    OPTIONAL {
        {
            ?votazione osr:favorevole ?senatore .
        } UNION {
            ?votazione osr:contrario ?senatore .
        } UNION {
            ?votazione osr:astenuto ?senatore .
        }
    }
}
GROUP BY ?senatore ?cognome ?nome
```

### 23. DDL più Discussi (per Numero Emendamenti)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>

SELECT ?ddl ?titolo ?dataPres
       (COUNT(DISTINCT ?emendamento) as ?num_emendamenti)
WHERE {
    ?ddl a osr:Ddl ;
        osr:titolo ?titolo ;
        osr:dataPresentazione ?dataPres .

    ?emendamento a osr:Emendamento ;
        osr:relativoA ?ddl .

    FILTER(xsd:date(str(?dataPres)) >= xsd:date("2023-01-01"))
}
GROUP BY ?ddl ?titolo ?dataPres
ORDER BY DESC(?num_emendamenti)
LIMIT 20
```

### 24. Senatori per Regione di Elezione

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?regione
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 ;
        osr:regioneElezione ?regione .

    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))

    # Filtra per regione specifica se necessario
    # FILTER(REGEX(?regione, "Lombardia", "i"))
}
ORDER BY ?regione ?cognome ?nome
```

### 25. Confronto Attività tra Senatori

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?cognome ?nome
       (COUNT(DISTINCT ?ddl) as ?ddl_presentati)
       (COUNT(DISTINCT ?intervento) as ?interventi)
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 .
    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))

    # DDL
    OPTIONAL {
        ?iniziativa osr:presentatore ?senatore .
        ?ddl osr:iniziativa ?iniziativa ;
            osr:dataPresentazione ?dataDdl .
        FILTER(xsd:date(str(?dataDdl)) >= xsd:date("2023-01-01"))
    }

    # Interventi
    OPTIONAL {
        ?senatore osr:interviene ?intervento .
    }
}
GROUP BY ?cognome ?nome
ORDER BY DESC(?ddl_presentati)
LIMIT 50
```

---

## Note Importanti

### Differenze con Camera

⚠️ **Ricorda le differenze chiave**:

1. **Cognome**: Senato usa `foaf:lastName`, Camera usa `foaf:surname`
2. **Legislatura**: Senato usa numero (`19`), Camera usa URI
3. **Gruppi**: Senato usa ontologia Camera (`ocd:gruppoParlamentare`)

### Filtri Comuni

```sparql
# Mandati/Afferenze/Adesioni attive (senza data fine)
FILTER(!bound(?fine))

# Range date
FILTER(xsd:date(str(?data)) >= xsd:date("2023-01-01"))
FILTER(xsd:date(str(?data)) <= xsd:date("2023-12-31"))

# Legislatura specifica
FILTER(?legislatura = 19)

# Ricerca testuale (case-insensitive)
FILTER(REGEX(?campo, "testo", "i"))
```

### Legislature Disponibili

- **XIX** (19): 2022-oggi
- **XVIII** (18): 2018-2022
- **XVII** (17): 2013-2018
- **XVI** (16): 2008-2013

---

## Testing Query

Per testare le query:

1. Vai a https://dati.senato.it/sparql
2. Copia-incolla la query
3. Clicca "Execute"
4. Modifica parametri come cognomi, date, legislature

## Risorse

- **Endpoint**: https://dati.senato.it/sparql
- **Ontologia**: https://dati.senato.it/DatiSenato/browse/21
- **Documentazione completa**: `docs/senato/01-ontologia-senato-ufficiale.md`
