import { RewriteTone } from "../types";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Application will not function correctly.");
}

const MODEL_NAME = 'openai/gpt-4o-mini';

export const rewriteTextStream = async (
  text: string,
  tone: RewriteTone,
  onChunk: (text: string) => void
): Promise<void> => {

  const systemInstruction = `
    Actúa como un redactor académico de élite y especialista en evasión de detección de IA en Español Latinoamericano.

    OBJETIVO CRÍTICO:
    El texto resultante debe ser 100% INDETECTABLE por los siguientes detectores de Inteligencia Artificial:
    1. Copyleaks
    2. GPTZero
    3. ZeroGPT
    4. Originality.ai
    5. Scribbr
    6. Sidekicker
    7. Quillbot

    INSTRUCCIONES OBLIGATORIAS:
    
    1. LIMPIEZA VISUAL (FORMATO):
       - Elimina obsesivamente cualquier doble espacio, tabulación extraña o salto de línea injustificado.
       - El texto debe tener un espaciado tipográfico perfecto (un solo espacio entre palabras).

    2. ESTRATEGIA DE HUMANIZACIÓN (EVASIÓN):
       - ALTA PERPLEJIDAD: Usa palabras menos predecibles pero contextualmente perfectas.
       - ALTA BURSTINESS: Alterna drásticamente la longitud y estructura de las oraciones. Combina frases cortas y contundentes con oraciones compuestas complejas.
       - EVITA MARCADORES DE IA: No uses conectores sobreutilizados por LLMs (como "En conclusión", "Cabe destacar", "Por lo tanto", "Es importante resaltar") a menos que se sientan absolutamente orgánicos y necesarios.
       - NATURALIDAD: El texto debe sonar escrito por un humano educado, con matices y fluidez natural.

    3. CONTEXTO:
       - Tono: ${tone === RewriteTone.ACADEMIC ? 'Académico Riguroso (Nivel Tesis Doctoral)' : 'Formal Profesional (Nivel Corporativo/Ejecutivo)'}.
       - Idioma: Español Latinoamericano Neutro.

    SALIDA:
    - Devuelve SOLAMENTE el texto procesado.
    - NO incluyas Markdown de código (\`\`\`), ni saludos, ni notas.
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'http://localhost:3000',
        'X-Title': 'Redactor Académico Pro'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: text }
        ],
        temperature: 1.0,
        top_p: 0.95,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
};