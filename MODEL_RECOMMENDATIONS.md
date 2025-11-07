# Raccomandazioni Modelli Ollama per RepublicMCP

## Problema con qwen2.5:14b

Il modello `qwen2.5:14b` è **troppo piccolo** (270 milioni di parametri) per:
- Comprendere domande complesse
- Generare JSON strutturati correttamente
- Mappare domande naturali → tool calls

**Risultato**: Risposte poco accurate, JSON malformati, parametri sbagliati.

## Modelli Consigliati

### 🌟 gemma2:2b (CONSIGLIATO)

```bash
ollama pull gemma2:2b
```

**Pro**:
- ✅ 2 miliardi di parametri (7x più grande di 270m)
- ✅ Veloce su laptop (~2-3 secondi)
- ✅ Buona comprensione italiano
- ✅ Ottimo per JSON strutturati
- ✅ Memoria richiesta: ~2GB RAM

**Contro**:
- ⚠️ A volte necessita domande chiare

**Valutazione**: 8/10 - Miglior compromesso velocità/qualità

---

### ⚡ llama3.2:3b

```bash
ollama pull llama3.2:3b
```

**Pro**:
- ✅ 3 miliardi di parametri
- ✅ Ottima comprensione contesto
- ✅ Meta/Facebook, molto affidabile
- ✅ Buon italiano

**Contro**:
- ⚠️ Leggermente più lento (~4-5 sec)
- ⚠️ RAM: ~3GB

**Valutazione**: 8.5/10 - Ottimo bilanciamento

---

### 🎯 qwen2.5:3b

```bash
ollama pull qwen2.5:3b
```

**Pro**:
- ✅ 3 miliardi di parametri
- ✅ **ECCELLENTE per task strutturati**
- ✅ Ottimo con JSON e function calling
- ✅ Multilingua (CN/EN/IT)

**Contro**:
- ⚠️ Italiano meno naturale di gemma/llama
- ⚠️ RAM: ~3GB

**Valutazione**: 9/10 - Migliore per tool calling!

---

### 🏆 mistral:7b

```bash
ollama pull mistral:7b
```

**Pro**:
- ✅ 7 miliardi di parametri
- ✅ Qualità superiore
- ✅ Ottima comprensione
- ✅ Pochi errori

**Contro**:
- ❌ Lento (~8-10 sec)
- ❌ RAM: ~6GB
- ❌ Non ideale per laptop standard

**Valutazione**: 9.5/10 - Migliore accuratezza, ma pesante

---

## Confronto Prestazioni

| Modello | Parametri | Velocità | Qualità | RAM | Voto |
|---------|-----------|----------|---------|-----|------|
| qwen2.5:14b | 270M | ⚡⚡⚡⚡⚡ | ⭐⭐ | 512MB | 4/10 ❌ |
| **gemma2:2b** | 2B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 2GB | **8/10** ✅ |
| llama3.2:3b | 3B | ⚡⚡⚡ | ⭐⭐⭐⭐ | 3GB | 8.5/10 ✅ |
| **qwen2.5:3b** | 3B | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 3GB | **9/10** ⭐ |
| mistral:7b | 7B | ⚡⚡ | ⭐⭐⭐⭐⭐ | 6GB | 9.5/10 🏆 |

## Come Cambiare Modello

### Metodo 1: Variabile d'ambiente

```bash
# Una volta
export OLLAMA_MODEL=gemma2:2b
npm run cli

# Oppure inline
OLLAMA_MODEL=qwen2.5:3b npm run cli
```

### Metodo 2: File .env

Crea `.env` nella root del progetto:

```bash
OLLAMA_MODEL=qwen2:2b
```

Poi avvia normalmente:
```bash
npm run cli
```

### Metodo 3: Modifica codice

Modifica `src/cli-ollama.ts`:

```typescript
const model = process.env.OLLAMA_MODEL || "gemma2:2b"; // Cambia qui
```

## Test Comparativo

### Domanda: "Chi è il presidente del consiglio?"

**qwen2.5:14b** (❌ MALE):
```json
{
  "tool": "search_deputati",
  "params": {"cognome": "Meloni", "cognome": "Demosi"}, // ERRORE: chiave duplicata!
  "reasoning": "..."
}
```

**gemma2:2b** (✅ BUONO):
```json
{
  "tool": "search_deputati",
  "params": {"cognome": "Meloni"},
  "reasoning": "search for Meloni who is PM"
}
```

**qwen2.5:3b** (✅ OTTIMO):
```json
{
  "tool": "search_deputati",
  "params": {"cognome": "Meloni", "nome": "Giorgia"},
  "reasoning": "Current Italian PM is Giorgia Meloni"
}
```

### Domanda: "Ultime 3 leggi sull'ecologia"

**qwen2.5:14b** (❌ MALE):
```json
{
  "tool": "search_deputati", // TOOL SBAGLIATO!
  "params": {"cognome": "Meloni"},
  "reasoning": "..."
}
```

**gemma2:2b** (✅ BUONO):
```json
{
  "tool": "search_atti",
  "params": {"titolo": "ecologia", "limit": 3},
  "reasoning": "search acts about ecology"
}
```

**qwen2.5:3b** (✅ OTTIMO):
```json
{
  "tool": "search_atti",
  "params": {"titolo": "ecologia", "tipo": "legge", "limit": 3},
  "reasoning": "search for laws (legge) about ecology"
}
```

## Raccomandazione Finale

### Per laptop standard (8-16GB RAM):
```bash
ollama pull gemma2:2b
OLLAMA_MODEL=gemma2:2b npm run cli
```

### Per PC potenti (16GB+ RAM):
```bash
ollama pull qwen2.5:3b
OLLAMA_MODEL=qwen2.5:3b npm run cli
```

### Per massima qualità (32GB+ RAM):
```bash
ollama pull mistral:7b
OLLAMA_MODEL=mistral:7b npm run cli
```

## Troubleshooting

### "Modello troppo lento"
→ Usa `gemma2:2b`

### "Risposte poco accurate"
→ Passa a `qwen2.5:3b` o `mistral:7b`

### "Out of memory"
→ Torna a `gemma2:2b` o aumenta RAM

### "Modello non trovato"
```bash
ollama pull gemma2:2b
```

---

**TL;DR**: Usa `gemma2:2b` o `qwen2.5:3b`, NON `qwen2.5:14b`!
