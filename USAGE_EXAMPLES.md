# RepublicMCP - Esempi di Utilizzo

Questa guida mostra esempi pratici di come usare il server MCP con Claude per interrogare i dati del Parlamento italiano.

## Prerequisiti

- RepublicMCP installato e configurato in Claude Desktop
- Claude Desktop riavviato dopo la configurazione

## Domande Naturali → Tools MCP

Il server MCP permette a Claude di rispondere a domande in linguaggio naturale interrogando automaticamente i dati aperti del Parlamento.

### 1. Informazioni su Deputati

#### Cercare un deputato per cognome

**Domanda:**
```
Chi è Giorgia Meloni nella Camera dei Deputati?
```

**Tool usato:** `search_deputati`

**Cosa fa Claude:**
1. Chiama `search_deputati` con `cognome: "Meloni"`
2. Ottiene i risultati SPARQL
3. Presenta le informazioni in modo leggibile

**Risultato atteso:**
- Nome completo
- Data e luogo di nascita
- Gruppo parlamentare
- Collegio di elezione

---

#### Trovare deputati di un gruppo

**Domanda:**
```
Mostrami alcuni deputati del gruppo Fratelli d'Italia
```

**Tool usato:** `search_deputati` o `get_gruppi_parlamentari` seguito da ricerca

---

#### Biografia completa di un deputato

**Domanda:**
```
Dammi informazioni dettagliate su [nome deputato], incluse le commissioni di cui fa parte
```

**Tool usato:**
1. `search_deputati` per trovare l'URI
2. `get_deputato_info` per i dettagli completi

---

### 2. Atti Parlamentari

#### Cercare disegni di legge su un tema

**Domanda:**
```
Quali sono i recenti disegni di legge sulla sanità?
```

**Tool usato:** `search_atti` con `titolo: "sanità"`

**Risultato:**
- Numero dell'atto
- Titolo completo
- Data di presentazione
- Tipo di iniziativa

---

#### Stato di un disegno di legge specifico

**Domanda:**
```
Qual è lo stato della legge di bilancio 2024?
```

**Tool usato:**
1. `search_atti` con `titolo: "bilancio 2024"`
2. `get_atto_info` per vedere l'iter completo

**Informazioni fornite:**
- Fasi dell'iter legislativo
- Date di ogni fase
- Proponenti
- Eventuali votazioni finali

---

#### Atti presentati da un deputato

**Domanda:**
```
Quali atti ha presentato [nome deputato] in questa legislatura?
```

**Tool usato:**
1. `search_deputati` per trovare l'URI del deputato
2. `execute_sparql` con query personalizzata per gli atti del deputato

---

### 3. Votazioni

#### Ultime votazioni in aula

**Domanda:**
```
Quali sono state le ultime 10 votazioni alla Camera?
```

**Tool usato:** `get_votazioni` con `limit: 10`

**Risultato:**
- Data della votazione
- Descrizione
- Voti favorevoli, contrari, astenuti
- Esito (se approvato o meno)

---

#### Votazioni su un atto specifico

**Domanda:**
```
Come hanno votato i deputati sulla legge [titolo]?
```

**Tool usato:**
1. `search_atti` per trovare l'atto
2. `get_votazioni` filtrando per `atto_uri`

---

#### Analisi risultati votazione

**Domanda:**
```
Dammi i dettagli della votazione del 15 ottobre 2023
```

**Tool usato:** `get_votazioni` con filtro `data_da` e `data_a`

---

### 4. Commissioni e Organi

#### Lista commissioni permanenti

**Domanda:**
```
Quali sono le commissioni permanenti della Camera nella legislatura corrente?
```

**Tool usato:** `get_commissioni`

---

#### Membri di una commissione

**Domanda:**
```
Chi sono i membri della Commissione Bilancio?
```

**Tool usato:** `execute_sparql` con query che cerca membri della commissione

---

### 5. Governi

#### Governo attuale

**Domanda:**
```
Chi sono i membri del governo Meloni?
```

**Tool usato:**
1. `get_governi` per trovare il governo
2. `get_governo_membri` per la lista completa

**Informazioni fornite:**
- Ministri e sottosegretari
- Dicastero di competenza
- Deleghe specifiche
- Date di incarico

---

#### Storia dei governi

**Domanda:**
```
Mostrami gli ultimi 5 governi della Repubblica
```

**Tool usato:** `get_governi`

---

### 6. Interventi e Dibattiti

#### Interventi su un tema

**Domanda:**
```
Chi ha parlato di immigrazione in aula negli ultimi mesi?
```

**Tool usato:** `search_interventi` con `argomento: "immigrazione"`

**Risultato:**
- Deputati intervenuti
- Date e sedute
- Argomento della discussione

---

#### Interventi di un deputato

**Domanda:**
```
Su quali temi è intervenuto [nome deputato] in questa legislatura?
```

**Tool usato:** `execute_sparql` con query personalizzata

---

### 7. Gruppi Parlamentari

#### Lista gruppi

**Domanda:**
```
Quali sono i gruppi parlamentari nella XIX legislatura?
```

**Tool usato:** `get_gruppi_parlamentari`

**Risultato:**
- Nome ufficiale
- Sigla
- Date di costituzione

---

#### Composizione di un gruppo

**Domanda:**
```
Quanti deputati ha il gruppo [nome gruppo]?
```

**Tool usato:** `search_deputati` filtrato per gruppo

---

## Query SPARQL Personalizzate

Per casi d'uso avanzati, puoi chiedere a Claude di eseguire query SPARQL personalizzate.

### Esempio: Statistiche votazioni

**Domanda:**
```
Esegui una query SPARQL per contare quante votazioni ci sono state nella XIX legislatura
```

**Tool usato:** `execute_sparql`

**Query generata da Claude:**
```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>

SELECT (COUNT(?votazione) as ?totale)
WHERE {
  ?votazione a ocd:votazione;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>.
}
```

---

### Esempio: Atti per tipo

**Domanda:**
```
Crea una query SPARQL che mostri quanti atti ci sono per ogni tipo nella legislatura corrente
```

**Tool usato:** `execute_sparql`

**Query:**
```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?tipo (COUNT(?atto) as ?numero)
WHERE {
  ?atto a ocd:atto;
    ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>;
    dc:type ?tipo.
}
GROUP BY ?tipo
ORDER BY DESC(?numero)
```

---

## Combinazioni di Tools

Claude può combinare più tools per rispondere a domande complesse.

### Esempio 1: Carriera di un deputato

**Domanda:**
```
Dammi una panoramica completa della carriera parlamentare di [nome], inclusi gli atti presentati e gli interventi fatti
```

**Tools usati:**
1. `search_deputati` - trova il deputato
2. `get_deputato_info` - dettagli biografici e commissioni
3. `execute_sparql` - atti presentati
4. `execute_sparql` - interventi in aula

---

### Esempio 2: Analisi di un tema legislativo

**Domanda:**
```
Fammi un'analisi completa della legislazione su [tema]: atti, votazioni e interventi
```

**Tools usati:**
1. `search_atti` - atti sul tema
2. `get_votazioni` - votazioni correlate
3. `search_interventi` - dibattiti sul tema

---

### Esempio 3: Confronto tra legislature

**Domanda:**
```
Confronta il numero di atti presentati nella XVIII e XIX legislatura
```

**Tools usati:**
1. `search_atti` con `legislatura: "repubblica_18"`, `limit: 1000`
2. `search_atti` con `legislatura: "repubblica_19"`, `limit: 1000`
3. Claude analizza e confronta i risultati

---

## Tips per Domande Efficaci

### ✅ Domande Buone

- **Specifiche**: "Chi sono i membri della Commissione Affari Costituzionali?"
- **Con contesto**: "Quali atti sulla sanità sono stati approvati nella XIX legislatura?"
- **Comparative**: "Confronta le votazioni di ottobre e novembre 2023"

### ❌ Domande da Evitare

- **Troppo vaghe**: "Dimmi qualcosa sul Parlamento"
- **Senza contesto temporale**: "Votazioni" (meglio: "Votazioni recenti" o "Votazioni di oggi")
- **Fuori scope**: "Cosa pensa il deputato X di..." (i dati contengono fatti, non opinioni)

---

## Limiti e Considerazioni

### Dati Disponibili

- ✅ Anagrafica deputati
- ✅ Atti parlamentari e iter
- ✅ Votazioni (con risultati aggregati)
- ✅ Composizione commissioni
- ✅ Governi e incarichi
- ✅ Interventi in aula (con link ai testi)
- ❌ Contenuto completo dei testi legislativi (solo titoli)
- ❌ Voti individuali (solo in casi specifici)
- ❌ Dati in tempo reale (aggiornamenti con ritardo)

### Performance

- Query complesse possono richiedere tempo
- Usa `limit` per query esplorative
- Filtra sempre per legislatura quando possibile

### Freshness

I dati sono aggiornati dall'ufficio della Camera con una certa frequenza. Per informazioni in tempo reale, consultare il sito ufficiale camera.it.

---

## Debugging

### Claude non usa i tools

Prova a essere più esplicito:
```
Usa il tool search_deputati per cercare deputati con cognome Rossi
```

### Risultati vuoti

- Verifica l'ortografia (nomi, cognomi)
- Prova varianti (es. "Meloni" vs "MELONI")
- Verifica la legislatura (alcuni dati potrebbero non essere in quella corrente)

### Errori SPARQL

Se una query personalizzata fallisce:
- Verifica la sintassi SPARQL
- Controlla che le URI siano corrette
- Consulta `docs/05-query-examples-official.md` per esempi funzionanti

---

## Risorse Aggiuntive

- [Documentazione Ontologia](docs/01-ontologia-camera.md)
- [Esempi Query SPARQL](docs/04-query-examples.md)
- [Query Ufficiali](docs/05-query-examples-official.md)
- [SPARQL Endpoint](https://dati.camera.it/sparql)

---

**Happy Querying!** 🏛️🇮🇹
