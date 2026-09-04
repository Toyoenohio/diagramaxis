// Cloudflare Pages Function para síntesis de discurso proyectual arquitectónico

interface DiscourseRequestBody {
  conceptos: string[];
  artefactos: string[];
  relaciones: string[];
  provider?: string;
  apiKey?: string;
}

export async function onRequestPost(context: any) {
  try {
    const body: DiscourseRequestBody = await context.request.json();
    const { conceptos = [], artefactos = [], relaciones = [], provider = 'cloudflare', apiKey } = body;

    const activeList = [...conceptos, ...artefactos];
    if (activeList.length === 0) {
      return new Response(JSON.stringify({ error: 'Sin conceptos activos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Eres el asistente pedagógico del Sistema Proyectual ARPV del arquitecto Angel Ramón Peña Villegas.
CONCEPTOS ARQUITECTÓNICOS ACTIVOS: ${conceptos.join(', ')}
ARTEFACTOS DE LA BIBLIOTECA: ${artefactos.length ? artefactos.join(', ') : 'ninguno'}
RELACIONES SEMÁNTICAS: ${relaciones.length ? relaciones.join('; ') : 'ninguna'}

INSTRUCCIÓN:
Genera un discurso narrativo arquitectónico riguroso y continuo de entre 3 a 5 oraciones.
Incorpora los conceptos por su nombre exacto en el flujo de la prosa, explicando la lógica espacial, la relación con el usuario y la forma resultante.
Sin listas, sin viñetas, sin títulos. Solo prosa arquitectónica pura.`;

    let generatedText = '';

    // 1. Google Gemini
    if (provider === 'gemini' && apiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
          }),
        }
      );
      const data = await geminiRes.json();
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    // 2. Anthropic Claude
    else if (provider === 'anthropic' && apiKey) {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await claudeRes.json();
      generatedText = data.content?.[0]?.text || '';
    }
    // 3. OpenAI
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
            { role: 'system', content: 'Eres un crítico y teórico de arquitectura del Sistema ARPV.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 600,
        }),
      });
      const data = await openaiRes.json();
      generatedText = data.choices?.[0]?.message?.content || '';
    }
    // 4. Cloudflare Workers AI (si está disponible en el entorno)
    else if (context.env?.AI) {
      const aiRes = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      });
      generatedText = aiRes.response || '';
    }

    // Fallback pedagógico si no se obtuvo respuesta de proveedores externos
    if (!generatedText) {
      const relsText = relaciones.length ? `a través de vínculos que ${relaciones.slice(0, 2).join(' y ')}` : '';
      generatedText = `La propuesta se fundamenta en la articulación formal de ${activeList.slice(0, 3).join(', ')}, ${relsText}. La volumetría responde a la escala humana mediante operaciones de sustracción y adición que cualifican el espacio interior, estableciendo una continuidad fluida entre el lleno construido y la atmósfera del lugar.`;
    }

    return new Response(JSON.stringify({ discourse: generatedText.trim() }), {
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
