# OCD - Rappresentazione Semantica e Documentazione

**Source:** https://dati.camera.it/ocd-rappresentazione-semantica-e-documentazione

## Overview
The Camera dei deputati (Italian Chamber of Deputies) publishes structured parliamentary data as Linked Open Data through the **OCD (Ontologia Camera dei Deputati)** ontology at `https://dati.camera.it/ocd/`.

## Core Architecture

**Ontology Base:** RDF/OWL format with namespace prefix `ocd`

**Primary URI Structure:** `http://dati.camera.it/ocd/` followed by class-specific patterns:
- Persons: `persona.rdf/p{id}`
- Deputies: `deputato.rdf/d{id}_{legislature}`
- Legislation: `attocamera.rdf/ac{legislature}_{number}`
- Parliamentary bodies: `organo.rdf/o{legislature}_{id}`

## Key Vocabularies Integrated

The ontology incorporates established international standards:

- **FOAF** (Friend of a Friend): Person descriptions and relationships
- **Dublin Core (dc/dcterms)**: Metadata for all resources
- **BIBO** (Bibliographic Ontology): Publication metadata
- **BIO** (Biography): Biographical events and dates
- **SKOS**: Classification schemes and controlled vocabularies
- **VoID**: Dataset descriptions
- **Organization Ontology**: Parliamentary body structures

## Data Resources Available

The system exposes 14 primary dataset categories:

1. **BPR** - Bibliography of Italian Parliament (100+ classification codes in SKOS format)
2. **Persons** - Biographical records linked to parliamentary mandates
3. **Deputies & Mandates** - Electoral terms and group affiliations
4. **Parliamentary Bodies** - Commissions, committees, and organizational structures
5. **Legislation** - Complete legislative workflow from proposal through passage
6. **Voting Records** - Electronic votes and individual deputy positions
7. **Sessions & Debates** - Assembly and commission proceedings with interventions
8. **Parliamentary Documents** - Official publications (DOC series)
9. **Inquiries & Motions** - VII-XVI legislatures
10. **Electoral Systems** - Historical and contemporary voting mechanisms
11. **Governments** - Executive branch data and ministerial assignments

## Technical Access Methods

**SPARQL Endpoint:** `https://dati.camera.it/sparql`

**Export Formats Supported:**
- RDF/XML, Turtle, N-Triples, JSON-LD
- CSV, TSV, SPARQL-specific formats (XML, JSON, JavaScript)

**RDF Serialization Example:**
Resources support content negotiation returning both human-readable HTML and machine-readable RDF based on HTTP Accept headers.

## Alignment Strategy

The ontology achieves interoperability through links to external datasets:
- **DBpedia/DBpedia-IT**: Person and location entities
- **Geonames**: Geographic references
- **Wikidata, Yago, Freebase**: Entity disambiguation
- **ACS (Italian Cultural Heritage Archives)**: Government entities
- **VIAF**: Author identifiers

## Metadata Standards

All resources include Dublin Core descriptors (title, date, type, description) and provenance information. Property `dcterms:isReferencedBy` links to authoritative source pages on camera.it.

## URI Resolution Philosophy

Following "Cool URIs for the Semantic Web" principles: all OCD URIs perform "semantic resolution" returning both human-readable and machine-readable content. Validation performed using Vapour tool.

## Temporal Data Structure

Classes incorporate date ranges using `ocd:startDate` and `ocd:endDate` properties (YYYYMMDD format), enabling historical tracking across 19+ legislative periods from the Italian kingdom through the Republic.
