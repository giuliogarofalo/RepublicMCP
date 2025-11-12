# Camera dei Deputati - Ontology Diagram

## TypeScript Type System Overview

This diagram represents the TypeScript type system based on the OCD (Ontologia Camera dei Deputati) ontology.

```mermaid
classDiagram
    %% Core Entities
    class Persona {
        +string uri
        +string firstName
        +string surname ⚠️ Not lastName
        +string? gender
        +string? birthDate
        +string? birthPlace
        +string? photo
    }

    class Deputato {
        +string uri
        +Persona person
        +number legislature
        +string legislatureUri
        +string firstName
        +string surname
        +Mandato[] mandates
        +GruppoParlamentare? currentGroup
        +Commissione[] commissions
    }

    class Mandato {
        +string uri
        +Elezione? election
        +string? start
        +string? end
        +string? validationDate
        +string? constituency
    }

    class Elezione {
        +string uri
        +string? constituency
        +string? list
        +string? date
    }

    %% Parliamentary Acts
    class Atto {
        +string uri
        +string identifier
        +string title
        +string? actType
        +number legislature
        +string presentationDate
        +boolean? concluded
        +IterPhase[] iter
        +Deputato[] proponents
        +Deputato? firstSigner
    }

    class IterPhase {
        +string uri
        +string phase
        +string date
        +string? description
    }

    %% Voting
    class Votazione {
        +string uri
        +string identifier
        +string? description
        +string date
        +number? votesFor
        +number? votesAgainst
        +number? abstentions
        +boolean? approved
        +string? relatedAct
    }

    class Voto {
        +string uri
        +string voting
        +string deputy
        +VoteExpression expression
        +string? absenceReason
    }

    %% Groups and Organizations
    class GruppoParlamentare {
        +string uri
        +string officialName
        +string? abbreviation
        +number legislature
        +string? start
        +string? end
        +Deputato[] members
        +Incarico[] leadership
    }

    class AdesioneGruppo {
        +string uri
        +string deputy
        +string group
        +string start
        +string? end
    }

    class Organo {
        +string uri
        +string name
        +string? organType
        +number legislature
        +Membro[] members
    }

    class Membro {
        +string uri
        +string organ
        +string deputy
        +string? role
        +string? start
        +string? end
    }

    %% Government
    class Governo {
        +string uri
        +string name
        +string start
        +string? end
        +Persona? primeMinister
        +MembroGoverno[] members
    }

    class MembroGoverno {
        +string uri
        +string person
        +string government
        +string position
        +string? delegation
        +string? start
        +string? end
    }

    %% Debates
    class Intervento {
        +string uri
        +string deputy
        +string discussion
        +string? text
        +string? date
    }

    class Discussione {
        +string uri
        +string session
        +string topic
        +Intervento[] interventions
    }

    class Seduta {
        +string uri
        +string sessionNumber
        +string date
        +string? assembly
        +number legislature
    }

    %% Relationships
    Deputato --> Persona : extends
    Deputato --> Mandato : has
    Mandato --> Elezione : election
    Deputato --> GruppoParlamentare : member of
    Deputato --> Organo : member of
    Deputato --> Atto : presents
    Atto --> IterPhase : has phases
    Atto --> Votazione : voted on
    Votazione --> Voto : has votes
    Voto --> Deputato : cast by
    GruppoParlamentare --> AdesioneGruppo : memberships
    Organo --> Membro : memberships
    Governo --> MembroGoverno : members
    MembroGoverno --> Persona : person
    Discussione --> Intervento : interventions
    Intervento --> Deputato : speaker
    Discussione --> Seduta : session

    %% Styling
    classDef main-entity fill:#e1f5ff,stroke:#0066cc,stroke-width:3px
    class Deputato:::main-entity
    class Atto:::main-entity
    class Votazione:::main-entity
    class GruppoParlamentare:::main-entity
    class Governo:::main-entity
```

## Key Characteristics

### ⚠️ Camera-Specific Features

1. **Cognome**: Uses `foaf:surname` (NOT `foaf:lastName`)
2. **Legislature**: Full URI format `http://dati.camera.it/ocd/legislatura.rdf/repubblica_19`
3. **Dates**: Format YYYYMMDD (integer)
4. **Mandates**: Use `MINUS { ?mandato ocd:endDate ?fine }` for active deputies

## Core Classes

| Class | Description | Key Properties |
|-------|-------------|----------------|
| **Deputato** | Deputy | surname, firstName, mandates, currentGroup |
| **Atto** | Parliamentary Act | title, presentationDate, proponents, iter |
| **Votazione** | Voting | date, votesFor, votesAgainst, approved |
| **GruppoParlamentare** | Parliamentary Group | officialName, abbreviation, members |
| **Governo** | Government | name, start, primeMinister, members |
| **Organo** | Commission/Organ | name, organType, members |
| **Intervento** | Speech/Intervention | deputy, discussion, text |

## Hierarchy

```
Legislatura (19)
├── Deputato
│   ├── Mandato → Elezione
│   ├── AdesioneGruppo → GruppoParlamentare
│   └── Membro → Organo
├── Atto
│   ├── IterPhase
│   └── Votazione → Voto
├── Governo
│   └── MembroGoverno
└── Seduta
    └── Discussione → Intervento
```

## Usage in RepublicMCP

These TypeScript types are used throughout the codebase:
- `src/institutions/camera/ontology/types.ts` - Type definitions
- `src/institutions/camera/queries/*.ts` - SPARQL query builders
- `src/institutions/camera/tools/index.ts` - MCP tool implementations

## Example Type Usage

```typescript
import { Deputato, DeputatoSearchParams } from './ontology/types';

const searchParams: DeputatoSearchParams = {
  surname: 'Meloni',
  legislature: 19,
  active: true,
  limit: 10
};

// Query returns Deputato[]
const deputati: Deputato[] = await client.searchDeputies(searchParams);
```

---

**Generated from**: `src/institutions/camera/ontology/types.ts`
**Last updated**: 2025-11-12
