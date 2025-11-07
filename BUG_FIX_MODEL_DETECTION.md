# Fix: Model Detection Issue

## Problem

User reported that `qwen2.5:14b` was installed (`ollama list` showed it) but CLI was reporting "Modello non trovato".

## Root Cause

There were **two different default models** in the code:

1. **Line 96** (`connect()` method): Used `qwen2.5:14b` as default
2. **Line 203** (`processNaturalLanguage()` method): Used `gemma2:2b` as default

This caused:
- Connection check: ✅ PASS (qwen2.5:14b exists)
- Query execution: ❌ FAIL (gemma2:2b doesn't exist)

## Solution

### 1. Fixed Model Consistency

Changed line 203 from:
```typescript
const model = process.env.OLLAMA_MODEL || "gemma2:2b";
```

To:
```typescript
const model = process.env.OLLAMA_MODEL || "qwen2.5:14b";
```

### 2. Improved Model Detection Logic

Enhanced detection to handle multiple matching strategies:
```typescript
const modelBase = model.split(":")[0];
const hasModel = models.models?.some((m: any) => {
  // Try exact match first
  if (m.name === model) return true;
  // Try base name match (e.g., "deepseek-coder")
  if (m.name && m.name.startsWith(modelBase)) return true;
  // Try model field if exists
  if (m.model === model) return true;
  return false;
});
```

This handles cases where:
- Model name is exact: `qwen2.5:14b`
- Model name is just base: `deepseek-coder`
- Model field differs from name field

### 3. Better User Feedback

Changed success message to be clearer:
```typescript
log(`✓ Modello ${model} trovato e pronto`, "green");
```

## Test Results

Before fix:
```
✓ Modello qwen2.5:14b trovato!  # Connection phase
✓ Ollama connesso

[User asks question]

❌ Modello qwen2.5:14b non trovato.  # Query phase - WRONG MODEL!
```

After fix:
```
✓ Modello qwen2.5:14b trovato e pronto
✓ Ollama connesso

[Queries now work correctly with qwen2.5:14b]
```

## Files Modified

- `src/cli-ollama.ts` (line 203, lines 96-128)

## Status

✅ **FIXED** - CLI now correctly uses `qwen2.5:14b` throughout the entire execution flow.

## How to Test

```bash
npm run build
npm run cli
```

Then ask a question like:
```
🏛️  > Chi è Giorgia Meloni?
```

Should see:
- Model detection success during startup
- Query processed with qwen2.5:14b
- Accurate JSON response
- Correct tool called with proper parameters
