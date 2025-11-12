# Esempi Pratici - RepublicMCP

## ✅ Sistema Funzionante e Testato

Il sistema è stato testato e funziona correttamente! Ecco esempi pratici con deputati **reali** della XIX legislatura.

## Esempi con Risultati Garantiti

### 1. Cerca Deputato - Giorgia Meloni

**Input**:
```
🏛️  > Cerca deputati con cognome Meloni
```

**Output Atteso**:
```
✓ Risposta ricevuta
📊 Trovati 1 risultati:

1.
   deputato: http://dati.camera.it/ocd/deputato.rdf/d302103_19
   cognome: MELONI
   nome: GIORGIA
   genere: female
```

**Query NL Alternative**:
- "Chi è Giorgia Meloni?"
- "Trova Meloni"
- "Info su Meloni"

---

### 2. Ultime Votazioni

**Input**:
```
🏛️  > Ultime 5 votazioni
```

**Output Atteso**:
```
📊 Trovati 5 risultati

[Lista delle ultime 5 votazioni con date, titoli, favorevoli, contrari, astenuti]
```

**Query NL Alternative**:
- "Mostrami le votazioni recenti"
- "Ultime 10 votazioni"
- "Votazioni di oggi"

---

### 3. Gruppi Parlamentari

**Input**:
```
🏛️  > Quali sono i gruppi parlamentari?
```

**Output Atteso**:
```
📊 Trovati N risultati

1. Fratelli d'Italia (FDI)
2. Partito Democratico (PD)
3. Movimento 5 Stelle (M5S)
4. Forza Italia (FI)
5. Lega (LEGA)
...
```

**Query NL Alternative**:
- "Gruppi parlamentari"
- "Lista dei gruppi"
- "Partiti alla Camera"

---

### 4. Atti Parlamentari

**Input**:
```
🏛️  > Cerca atti sull'ecologia
```

**Output Atteso**:
```
📊 Trovati N risultati

[Lista atti legislativi con titoli contenenti "ecologia"]
```

**Query NL Alternative**:
- "Leggi sull'ambiente"
- "Progetti di legge sulla sanità"
- "Atti sul lavoro"

---

### 5. Commissioni Parlamentari

**Input**:
```
🏛️  > Lista delle commissioni
```

**Output Atteso**:
```
📊 Trovati N risultati

[Elenco commissioni permanenti e temporanee]
```

---

### 6. Governi

**Input**:
```
🏛️  > Info sui governi
```

**Output Atteso**:
```
📊 Trovati N risultati

[Lista governi con date inizio/fine]
```

---

## Nuove Query Avanzate (8 tool aggiunti)

### 7. Atti Presentati da Deputato

**Input**:
```
🏛️  > Quali atti ha presentato Meloni?
```

**Tool Chiamato**: `get_atti_deputato`

**Output Atteso**: Lista atti con ruolo (primo firmatario/cofirmatario)

---

### 8. Interventi su Argomento

**Input**:
```
🏛️  > Interventi sull'immigrazione
```

**Tool Chiamato**: `get_interventi_per_argomento`

**Output Atteso**: Lista interventi in aula con deputato, data, seduta

---

### 9. Statistiche Voti Deputato

**Input**:
```
🏛️  > Statistiche voti Meloni
```

**Tool Chiamato**: `get_statistiche_voto_deputato`

**Output Atteso**: Conteggi favorevoli, contrari, astenuti, assenze

---

### 10. Incarichi di Governo

**Input**:
```
🏛️  > Chi sono i ministri deputati?
```

**Tool Chiamato**: `get_incarichi_governo_deputati`

**Output Atteso**: Lista deputati con incarichi governativi

---

### 11. Atti con Iter Completo

**Input**:
```
🏛️  > Mostrami atti con iter completo
```

**Tool Chiamato**: `get_atti_con_fasi`

**Output Atteso**: Atti con tutte le fasi legislative e date approvazione

---

### 12. Espressioni di Voto Dettagliate

**Input**:
```
🏛️  > Voti della votazione 001 del 20240315
```

**Tool Chiamato**: `get_espressioni_voto`

**Output Atteso**: Come ha votato ogni deputato in quella specifica votazione

---

## Deputati Testati e Funzionanti

Questi cognomi sono **garantiti** di esistere nella XIX legislatura:

### ✅ Deputati Confermati
- **MELONI** Giorgia (Presidente del Consiglio + Deputato)
- **AIELLO** Davide
- **ALBANO** Lucia
- **ALIFANO** Enrica
- **ALMICI** Cristina

### ❌ NON Funzionano (Non alla Camera)
- ~~SALVINI~~ (È al Senato)
- ~~LA RUSSA~~ (È al Senato - Presidente)
- ~~ROSSI~~ (Probabilmente non presente nella XIX leg)

## Come Trovare Altri Deputati

1. Vai su: https://www.camera.it/leg19/1
2. Clicca "Deputati"
3. Cerca per cognome
4. Usa il cognome esatto nel CLI

## Workflow Completo - Analisi Deputato

```
🏛️  > Chi è Giorgia Meloni?
→ Trova info base

🏛️  > Quali atti ha presentato Meloni?
→ Lista progetti di legge e mozioni

🏛️  > Statistiche voti Meloni
→ Comportamento in votazioni

🏛️  > Ha incarichi di governo?
→ Ruoli ministeriali

🏛️  > Interventi di Meloni sull'immigrazione
→ Discorsi in aula per argomento
```

## Workflow Completo - Analisi Tematica

```
🏛️  > Cerca atti sulla sanità
→ Progetti di legge sul tema

🏛️  > Interventi sulla sanità
→ Deputati che hanno parlato del tema

🏛️  > Mostrami le fasi di questi atti
→ Iter legislativo completo

🏛️  > Votazioni sulla sanità
→ Come hanno votato
```

## Tips per Query Efficaci

### ✅ Buone Query
- "Cerca deputati con cognome Meloni"
- "Ultime 10 votazioni"
- "Atti sull'ambiente"
- "Chi ha parlato di immigrazione"

### ❌ Query Problematiche
- "Cerca Rossi" (troppo generico, potrebbe non esistere)
- "Info su Salvini" (è al Senato!)
- "Deputati romani" (filtro geografico non diretto)

## Comandi Speciali CLI

```
/tools    - Lista di tutti i 19 tool MCP disponibili
/help     - Mostra aiuto
/clear    - Pulisci conversazione
/quit     - Esci
```

## Formato Date per Query Avanzate

```
YYYYMMDD  → 20240315 (15 marzo 2024)
YYYYMM    → 202403 (marzo 2024)
YYYY      → 2024 (tutto l'anno)
```

## Legislature Disponibili

```
repubblica_19  → XIX Legislatura (2022-oggi) [DEFAULT]
repubblica_18  → XVIII Legislatura (2018-2022)
repubblica_17  → XVII Legislatura (2013-2018)
repubblica_16  → XVI Legislatura (2008-2013)
```

Per query storiche:
```
🏛️  > Deputati della XVIII legislatura
```

## Performance

- Query semplici: ~2-5 secondi
- Query complesse: ~5-10 secondi
- Query con aggregazioni: ~10-15 secondi

## Troubleshooting

### "Trovati 0 risultati"

**Possibili cause**:
1. Deputato non alla Camera (controlla sia deputato, non senatore)
2. Cognome errato o incompleto
3. Non presente nella XIX legislatura
4. Query filtri troppo restrittivi

**Soluzione**:
- Verifica su https://www.camera.it
- Usa cognomi testati (vedi lista sopra)
- Prova senza filtri aggiuntivi

### "Errore nell'analisi"

**Causa**: Il modello AI non ha capito la domanda

**Soluzione**: Riformula in modo più chiaro
- Invece di: "parlami di ecologia"
- Usa: "cerca atti sull'ecologia"

### Modello AI lento

**Normale**: codellama:7b-instruct può richiedere 5-15 secondi

**Alternative più veloci**:
```bash
export OLLAMA_MODEL=qwen2.5:3b
npm run cli
```

## Prossimi Passi

1. ✅ Testa con deputati confermati (Meloni, Aiello, etc)
2. ✅ Esplora i nuovi tool avanzati
3. ✅ Combina query per analisi complete
4. ✅ Consulta ADVANCED_QUERIES.md per dettagli

---

**Il sistema è pronto all'uso!** 🚀

Inizia con:
```bash
npm run cli
```

E prova:
```
🏛️  > Chi è Giorgia Meloni?
```
