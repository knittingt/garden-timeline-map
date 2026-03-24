export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { gardenInfo = {} } = req.body ?? {};
  const currentYear = new Date().getFullYear();

  const systemPrompt = `You are a garden planning expert. Generate a complete, practical garden plan as structured JSON based on the user's garden information. Respond with ONLY valid JSON — no prose, no markdown fences.

**Strip calculation rule:** For each bed, calculate strips from the bed WIDTH:
  stripCount = Math.floor(widthInches / 12)
  Name strips sequentially: strip1, strip2, strip3, etc.
  Do NOT add a trellis zone automatically. Only set trellis: true on a strip if the user mentioned vining crops (cucumbers, beans, peas, squash, melons, etc.) AND a trellis is appropriate — if so, mark the first strip as trellis.

**Current year:** ${currentYear}. Use ${currentYear} for all dates.

**Required JSON schema:**
{
  "crops": [
    { "id": "slug-id", "name": "Display Name", "daysToMaturity": 60, "color": "#hex" }
  ],
  "events": [
    {
      "id": "unique-id",
      "cropId": "slug-id",
      "bed": 1,
      "strip": "strip1",
      "sowDate": "${currentYear}-03-15",
      "season": "spring",
      "successionRound": 1,
      "groupId": "g-slug-id"
    }
  ],
  "bedZones": {
    "1": [{ "id": "strip1", "label": "Strip 1 · 0–12\\"", "trellis": false, "h": 165 }],
    "2": [...]
  },
  "stages": [
    { "label": "Stage Name", "dateDisplay": "Mar 15 — Description", "stageDate": "${currentYear}-03-15", "season": "spring", "notes": "Sow: ..." }
  ],
  "permanentHerbs": {},
  "vizCrops": {
    "slug-id": { "name": "Display Name", "color": "#hex", "note": "Growing notes for this crop." }
  },
  "harvestBuffer": { "slug-id": 21 },
  "cropIdToVizKey": {},
  "gardenMeta": {
    "zone": "7b",
    "bedCount": 2,
    "year": ${currentYear},
    "lastFrost": "${currentYear}-04-15",
    "firstFrost": "${currentYear}-10-15",
    "description": "${currentYear} Garden Plan"
  }
}

**Rules:**
- Use the zip code to determine the USDA hardiness zone and accurate frost dates
- Plan crops only from the user's list (plus accepted companions) — do not add others
- Each strip must be realistically sized for the crops planned there (check spacing requirements)
- Generate 8–12 seasonal stages representing key sow/transition dates from first sow through last harvest
- Include enough succession rounds to span the full growing season for each crop
- For permanent/perennial plants: add them to permanentHerbs AND to vizCrops; omit from events
- permanentHerbs shape: { "bed1": { "strip1": [{ "crop": "vizKey", "label": "Name", "permanent": true }] } }
- All IDs must be lowercase-hyphenated slugs (no spaces, no special chars)
- event.strip must exactly match a zone id in bedZones for that bed
- Assign distinct, visually pleasing hex colors to each crop
- harvestBuffer: days the crop remains harvestable after daysToMaturity (default 21; tomatoes/peppers 120; cucumbers 60; melons 45)
- The "h" value in bedZones is the visual width in pixels — for equal strips divide 660 by stripCount
- stageDate in stages must be an ISO date string (not null) except for a "Permanent Herbs" opening stage which may use null
- cropIdToVizKey: only include entries where the vizCrops key differs from the cropId`;

  const userMessage = `Here is my garden information:

Zip code: ${gardenInfo.zip || 'not provided'}
Beds: ${JSON.stringify(gardenInfo.beds || [])}
Permanent plants: ${JSON.stringify(gardenInfo.permanentPlants || [])}
Crops to grow (including accepted companions): ${JSON.stringify(gardenInfo.crops || [])}

Please generate the complete garden plan JSON.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Claude API error', detail: err });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    // Strip markdown fences
    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Generation failed — could not parse response', raw: content });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
