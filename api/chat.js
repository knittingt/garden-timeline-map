export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { messages = [], gardenInfo = {} } = req.body ?? {};

  const { zip, bedCount, beds = [], permanentPlants = [] } = gardenInfo;

  const knownContext = [
    zip ? `Zip code: ${zip}` : null,
    bedCount ? `Number of beds: ${bedCount}` : null,
    beds.length > 0
      ? beds.map((b, i) => `Bed ${b.number ?? i + 1}: ${b.widthIn}"W × ${b.lengthIn}"L`).join(', ')
      : null,
    permanentPlants.length > 0
      ? `Permanent/perennial plants: ${permanentPlants.map(p => `${p.name} in Bed ${p.bed}`).join(', ')}`
      : permanentPlants !== null
      ? 'No permanent/perennial plants'
      : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are a friendly, knowledgeable garden planning assistant. Your goal is to collect all the information needed to build a personalized garden plan.

You already know the following from the user's setup form:
${knownContext || '(nothing yet — this is the first message)'}

You need to collect the remaining required information through conversation. The conversation has three phases:

**Phase 1 — Sun exposure (if not yet known):**
Ask about sun exposure for each bed (full sun, part shade, or full shade). Since you already know the bed dimensions and count, acknowledge those warmly and ask only about sun. If sun exposure is already in gardenInfo.beds[].sun, skip this phase.

**Phase 2 — Seed preferences (if not yet known):**
Ask what vegetables, herbs, or fruits the user wants to grow this season.

**Phase 3 — Companion plant suggestions (required, must happen once seeds are known):**
After the user tells you their seed preferences, proactively suggest 3–5 companion plants that:
- Are compatible with and benefit the user's chosen crops
- Attract beneficial insects (pollinators, pest-predating insects)
- Can realistically fit in the available bed space
For each suggestion include: the plant name, which of the user's crops it benefits, and which beneficial insects it attracts.
Ask if they'd like to add any of these companions to their plan.
After the user responds (even if they decline all), set companionSuggestionsAcknowledged to true and add any accepted companions to the crops list.

**Completion:**
Only set "complete": true after ALL THREE phases are done:
1. Sun exposure is known for all beds
2. Seed/crop preferences are known
3. Companion suggestions have been shown AND the user has responded

**Rules:**
- Be warm and conversational, not form-like
- Never invent or assume field values the user hasn't provided
- You may ask about multiple missing items in one message
- Extract everything the user provides into gardenInfo on every turn

**Always respond with ONLY valid JSON in this exact shape:**
{
  "reply": "Your conversational message to the user",
  "complete": false,
  "gardenInfo": {
    "zip": "${zip || ''}",
    "bedCount": ${bedCount || 1},
    "beds": [array of {number, widthIn, lengthIn, sun}],
    "permanentPlants": [array of {name, bed, location}],
    "crops": [array of crop name strings],
    "companionSuggestionsAcknowledged": false
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.length === 0
          ? [{ role: 'user', content: 'Hello, I am ready to set up my garden.' }]
          : messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Claude API error', detail: err });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    // Extract JSON — handle fenced blocks, leading prose, or bare JSON
    let jsonStr = content.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      // Try to find a raw JSON object anywhere in the response
      const objStart = jsonStr.indexOf('{');
      const objEnd = jsonStr.lastIndexOf('}');
      if (objStart !== -1 && objEnd > objStart) {
        jsonStr = jsonStr.slice(objStart, objEnd + 1);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: return plain reply without complete
      return res.status(200).json({ reply: content, complete: false, gardenInfo });
    }

    return res.status(200).json({
      reply: parsed.reply ?? content,
      complete: parsed.complete === true,
      gardenInfo: parsed.gardenInfo ?? gardenInfo,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
