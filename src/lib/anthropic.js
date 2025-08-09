// Minimal Anthropic Messages API client for the browser.
// NOTE: For production, proxy this request through a backend to keep the API key secret.

const DEFAULT_MODEL = 'claude-3-5-sonnet-latest'

export async function generateInvestorsWithAnthropic({ profile, apiKey }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const system = `You are a startup investor matchmaker. Given a startup profile, pick investors who are a strong fit for the profile's stage and topic. Return a concise JSON array tailored to the inputs.

Rules:
- Output ONLY valid JSON, no backticks, no commentary
- Each item:
  {
    "name": "",
    "firm": "",
    "role": "",
    "why_match": "reference the startup's problem/solution in <= 22 words",
    "fit_score": 1-5,
    "stages": ["pre-seed"|"seed"|"series a"|...],
    "sectors": ["AI", "SaaS", "DevTools", ...],
    "geo": "",
    "links": {"linkedin":"","twitter":"","email":"","website":""}
  }
- Use public info only; if a contact is unknown, set it to "".
- Prefer partners who led or frequently participate at the requested stage.
- Prefer investors with visible interest in the inferred sectors from the text.
- Avoid generic choices; rank by fit_score descending.`

  const prompt = `Startup profile (use this aggressively):\n${JSON.stringify(profile, null, 2)}\n\nInfer sectors from problem/solution text. Map launch timeframe or stage_hint to stages. Return ONLY a JSON array.`

  const url = (import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com') + '/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required by Anthropic for any browser-originating requests
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1200,
      system,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${text}`)
  }

  const data = await res.json()
  // Anthropic returns content as an array of blocks; we expect a single text block
  const text = data?.content?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('Expected array')
    return parsed
  } catch {
    // Fallback: try to extract the first JSON array inside
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    throw new Error('Model did not return JSON')
  }
}


/**
 * Generate a concise, investor-ready pitch deck outline following a strict slide structure.
 * Returns an array of 12 slides with: number, title, subtitle, bullets[], and optional metrics.
 */
export async function generatePitchDeckWithAnthropic({ profile, apiKey }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const voiceTone = profile?.brandTone || 'clear, confident, concise'
  const startupName = profile?.startupName || 'The Startup'

  const system = `You are a world-class startup storyteller crafting a crisp, investor-ready pitch deck outline.

Rules:
- Output ONLY valid JSON (no backticks, no prose), an array of EXACTLY 12 slides, numbered 0-free (1..12).
- Each slide has the shape:
  {
    "number": 1-12,
    "title": "",
    "subtitle": "",
    "bullets": ["3-6 short bullets, <= 16 words each"],
    "metrics": {"note": "optional: for unit economics (slide 4) and projections (slide 5)"}
  }
- Style and phrasing must follow the brand tone: ${voiceTone}.
- Keep it factual, specific, no fluff. Prioritize clarity over hype.

Slide structure (exact order, titles can be improved but keep meaning):
1. Motivation
2. Market pain / size / growth + target customers
3. Product solving the pain
4. Competition and moat
5. Business model / unit metrics
6. Cash-flow projections (5 years)
7. Risk analysis and mitigation
8. Team + who’s missing
9. Go to market
10. Technology (scaling) and Processes
11. What has been done so far (contracts, POCs, MVP, incorporation)
12. Deal offered + use of proceeds + milestones for this round
`

  const prompt = `Startup profile context:
${JSON.stringify({
  name: startupName,
  brandTone: voiceTone,
  linkedin: profile?.linkedin || '',
  problem: profile?.problem || '',
  solution: profile?.solution || '',
  milestones: profile?.milestones || '',
  notes: profile?.notes || '',
  launchWeeks: profile?.launchWeeks || '',
}, null, 2)}

Return ONLY a JSON array with 12 items in the specified order. Avoid duplicates. If information is missing, infer carefully and keep conservative.`

  const url = (import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com') + '/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 2200,
      system,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('Expected array')
    return parsed
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    throw new Error('Model did not return JSON')
  }
}


/**
 * Generate comprehensive market research report using Anthropic Claude API
 * Returns a structured market research report with analysis and recommendations
 */
export async function generateMarketResearchWithAnthropic({ profile, problemStatement, userAnswers, apiKey }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const system = `You are a senior McKinsey & Company consultant specializing in market intelligence and strategic analysis. Generate a world-class, C-suite executive market research report that would be presented to Fortune 500 CEOs and board members.

Your analysis must be:
- PROFESSIONAL: Use McKinsey-level business language and frameworks
- DATA-DRIVEN: Include specific market metrics, growth rates, and projections
- STRATEGIC: Provide actionable insights for executive decision-making
- COMPREHENSIVE: Cover all critical market dimensions with depth
- VISUAL-READY: Structure content for executive presentation format

Analysis Framework:
- Market sizing with TAM/SAM/SOM methodology
- Porter's Five Forces analysis
- Customer segmentation and journey mapping
- Competitive positioning matrix
- Risk assessment and mitigation strategies
- Strategic roadmap with clear milestones

Return ONLY valid JSON with this exact structure:
{
  "executive_summary": "Executive-level 3-4 sentence summary with key market insights, growth potential, and strategic implications. Use specific numbers and percentages where possible.",
  "market_analysis": {
    "market_size": "Detailed market size analysis using TAM/SAM/SOM framework. Include specific numbers, growth rates (CAGR), and market projections. Example: 'Global market valued at $X billion in 2024, projected to reach $Y billion by 2029 (CAGR: Z%)'",
    "industry_trends": "3-4 key industry megatrends with specific examples and impact analysis. Include technological, regulatory, and consumer behavior shifts.",
    "market_segmentation": "Detailed market segmentation with specific demographics, psychographics, and behavioral patterns. Include size estimates for each segment."
  },
  "competitive_landscape": {
    "key_competitors": "Strategic analysis of top 3-5 competitors with their market positioning, strengths, weaknesses, and market share estimates.",
    "competitive_advantages": "Your startup's unique competitive advantages and differentiation strategy. Include specific capabilities and market positioning.",
    "market_share": "Current market share dynamics, competitive positioning matrix, and market share capture opportunities with specific targets."
  },
  "customer_insights": {
    "target_customers": "Primary and secondary target customer segments with detailed personas, including demographics, psychographics, and buying behavior patterns.",
    "pain_points": "3-4 specific customer pain points with impact assessment and urgency levels. Include quantifiable impact metrics where possible.",
    "behavior": "Customer journey analysis, decision-making patterns, and key behavioral drivers. Include specific examples and data points."
  },
  "market_opportunity": {
    "market_gaps": "Identified market gaps and white space opportunities with specific examples and market size estimates for each opportunity.",
    "revenue_potential": "Detailed revenue potential analysis with market penetration scenarios, pricing strategies, and 3-5 year revenue projections.",
    "entry_barriers": "Market entry barriers and challenges with specific mitigation strategies and competitive moat development recommendations."
  },
  "recommendations": {
    "strategic": "3-4 strategic recommendations for market entry and growth with specific action items and expected outcomes.",
    "implementation": "90-day implementation roadmap with key milestones, resource requirements, and success metrics.",
    "risk_mitigation": "Top 3-4 risk factors with probability assessment, impact analysis, and specific mitigation strategies."
  },
  "conclusion": "Strategic conclusion with 3 key executive takeaways, market opportunity summary, and next steps for leadership team."
}`

  const prompt = `Startup Profile Context:
${JSON.stringify({
  startupName: profile?.startupName || 'The Startup',
  brandTone: profile?.brandTone || 'professional and clear',
  problem: profile?.problem || '',
  solution: profile?.solution || '',
  linkedin: profile?.linkedin || '',
  launchWeeks: profile?.launchWeeks || '',
  milestones: profile?.milestones || '',
  notes: profile?.notes || ''
}, null, 2)}

Problem Statement:
${problemStatement}

Generate a comprehensive, McKinsey-quality market intelligence report following the specified JSON structure. 

Key Requirements:
1. Use the startup profile context to create highly specific, tailored insights
2. Apply professional consulting frameworks (TAM/SAM/SOM, Porter's Five Forces, etc.)
3. Include specific market metrics, growth projections, and competitive analysis
4. Provide actionable strategic recommendations for C-suite executives
5. Use industry-standard terminology and professional business language
6. Focus on quantifiable insights and measurable outcomes

This report will be presented to investors and executive leadership, so ensure it meets Fortune 500 consulting standards.`

  const url = (import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com') + '/v1/messages'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 3000,
      system,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text ?? ''
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed !== 'object') throw new Error('Expected object')
    return parsed
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    throw new Error('Model did not return valid JSON')
  }
}


