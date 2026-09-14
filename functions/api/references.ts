// Cloudflare Pages Function para consulta de precedentes arquitectónicos

interface ReferencesRequestBody {
  conceptos: string[];
  discurso?: string;
  provider?: string;
  apiKey?: string;
}

export async function onRequestPost(context: any) {
  try {
    const body: ReferencesRequestBody = await context.request.json();
    const { conceptos = [], discurso = '', provider = 'cloudflare', apiKey } = body;

    if (conceptos.length === 0) {
      return new Response(JSON.stringify({ error: 'Sin conceptos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Eres el asistente pedagógico de historia y teoría de la arquitectura del Sistema ARPV.
CONCEPTOS ACTIVOS SELECCIONADOS POR EL ALUMNO: ${conceptos.join(', ')}
${discurso ? `DISCURSO DEL PROYECTO: "${discurso}"` : ''}

REGLA ESTRICTA DE CONCORDANCIA CONCEPTUAL:
Identifica y retorna exactamente 3 obras maestras de la arquitectura construida que apliquen los conceptos activos.
CRÍTICO: El campo "conceptosClave" de CADA obra DEBE contener EXCLUSIVAMENTE conceptos que pertenezcan al conjunto de CONCEPTOS ACTIVOS proporcionado (${conceptos.join(', ')}). NO incluyas ningún concepto que no esté en esa lista.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
[
  {
    "obra": "Nombre de la obra",
    "arquitecto": "Nombre del arquitecto",
    "año": "Año de construcción",
    "ubicacion": "Ciudad, País",
    "explicacion": "Explicación rigurosa de 2 líneas sobre cómo se manifiestan los conceptos en la obra.",
    "conceptosClave": ["ConceptoActivo1", "ConceptoActivo2"]
  }
]`;

    let rawJson = '';

    // 1. Google Gemini
    if (provider === 'gemini' && apiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
      const data = await geminiRes.json();
      rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    // 2. OpenAI
    else if (provider === 'openai' && apiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un historiador de arquitectura. Responde únicamente en JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      const data = await openaiRes.json();
      rawJson = data.choices?.[0]?.message?.content || '';
    }
    // 3. Cloudflare Workers AI (B6 auditoría: el default del store es 'cloudflare')
    else if (context.env?.AI) {
      const aiRes = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      });
      rawJson = aiRes.response || '';
    }

    let references: any[] = [];
    if (rawJson) {
      try {
        const clean = rawJson.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        references = Array.isArray(parsed) ? parsed : parsed.references || [];
      } catch (e) {
        console.warn('Error parsing LLM JSON:', e);
      }
    }

    // Filtrar estrictamente conceptosClave para que solo contengan conceptos activos
    if (Array.isArray(references) && references.length > 0) {
      references = references.map((ref) => ({
        ...ref,
        conceptosClave: Array.isArray(ref.conceptosClave)
          ? ref.conceptosClave.filter((c: string) => conceptos.includes(c))
          : [],
      })).map((ref) => {
        if (!ref.conceptosClave || ref.conceptosClave.length === 0) {
          ref.conceptosClave = conceptos.slice(0, 2);
        }
        return ref;
      });
    }

    // Fallback pedagógico estrictamente con conceptos activos
    if (!references.length) {
      const topConcepts = conceptos.slice(0, 3);
      references = [
        {
          obra: 'Villa Savoye',
          arquitecto: 'Le Corbusier',
          año: '1929',
          ubicacion: 'Poissy, Francia',
          explicacion: `Articulación paradigmática donde convergen los conceptos de ${topConcepts.join(', ')} en un sistema volumétrico puro y tectonicidad moderna.`,
          conceptosClave: topConcepts,
        },
        {
          obra: 'Convento de La Tourette',
          arquitecto: 'Le Corbusier',
          año: '1960',
          ubicacion: 'Éveux, Francia',
          explicacion: `Masa horadada de hormigón que cualifica la luz y la gravedad integrando ${topConcepts.slice(0, 2).join(' y ')}.`,
          conceptosClave: topConcepts.slice(0, 2),
        },
        {
          obra: 'Pabellón de Barcelona',
          arquitecto: 'Mies van der Rohe',
          año: '1929',
          ubicacion: 'Barcelona, España',
          explicacion: `Fluidez espacial y rigor geométrico que expresan la pureza de ${conceptos[0] || 'la composición'}.`,
          conceptosClave: [conceptos[0] || 'Masa'],
        },
      ];
    }

    return new Response(JSON.stringify({ references }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
