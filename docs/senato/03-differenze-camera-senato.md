# Differenze Ontologiche: Camera vs Senato

Guida alle differenze chiave tra l'ontologia della Camera dei Deputati (OCD) e l'ontologia del Senato della Repubblica (OSR).

## Tabella Riepilogativa

| Aspetto | Camera (OCD) | Senato (OSR) | Compatibilità |
|---------|--------------|--------------|---------------|
| **Endpoint SPARQL** | https://dati.camera.it/sparql | https://dati.senato.it/sparql | N/A |
| **Namespace Principale** | `ocd:` | `osr:` | ❌ Diverso |
| **Base URI** | http://dati.camera.it/ocd/ | http://dati.senato.it/osr/ | ❌ Diverso |
| **Licenza** | CC BY 4.0 | CC BY 3.0 | ⚠️ Diverso |

---

## Entità Principali

### Membri del Parlamento

| Proprietà | Camera (OCD) | Senato (OSR) | Note |
|-----------|--------------|--------------|------|
| **Classe** | `ocd:deputato` | `osr:Senatore` | ❌ Diverso |
| **Nome** | `foaf:firstName` | `foaf:firstName` | ✅ Uguale |
| **Cognome** | `foaf:surname` | `foaf:lastName` | ❌ **DIVERSO!** |
| **Foto** | `foaf:depiction` | `foaf:depiction` | ✅ Uguale |
| **Genere** | `foaf:gender` | `foaf:gender` | ✅ Uguale |

⚠️ **Attenzione critica**: Il cognome usa proprietà DIVERSE!

```sparql
# Camera - USA foaf:surname
?deputato foaf:surname ?cognome .

# Senato - USA foaf:lastName
?senatore foaf:lastName ?cognome .
```

### Mandate/Mandato

| Proprietà | Camera (OCD) | Senato (OSR) | Note |
|-----------|--------------|--------------|------|
| **Relazione** | `ocd:rif_mandatoCamera` | `osr:mandato` | ❌ Diverso |
| **Classe Mandato** | `ocd:mandatoCamera` | `ocd:mandatoSenato` | ⚠️ Entrambi namespace Camera! |
| **Data Inizio** | `ocd:startDate` | `osr:inizio` | ❌ Diverso |
| **Data Fine** | `ocd:endDate` | `osr:fine` | ❌ Diverso |

### Legislature

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Formato** | URI completo | Numero intero | ❌ **Molto diverso!** |
| **Esempio** | `<http://dati.camera.it/ocd/legislatura.rdf/repubblica_19>` | `19` | |
| **Tipo SPARQL** | IRI | `xsd:integer` | |
| **Confronto** | `?mandato ocd:rif_leg <URI>` | `?mandato osr:legislatura 19` | |

**Esempio pratico:**

```sparql
# Camera - URI completo
?mandato ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> .

# Senato - numero intero
?mandato osr:legislatura 19 .
```

---

## Atti Legislativi

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Classe Principale** | `ocd:atto` | `osr:Ddl` | ❌ Diverso |
| **Titolo** | `dc:title` o `ocd:titolo` | `osr:titolo` | ⚠️ Simile ma diverso namespace |
| **Data Presentazione** | `ocd:dataPresentazione` | `osr:dataPresentazione` | ⚠️ Stesso nome, diverso namespace |
| **Stato** | `ocd:stato` | `osr:statoDdl` | ❌ Diverso |
| **Firmatari** | Struttura complessa | `osr:Iniziativa` | ⚠️ Strutture diverse |

### Firme/Iniziative

**Camera (più complesso):**
```sparql
?atto ocd:rif_iniziativa ?iniziativa .
?iniziativa ocd:rif_deputati ?deputato ;
    ocd:primo_firmatario true .
```

**Senato (più semplice):**
```sparql
?ddl osr:iniziativa ?iniziativa .
?iniziativa osr:presentatore ?senatore ;
    osr:primoFirmatario true .
```

---

## Gruppi Parlamentari

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Classe Gruppo** | `ocd:gruppoParlamentare` | `ocd:gruppoParlamentare` | ✅ **Uguale!** |
| **Adesione** | `ocd:aderisce` | `ocd:aderisce` | ✅ **Uguale!** |
| **Classe Adesione** | `ocd:adesioneGruppo` | `ocd:adesioneGruppo` | ✅ **Uguale!** |
| **Gruppo nella relazione** | `ocd:rif_gruppoParlamentare` | `osr:gruppo` | ❌ Diverso |
| **Data Inizio** | `ocd:startDate` | `osr:inizio` | ❌ Diverso |
| **Data Fine** | `ocd:endDate` | `osr:fine` | ❌ Diverso |
| **Carica** | `ocd:carica` | `osr:carica` | ⚠️ Stesso nome, diverso namespace |

⚠️ **Nota importante**: Il Senato **riusa la classe Camera** per i gruppi parlamentari, ma usa proprietà OSR per le relazioni!

**Esempio Camera:**
```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>

?deputato ocd:aderisce ?adesione .
?adesione ocd:rif_gruppoParlamentare ?gruppo ;
    ocd:startDate ?inizio ;
    ocd:endDate ?fine .
```

**Esempio Senato:**
```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>

?senatore ocd:aderisce ?adesione .
?adesione osr:gruppo ?gruppo ;    # proprietà OSR!
    osr:inizio ?inizio ;           # proprietà OSR!
    osr:fine ?fine .               # proprietà OSR!

# Ma il gruppo è ancora ocd:gruppoParlamentare
?gruppo a ocd:gruppoParlamentare .
```

---

## Commissioni/Organi

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Classe** | `ocd:organo` | `osr:Commissione` | ❌ Diverso |
| **Membership** | `ocd:membro` | `osr:afferisce` | ❌ Diverso |
| **Classe Membership** | `ocd:appartenenzaOrgano` | `osr:Afferenza` | ❌ Diverso |

---

## Votazioni

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Classe** | `ocd:votazione` | `osr:Votazione` | ⚠️ Simile |
| **Oggetto** | `dc:description` | `rdfs:label` | ❌ Diverso |
| **Esito** | `ocd:esito` | `osr:esito` | ⚠️ Stesso nome |
| **Voti Favorevoli (count)** | `ocd:favorevoli` | `osr:favorevoli` | ⚠️ Stesso nome |
| **Voti Contrari (count)** | `ocd:contrari` | `osr:contrari` | ⚠️ Stesso nome |
| **Voto Individuale** | Relazione complessa | `osr:favorevole`, `osr:contrario`, `osr:astenuto` | ⚠️ Senato più semplice |

---

## Date e Temporalità

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Inizio generico** | `ocd:startDate` | `osr:inizio` | ❌ Diverso |
| **Fine generico** | `ocd:endDate` | `osr:fine` | ❌ Diverso |
| **Pattern attivo** | `FILTER(!bound(?endDate))` | `FILTER(!bound(?fine))` | ⚠️ Stesso pattern, nome diverso |

---

## Interventi/Speeches

| Aspetto | Camera (OCD) | Senato (OSR) | Note |
|---------|--------------|--------------|------|
| **Classe** | `ocd:intervento` | `osr:Intervento` | ⚠️ Simile |
| **Relazione** | Varie proprietà | `osr:interviene` | ❌ Diverso |

---

## Confronto Query: Membri in Carica

### Camera (Deputati)

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?deputato ?cognome ?nome ?legislatura
WHERE {
    ?deputato a ocd:deputato ;
        foaf:surname ?cognome ;                                           # ← foaf:surname
        foaf:firstName ?nome ;
        ocd:rif_mandatoCamera ?mandato .

    ?mandato ocd:rif_leg <http://dati.camera.it/ocd/legislatura.rdf/repubblica_19> ; # ← URI completo
        ocd:rif_elezione ?elezione .

    MINUS { ?mandato ocd:endDate ?fine }                                  # ← endDate
}
ORDER BY ?cognome ?nome
```

### Senato (Senatori)

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?senatore ?cognome ?nome ?legislatura
WHERE {
    ?senatore a osr:Senatore ;
        foaf:lastName ?cognome ;                                          # ← foaf:lastName
        foaf:firstName ?nome ;
        osr:mandato ?mandato .

    ?mandato osr:legislatura 19 ;                                         # ← numero intero
        osr:inizio ?inizio .

    OPTIONAL { ?mandato osr:fine ?fine }                                  # ← fine
    FILTER(!bound(?fine))
}
ORDER BY ?cognome ?nome
```

**Differenze chiave**:
1. `foaf:surname` vs `foaf:lastName`
2. URI legislatura vs numero intero
3. `endDate` vs `fine`
4. `MINUS` vs `FILTER(!bound())`

---

## Confronto Query: Gruppi Parlamentari

### Camera

```sparql
PREFIX ocd: <http://dati.camera.it/ocd/>

?deputato ocd:aderisce ?adesione .
?adesione a ocd:adesioneGruppo ;
    ocd:rif_gruppoParlamentare ?gruppo ;
    ocd:startDate ?inizio .

MINUS { ?adesione ocd:endDate ?fine }
```

### Senato

```sparql
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX ocd: <http://dati.camera.it/ocd/>

?senatore ocd:aderisce ?adesione .
?adesione a ocd:adesioneGruppo ;
    osr:gruppo ?gruppo ;        # ← proprietà OSR
    osr:inizio ?inizio .        # ← proprietà OSR

OPTIONAL { ?adesione osr:fine ?fine }
FILTER(!bound(?fine))
```

---

## Strategia per Codice Multi-Istituzione

### 1. Query Builder Separati

Ogni istituzione deve avere il proprio query builder a causa delle differenze sostanziali:

```typescript
// institutions/camera/queries/deputati.ts
class CameraDeputatiQueries {
  static getCurrentMembers() {
    return `
      PREFIX ocd: <http://dati.camera.it/ocd/>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>

      SELECT ?deputato ?cognome ?nome
      WHERE {
        ?deputato a ocd:deputato ;
          foaf:surname ?cognome ;  # Camera usa surname
          ...
      }
    `;
  }
}

// institutions/senato/queries/senatori.ts
class SenatoSenatoriQueries {
  static getCurrentMembers() {
    return `
      PREFIX osr: <http://dati.senato.it/osr/>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>

      SELECT ?senatore ?cognome ?nome
      WHERE {
        ?senatore a osr:Senatore ;
          foaf:lastName ?cognome ;  # Senato usa lastName
          ...
      }
    `;
  }
}
```

### 2. Interfacce Comuni per Risultati

Nonostante le query diverse, i risultati possono essere normalizzati:

```typescript
interface ParliamentMember {
  uri: string;
  firstName: string;
  lastName: string;
  legislature: string | number;
  institution: 'camera' | 'senato';
}
```

### 3. Helper per Date

```typescript
// Camera
function isCameraMandateActive(mandato: any): boolean {
  return !mandato.endDate;
}

// Senato
function isSenatoMandateActive(mandato: any): boolean {
  return !mandato.fine;
}

// Unificato
interface MandateChecker {
  isActive(mandato: any): boolean;
}

class CameraMandateChecker implements MandateChecker {
  isActive(mandato: any) { return !mandato.endDate; }
}

class SenatoMandateChecker implements MandateChecker {
  isActive(mandato: any) { return !mandato.fine; }
}
```

### 4. Configurazione Centralizzata

```typescript
// config/institutions.ts
export const INSTITUTIONS = {
  camera: {
    namespace: 'ocd',
    baseUri: 'http://dati.camera.it/ocd/',
    endpoint: 'https://dati.camera.it/sparql',
    memberClass: 'deputato',
    lastNameProperty: 'foaf:surname',      // ← diverso
    mandateStartProperty: 'ocd:startDate', // ← diverso
    mandateEndProperty: 'ocd:endDate',     // ← diverso
    legislatureFormat: 'uri',              // ← diverso
  },
  senato: {
    namespace: 'osr',
    baseUri: 'http://dati.senato.it/osr/',
    endpoint: 'https://dati.senato.it/sparql',
    memberClass: 'Senatore',
    lastNameProperty: 'foaf:lastName',     // ← diverso
    mandateStartProperty: 'osr:inizio',    // ← diverso
    mandateEndProperty: 'osr:fine',        // ← diverso
    legislatureFormat: 'integer',          // ← diverso
  }
};
```

---

## Checklist Migrazione Query

Quando converti una query da Camera a Senato:

- [ ] Cambia `ocd:` in `osr:` per namespace principale
- [ ] Cambia `ocd:deputato` in `osr:Senatore`
- [ ] Cambia `foaf:surname` in `foaf:lastName`
- [ ] Cambia URI legislatura in numero intero
- [ ] Cambia `ocd:startDate` in `osr:inizio`
- [ ] Cambia `ocd:endDate` in `osr:fine`
- [ ] Cambia `MINUS { ?x ocd:endDate ?y }` in `FILTER(!bound(?fine))`
- [ ] Mantieni `ocd:gruppoParlamentare` e `ocd:aderisce` per gruppi
- [ ] Verifica nomi proprietà date (Camera: generiche, Senato: specifiche)
- [ ] Adatta pattern voti individuali
- [ ] Cambia `ocd:atto` in `osr:Ddl` per atti legislativi

---

## Elementi Condivisi (Riutilizzabili)

### ✅ Ontologie Standard FOAF/DC

- `foaf:firstName` - Uguale
- `foaf:depiction` - Uguale
- `foaf:gender` - Uguale
- `dc:title` - Usato da entrambi

### ✅ Gruppi Parlamentari

- `ocd:gruppoParlamentare` - Classe condivisa
- `ocd:aderisce` - Proprietà condivisa
- `ocd:adesioneGruppo` - Classe condivisa

### ✅ Pattern SPARQL Generali

- `OPTIONAL { }` - Funziona uguale
- `FILTER()` - Funziona uguale
- `BIND()` - Funziona uguale
- `ORDER BY` - Funziona uguale
- `LIMIT` - Funziona uguale

---

## Raccomandazioni Implementazione

### ❌ Non Fare

1. **Non unificare i query builder** - Le differenze sono troppo profonde
2. **Non assumere compatibilità** - Testa sempre entrambe le istituzioni
3. **Non hardcodare namespace** - Usa configurazione

### ✅ Fare

1. **Moduli separati** per Camera e Senato
2. **Interfacce comuni** per risultati normalizzati
3. **Test separati** per ogni istituzione
4. **Documentazione esplicita** delle differenze
5. **Factory pattern** per creare query builder appropriato
6. **Type guards** per distinguere entità Camera/Senato

---

## Esempio Architettura Raccomandata

```
src/institutions/
├── camera/
│   ├── queries/        # Query Camera-specific
│   ├── types.ts        # Tipi Camera-specific
│   └── config.ts       # Config Camera
├── senato/
│   ├── queries/        # Query Senato-specific
│   ├── types.ts        # Tipi Senato-specific
│   └── config.ts       # Config Senato
└── common/
    ├── interfaces.ts   # Interfacce condivise
    ├── normalizers.ts  # Normalizzatori risultati
    └── factory.ts      # Factory per query builder
```

---

## Risorse

- **Camera Ontology**: https://dati.camera.it/ocd-ontologia-della-camera-dei-deputati
- **Senato Ontology**: https://dati.senato.it/DatiSenato/browse/21
- **FOAF Spec**: http://xmlns.com/foaf/spec/
- **Dublin Core**: http://purl.org/dc/elements/1.1/

## Conclusione

Le due ontologie sono **coordinate ma non identiche**. Il Senato riusa alcune classi Camera (gruppi parlamentari) ma ha un approccio diverso per:
- Naming properties (lastName vs surname)
- Date properties (inizio/fine vs startDate/endDate)
- Legislature (integer vs URI)
- Strutture dati (più semplici al Senato)

È **necessaria un'architettura modulare** con query builder separati per ogni istituzione.
