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
CONCEPTOS ACTIVOS: ${conceptos.join(', ')}
${discurso ? `DISCURSO: "${discurso}"` : ''}

INSTRUCCIÓN:
Identifica y retorna exactamente 3 obras maestras de la arquitectura construida que apliquen y compartan estos conceptos de forma ejemplar.
Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
[
  {
    "obra": "Nombre de la obra",
    "arquitecto": "Nombre del arquitecto",
    "año": "Año de construcción",
    "ubicacion": "Ciudad, País",
    "explicacion": "Explicación rigurosa de 2 líneas sobre cómo se manifiestan los conceptos en la obra.",
    "conceptosClave": ["Concepto1", "Concepto2"]
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
    // 3. Cloudflare Workers AI (B6 auditoría: el default del store es 'cloudflare'
    // pero esta ruta no estaba implementada — se añade igual que en discourse.ts)
    else if (context.env?.AI) {
      const aiRes = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      });
      rawJson = aiRes.response || '';
    }

    let references = [];
    if (rawJson) {
      try {
        const clean = rawJson.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        references = Array.isArray(parsed) ? parsed : parsed.references || [];
      } catch (e) {
        console.warn('Error parsing LLM JSON:', e);
      }
    }

    // Fallback pedagógico
    if (!references.length) {
      references = [
        {
          obra: 'Villa Savoye',
          arquitecto: 'Le Corbusier',
          año: '1929',
          ubicacion: 'Poissy, Francia',
          explicacion: `Ejemplifica de manera canónica los conceptos de ${conceptos.slice(0, 2).join(' y ')} mediante pilotis, rampa procesional y terraza jardín.`,
          conceptosClave: conceptos.slice(0, 3),
        },
        {
          obra: 'Termas de Vals',
          arquitecto: 'Peter Zumthor',
          año: '1996',
          ubicacion: 'Vals, Suiza',
          explicacion: `Masa monolítica excavada que cualifica la luz cenital y la textura material del gneis en un recorrido sensorial continuo.`,
          conceptosClave: ['Monolítico', 'Sustracción', 'Luz'],
        },
        {
          obra: 'Pabellón de Barcelona',
          arquitecto: 'Mies van der Rohe',
          año: '1929',
          ubicacion: 'Barcelona, España',
          explicacion: `Fluidez espacial generada por planos exentos y pilares cruciformes que disuelven los límites sobre un basamento de travertino.`,
          conceptosClave: ['Horizontalidad', 'Abierto', 'Plano'],
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
