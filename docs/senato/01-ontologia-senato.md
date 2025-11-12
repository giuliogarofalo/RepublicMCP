# Ontologia Senato Repubblica (OSR)

## Endpoint SPARQL

**URL**: https://dati.senato.it/sparql

## Prefissi Comuni

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>  # Usato per gruppi parlamentari
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
```

## Entità Principali

### 1. Senatore (`osr:Senatore`)

#### Proprietà Base
- `foaf:firstName` - Nome
- `foaf:lastName` - Cognome ⚠️ **Diverso da Camera** (che usa `surname`)
- `foaf:depiction` - Foto
- `osr:dataNascita` - Data nascita
- `osr:cittaNascita` - Città nascita
- `osr:provinciaNascita` - Provincia nascita
- `osr:nazioneNascita` - Nazione nascita

#### Relazioni
- `osr:mandato` → `osr:Mandato`
- `osr:afferisce` → `osr:Afferenza` (commissioni)
- `ocd:aderisce` → `ocd:adesioneGruppo` (gruppi parlamentari)

---

### 2. Mandato (`osr:Mandato`)

#### Proprietà
- `osr:legislatura` - Numero legislatura (es: 17, 18, 19)
- `osr:inizio` - Data inizio mandato
- `osr:fine` - Data fine mandato (opzionale - se non presente, in carica)
- `osr:tipoMandato` - Tipo mandato
  - "ordinario"
  - "a vita, di nomina del Presidente della Repubblica"
  - "di diritto e a vita, Presidente emerito della Repubblica"
- `osr:dataNomina` - Data nomina (per senatori a vita)
- `osr:tipoFineMandato` - Motivo fine mandato (opzionale)

---

### 3. Commissione

#### Afferenza (`osr:Afferenza`)
- `osr:inizio` - Data inizio afferenza
- `osr:fine` - Data fine afferenza (opzionale)
- `osr:commissione` → `osr:Commissione`
- `osr:carica` - Carica nella commissione

#### Commissione (`osr:Commissione`)
- `osr:denominazione` → `osr:Denominazione`
  - `osr:titolo` - Titolo commissione
  - `osr:fine` - Data fine denominazione (opzionale)

---

### 4. Gruppo Parlamentare

⚠️ **Usa ontologia Camera**: `ocd:gruppoParlamentare`

#### Adesione (`ocd:adesioneGruppo`)
- `osr:carica` - Carica nel gruppo
- `osr:inizio` - Data inizio adesione
- `osr:fine` - Data fine adesione (opzionale)
- `osr:gruppo` → `ocd:gruppoParlamentare`

#### Gruppo
- `osr:denominazione` → Denominazione
  - `osr:titolo` - Nome gruppo
  - `osr:fine` - Data fine denominazione (opzionale)

---

### 5. Disegno di Legge (`osr:Ddl`)

#### Proprietà Base
- `osr:idFase` - ID fase
- `osr:idDdl` - ID DDL
- `osr:ramo` - Ramo parlamento (Senato/Camera)
- `osr:legislatura` - Numero legislatura
- `osr:numeroFase` - Numero fase
- `osr:numeroFaseCompatto` - Numero fase compatto (per ordinamento)
- `osr:titolo` - Titolo completo
- `osr:titoloBreve` - Titolo breve (opzionale)
- `osr:natura` - Natura del DDL
- `osr:presentatoTrasmesso` - Se presentato o trasmesso
- `osr:dataPresentazione` - Data presentazione
- `osr:statoDdl` - Stato attuale
- `osr:dataStatoDdl` - Data stato
- `osr:testoPresentato` - Link testo presentato (opzionale)
- `osr:testoApprovato` - Link testo approvato (opzionale)

#### Relazioni
- `osr:iniziativa` → `osr:Iniziativa`
- `osr:iter` → `osr:IterDdl`

---

### 6. Iniziativa (`osr:Iniziativa`)

Firmatari del DDL

#### Proprietà
- `osr:presentatore` - URI presentatore (senatore)
- `osr:primoFirmatario` - Flag primo firmatario (boolean)
- `osr:dataAggiuntaFirma` - Data aggiunta firma (opzionale)
- `osr:dataRitiroFirma` - Data ritiro firma (opzionale)

---

### 7. Iter DDL (`osr:IterDdl`)

#### Proprietà
- `osr:idDdl` - ID DDL di riferimento
- `osr:fase` → `osr:FaseIter`

#### Fase Iter (`osr:FaseIter`)
- `osr:progrIter` - Progressivo iter (numero)
- `osr:ddl` - Riferimento alla fase DDL
  - `osr:ramo` - Ramo
  - `osr:numeroFase` - Numero fase
  - `osr:statoDdl` - Stato
  - `osr:dataStatoDdl` - Data stato

---

### 8. Votazione (`osr:Votazione`)

#### Proprietà
- `osr:numero` - Numero votazione
- `osr:seduta` → `osr:SedutaAssemblea`
- `rdfs:label` - Oggetto votazione
- `osr:esito` - Esito votazione
- `osr:presenti` - Numero presenti
- `osr:votanti` - Numero votanti
- `osr:favorevoli` - Voti favorevoli
- `osr:contrari` - Voti contrari
- `osr:astenuti` - Astenuti
- `osr:maggioranza` - Maggioranza necessaria
- `osr:numeroLegale` - Numero legale
- `osr:presidente` - Presidente seduta

#### Seduta
- `osr:numeroSeduta` - Numero seduta
- `osr:dataSeduta` - Data seduta
- `osr:legislatura` - Numero legislatura

---

### 9. Altri Tipi Entità

Dal test esplorazione endpoint:

1. **osr:Classificazione** (869,980 entità)
2. **osr:Iniziativa** (837,373)
3. **osr:Emendamento** (695,394)
4. **osr:Assegnazione** (359,968)
5. **osr:Intervento** (295,746)
6. **osr:Atto** (170,491)
7. **osr:SedutaCommissione** (73,205)
8. **osr:FaseIter** (72,552)
9. **osr:SindacatoIspettivo** (65,118)
10. **osr:Relatore** (54,595)
11. **osr:Procedura** (47,735)
12. **osr:Documento** (47,504)
13. **osr:OggettoTrattazione** (16,356)

---

## Differenze con Camera (OCD)

| Aspetto | Camera (OCD) | Senato (OSR) |
|---------|--------------|--------------|
| **Prefix** | `ocd:` | `osr:` |
| **Membro** | `ocd:deputato` | `osr:Senatore` |
| **Cognome** | `foaf:surname` | `foaf:lastName` ⚠️ |
| **Mandato** | `ocd:rif_mandatoCamera` | `osr:mandato` |
| **Legislatura** | `ocd:rif_leg` | `osr:legislatura` (numero) |
| **Atti** | `ocd:atto` | `osr:Ddl`, `osr:Atto` |
| **Gruppi** | `ocd:gruppoParlamentare` | `ocd:gruppoParlamentare` ✅ Stesso! |
| **Adesione** | `ocd:aderisce` | `ocd:aderisce` ✅ Stesso! |

---

## Pattern Query Comuni

### Senatori in Carica

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?nome ?cognome ?legislatura
WHERE {
    ?senatore a osr:Senatore ;
        foaf:firstName ?nome ;
        foaf:lastName ?cognome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura ?legislatura ;
        osr:inizio ?inizioMandato .

    OPTIONAL { ?mandato osr:fine ?fineMandato }
    FILTER(!bound(?fineMandato))
}
ORDER BY ?cognome ?nome
```

### Senatori per Legislatura

```sparql
?mandato osr:legislatura 19 .  # XIX Legislatura
```

### Senatori a Vita

```sparql
FILTER(
    ?tipoMandato = "a vita, di nomina del Presidente della Repubblica" ||
    ?tipoMandato = "di diritto e a vita, Presidente emerito della Repubblica"
)
```

### Commissioni Attuali

```sparql
?senatore osr:afferisce ?afferenza .
?afferenza osr:commissione ?commissione ;
    osr:inizio ?inizioAfferenza .

OPTIONAL { ?afferenza osr:fine ?fineAfferenza }
FILTER(!bound(?fineAfferenza))
```

### Gruppi Attuali

```sparql
?senatore ocd:aderisce ?adesioneGruppo .
?adesioneGruppo osr:gruppo ?gruppo ;
    osr:inizio ?inizioAdesione .

OPTIONAL { ?adesioneGruppo osr:fine ?fineAdesione }
FILTER(!bound(?fineAdesione))
```

---

## Note Implementative

### ⚠️ Attenzione

1. **foaf:lastName vs foaf:surname**: Senato usa `lastName`, Camera usa `surname`!
2. **Legislatura**: Senato usa numero diretto (17, 18, 19), Camera usa URI
3. **Gruppi**: Senato riusa l'ontologia Camera per gruppi parlamentari
4. **Date**: Formato `xsd:date` per filtri temporali

### Filtri Comuni

```sparql
# Mandato attivo (no data fine)
FILTER(!bound(?fineMandato))

# Range date
FILTER(xsd:date(str(?data)) >= xsd:date("2014-01-01"))
FILTER(xsd:date(str(?data)) <= xsd:date("2014-04-30"))

# Legislatura specifica
FILTER(?legislatura = 19)
```

---

## Risorse Utili

- **Endpoint**: https://dati.senato.it/sparql
- **Esempi Query**: Vedi `02-esempi-query-senato.md`
- **Note**: Non esiste documentazione ufficiale esplicita come per Camera
- **Fonte**: Reverse engineering da esempi query ufficiali

---

## Legislature Disponibili

- **XIX Legislatura**: 2022-oggi (corrente)
- **XVIII Legislatura**: 2018-2022
- **XVII Legislatura**: 2013-2018
- **XVI Legislatura**: 2008-2013
- Precedenti...

---

## Mappatura Tipi TypeScript

Vedi `institutions/senato/ontology/types.ts` per definizioni complete.

```typescript
interface Senatore {
  uri: string;
  firstName: string;
  lastName: string;  // NON surname!
  birthDate?: string;
  birthCity?: string;
  birthProvince?: string;
  birthCountry?: string;
  photo?: string;
  mandates: Mandate[];
}

interface Mandate {
  legislature: number;  // NON URI!
  start: string;
  end?: string;
  type: string;
  nominationDate?: string;
}
```
