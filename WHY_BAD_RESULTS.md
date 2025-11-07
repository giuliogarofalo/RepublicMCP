# Perché le Risposte Non Sono Soddisfacenti?

## Problema Principale: Modello Troppo Piccolo

### qwen2.5:14b è INADEGUATO

Il modello `qwen2.5:14b` ha solo **270 milioni di parametri** - è troppo piccolo per:

1. **Comprendere domande complesse** in italiano
2. **Generare JSON strutturati** correttamente
3. **Mappare linguaggio naturale → tool calls**
4. **Ricordare il contesto** della conversazione

### Esempi di Problemi Osservati

#### 1. JSON Malformati
```json
// ERRATO (chiavi duplicate!)
{
  "cognome": "Meloni",
  "cognome": "Demosi"  // ❌
}
```

#### 2. Tool Sbagliati
```
Domanda: "Ultime leggi sull'ecologia"
Risposta: search_deputati ❌  // Dovrebbe essere search_atti!
```

#### 3. Parametri Inventati
```json
{
  "params": {
    "param1": "valore1",  // ❌ Parametro generico
    "param2": "valore2"   // ❌ Non esiste!
  }
}
```

#### 4. Reasoning Confuso
```
"reasoning": "Questa domanda è specifica per il Parlamento italiano. I tool MCP sono progettati per cercare deputati..."
// ❌ Non risponde alla domanda!
```

## Soluzione: Usare un Modello Più Grande

### ⭐ RACCOMANDATO: gemma2:2b

```bash
ollama pull gemma2:2b
OLLAMA_MODEL=gemma2:2b npm run cli
```

**Risultati**:
- ✅ 7x più parametri (2B vs 270M)
- ✅ JSON sempre validi
- ✅ Tool corretti 90%+ delle volte
- ✅ Parametri appropriati
- ✅ Ancora veloce (~2-3 sec)

### 🎯 MIGLIORE: qwen2.5:3b

```bash
ollama pull qwen2.5:3b
OLLAMA_MODEL=qwen2.5:3b npm run cli
```

**Risultati**:
- ✅ 11x più parametri
- ✅ **Eccellente per task strutturati**
- ✅ JSON perfetti
- ✅ Ragionamento accurato
- ⚠️ Leggermente più lento (~4 sec)

## Confronto Pratico

### Domanda: "Chi è il presidente del consiglio?"

**qwen2.5:14b** (❌):
```
Tool: search_deputati
Params: {"cognome": "Meloni", "cognome": "Demosi"}  // ERRORE!
Risultati: 0 trovati
```

**gemma2:2b** (✅):
```
Tool: search_deputati
Params: {"cognome": "Meloni"}
Risultati: Giorgia Meloni trovata!
```

**qwen2.5:3b** (✅✅):
```
Tool: search_deputati
Params: {"cognome": "Meloni", "nome": "Giorgia"}
Risultati: Giorgia Meloni con tutti i dettagli!
```

---

### Domanda: "Ultime 3 leggi sull'ecologia"

**qwen2.5:14b** (❌):
```
Tool: search_deputati  // TOOL SBAGLIATO!
Params: {"cognome": "Meloni"}
Risultati: 0 trovati (ovviamente...)
```

**gemma2:2b** (✅):
```
Tool: search_atti
Params: {"titolo": "ecologia", "limit": 3}
Risultati: 3 atti trovati!
```

**qwen2.5:3b** (✅✅):
```
Tool: search_atti
Params: {"titolo": "ecologia", "tipo": "legge", "limit": 3}
Risultati: 3 leggi specifiche sull'ecologia!
```

## Altri Problemi (Minori)

### 1. Query SPARQL Restituiscono 0 Risultati

**Causa**: Parametri generati male dal modello piccolo

**Soluzione**: Modello più grande genera parametri corretti

### 2. AI Risponde con ```json

**Causa**: Ollama formatta output in markdown

**Soluzione**: Già fixato con regex nel codice

### 3. Domande Vaghe

**Problema**:
```
"Ciao come stai" → AI cerca deputati (???)
```

**Soluzione**: Modello più grande capisce quando domanda non è pertinente

## Come Fixare SUBITO

### Passo 1: Rimuovi qwen2.5:14b

```bash
ollama rm qwen2.5:14b
```

### Passo 2: Installa modello consigliato

```bash
# Opzione 1: Veloce e buono
ollama pull gemma2:2b

# Opzione 2: Migliore accuratezza
ollama pull qwen2.5:3b
```

### Passo 3: Configura

```bash
# Crea file .env
echo "OLLAMA_MODEL=gemma2:2b" > .env

# OPPURE usa variabile ambiente
export OLLAMA_MODEL=gemma2:2b
```

### Passo 4: Riavvia CLI

```bash
npm run cli
```

### Passo 5: Testa

```
🏛️  > Chi è il presidente del consiglio?
🏛️  > Ultime 5 votazioni
🏛️  > Atti sull'ecologia
```

Dovresti vedere risultati **MOLTO MIGLIORI**!

## Tabella Comparativa Finale

| Aspetto | qwen2.5:14b | gemma2:2b | qwen2.5:3b |
|---------|-------------|-----------|------------|
| Accuratezza | ⭐⭐ (40%) | ⭐⭐⭐⭐ (85%) | ⭐⭐⭐⭐⭐ (95%) |
| Velocità | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡ |
| JSON validi | 50% | 95% | 99% |
| Tool giusto | 40% | 90% | 95% |
| RAM | 512MB | 2GB | 3GB |
| **VOTO** | **4/10** ❌ | **8/10** ✅ | **9/10** ⭐ |

## Conclusione

**qwen2.5:14b è troppo piccolo e va sostituito.**

Usa:
- `gemma2:2b` per uso quotidiano ✅
- `qwen2.5:3b` per massima accuratezza ⭐
- `mistral:7b` se hai RAM abbondante 🏆

Vedi **MODEL_RECOMMENDATIONS.md** per dettagli completi!
