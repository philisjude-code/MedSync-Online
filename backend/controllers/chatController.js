// backend/controllers/chatController.js
const rules = require('../data/symptomRules');

const normalize = s => String(s || '').trim().toLowerCase();

const matchSymptoms = (userSymptoms = []) => {
    
    const normalize = s => String(s || '').trim().toLowerCase();

    // 1. Get the raw, flat list of all user input text chunks (before splitting)
    const rawInputChunks = userSymptoms.map(normalize).filter(Boolean); 

    // 2. Create the final search pool: includes original phrases AND single words
    const searchPool = [].concat(
        rawInputChunks, // e.g., ["chest pain"]
        rawInputChunks.map(s => s.split(/\s+/).map(normalize)).flat() // e.g., ["chest", "pain"]
    ).filter(Boolean);


    const results = [];

    for (const r of rules) {
        // Collect all rule keywords (e.g., "chest pain", "fever")
        const ruleSymptoms = (r.anySymptoms || []).map(normalize);
        const ruleRedFlags = (r.redFlags || []).map(normalize);

        // FIX: Match rule symptoms/flags found EXACTLY within the searchPool
        const matches = ruleSymptoms.filter(ruleSym => searchPool.includes(ruleSym));
        const redMatches = ruleRedFlags.filter(ruleSym => searchPool.includes(ruleSym));


        if (matches.length >= (r.minMatch || 1)) {
            let confidence =
                Math.min(0.98, (r.confidenceBase || 0.5) + matches.length * 0.1);

            let triage = r.triage;
            if (redMatches.length > 0) {
                triage = 'emergency';
                confidence = Math.max(confidence, 0.9);
            }

            results.push({
                id: r.id,
                name: r.name,
                matchedSymptoms: matches,
                matchedCount: matches.length,
                redFlagsMatched: redMatches,
                triage,
                confidence: Number(confidence.toFixed(2)),
                advice: r.advice
            });
        }
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results;
};

exports.chat = async (req, res) => {
  try {
    const { text, symptoms } = req.body;
    let userSymptoms = [];

    if (Array.isArray(symptoms)) {
      userSymptoms = symptoms;
    } else if (typeof text === 'string') {
      // Split by commas, semicolons, or the word 'and'
      userSymptoms = text.split(/,| and |;|\n/).map(s => s.trim());
    }

    const matches = matchSymptoms(userSymptoms);

    if (matches.length === 0) {
      return res.json({
        message: 'No clear match found, please consult a doctor.',
        results: []
      });
    }

    return res.json({
      query: userSymptoms,
      primary: matches[0],
      alternatives: matches.slice(1),
      recommendation:
        matches[0].triage === 'emergency'
          ? 'Seek emergency care'
          : matches[0].triage === 'see-doctor'
          ? 'Consult a doctor'
          : 'Self-care suggested',
      disclaimer:
        'This tool provides guidance and is not a medical diagnosis.'
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};