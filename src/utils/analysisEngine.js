import { sampleTranscripts } from '../data/sampleTranscripts';

/**
 * Deterministic rules-based analysis engine for helpline transcripts.
 * Does not call any external APIs or claim to be an actual AI model.
 */
export function analyzeTranscript({
  transcript,
  selectedLanguage = 'Auto-detect',
  caseRef = '',
  receivedTime = '',
  operatorNotes = '',
}) {
  const cleanText = (transcript || '').trim();
  if (!cleanText) {
    throw new Error('Transcript cannot be empty.');
  }

  // 1. Check if the text matches or originates from one of our predefined sample templates
  const matchedSample = sampleTranscripts.find((s) => {
    // Check if substantial substring or title matches
    const sampleSnippet = s.text.substring(0, 50).toLowerCase();
    return cleanText.toLowerCase().includes(sampleSnippet);
  });

  const now = new Date();
  const timeStr = receivedTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const randomCaseNum = Math.floor(100 + Math.random() * 899);
  const generatedId = matchedSample?.analysisData.caseId || `CS-2026-${randomCaseNum}`;

  // 2. Language Detection
  let detectedLang = selectedLanguage;
  if (selectedLanguage === 'Auto-detect') {
    const hindiWords = ['karo', 'hai', 'hain', 'mein', 'hum', 'meri', 'mera', 'unko', 'bohot', 'nahi', 'karke', 'pehle', 'achanak'];
    const lower = cleanText.toLowerCase();
    const hasHindi = hindiWords.some((w) => lower.includes(w));
    const hasEnglish = /[a-zA-Z]/.test(cleanText);

    if (hasHindi && hasEnglish) {
      detectedLang = 'Hinglish (Hindi-English mix)';
    } else if (hasHindi) {
      detectedLang = 'Hindi';
    } else {
      detectedLang = 'English';
    }
  }

  // If we have an exact sample template match, enrich it with user inputs
  if (matchedSample) {
    const sampleData = matchedSample.analysisData;
    return {
      caseId: generatedId,
      caseRef: caseRef || matchedSample.caseRef,
      receivedDateTime: `${dateStr} at ${timeStr}`,
      receivedTime: timeStr,
      detectedLanguage: detectedLang,
      reviewStatus: 'Awaiting Human Review',
      urgency: sampleData.urgency,
      urgencyReason: sampleData.urgencyReason,
      confidence: sampleData.confidence,
      confidenceNote: sampleData.confidenceNote,
      summary: sampleData.summary,
      extracted: {
        ...sampleData.extracted,
        previousComplaintRef: caseRef || sampleData.extracted.previousComplaintRef,
      },
      recommendedService: sampleData.recommendedService,
      evidenceSpans: sampleData.evidenceSpans,
      originalTranscript: cleanText,
      operatorNotes: operatorNotes || matchedSample.operatorNotes,
      sampleId: matchedSample.id,
    };
  }

  // 3. Fallback: Deterministic Rule-Based Parsing for custom entered transcripts
  const lower = cleanText.toLowerCase();

  // Pattern detection
  const hasCriticalMedical = /(chest pain|behosh|unconscious|heart attack|cardiac|saans lene|breathing difficulty|heavy bleeding|passed out)/i.test(lower);
  const hasCriticalSafety = /(threat|break.*door|darwaza|maar|kill|weapon|gun|knife|intruder|break in|police dispatch|urgent help)/i.test(lower);
  const hasHarassment = /(harass|stalk|follow|unsolicited|whatsapp|threatening messages|picha|confront)/i.test(lower);
  const hasEmotionalDistress = /(panic attack|anxiety|hopeless|depressed|overwhelmed|crying|suicid|counselor|paralyzed)/i.test(lower);
  const hasRepeatRef = /(cs-\d+|case\s*(?:ref|number|no|#)?\s*\w+|pehle bhi|previous complaint|prior ticket)/i.test(lower);
  const hasLegal = /(legal|landlord|tenancy|court|dispute|deposit|police station|advocate|lawyer)/i.test(lower);

  // Extract explicit previous complaint reference
  const prevRefMatch = cleanText.match(/(CS-\d{4}-\d{3,4}|REF-\d{4}-\w{4}|case\s*(?:no|number|#)?\s*[:\s]*([A-Z0-9-]+))/i);
  const extractedPrevRef = prevRefMatch ? prevRefMatch[0] : (caseRef || 'Not mentioned');

  // Extract location candidates (e.g. Sector, Block, Nagar, Road, Station, Market, City)
  const locationMatch = cleanText.match(/((?:sector|block|nagar|road|street|market|colony|enclave|vihar|chowk|station)\s+[A-Za-z0-9-]+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Delhi|Gurugram|Noida|Mumbai|Pune|Bengaluru|Chennai|Hyderabad|Kolkata))/i);
  const extractedLocation = locationMatch ? locationMatch[0] : 'Not mentioned';

  // Extract time indicators
  const timeMatch = cleanText.match(/(\d+\s*(?:minutes?|hours?|days?)\s*(?:ago|se)|yesterday|today|this afternoon|last night|tonight|just now|achanak)/i);
  const extractedTime = timeMatch ? timeMatch[0] : (receivedTime || 'Not mentioned');

  // Urgency Determination
  let urgency = 'Medium';
  let urgencyReason = '';
  let confidence = '90%';
  let recommendedService = '112 Unified Emergency Response';

  if (hasCriticalMedical) {
    urgency = 'Critical';
    urgencyReason = 'Detected acute physiological symptoms (chest pain, unconsciousness, or laboured breathing) requiring immediate life-support intervention.';
    confidence = '98%';
    recommendedService = '108 Emergency Medical Services & Ambulance';
  } else if (hasCriticalSafety) {
    urgency = 'Critical';
    urgencyReason = 'Identified immediate physical intrusion or violent threat in progress requiring urgent law enforcement dispatch.';
    confidence = '96%';
    recommendedService = '112 National Police Emergency PCR';
  } else if (hasHarassment) {
    urgency = 'High';
    urgencyReason = 'Reported personal harassment or stalking conduct requiring protective intervention and record logging.';
    confidence = '94%';
    recommendedService = '1091 Women Helpline & State Cyber Crime Cell';
  } else if (hasEmotionalDistress) {
    urgency = 'High';
    urgencyReason = 'Acute psychological crisis or intense anxiety episode requiring immediate de-escalation by crisis counseling team.';
    confidence = '93%';
    recommendedService = '14416 Tele-MANAS Mental Health Helpline';
  } else if (hasRepeatRef) {
    urgency = 'Medium';
    urgencyReason = 'Unresolved repeat grievance with prior ticket reference. Elevated due to delay or escalation in service delivery.';
    confidence = '92%';
    recommendedService = '1916 Municipal / Relevant Discom Authority';
  } else if (hasLegal) {
    urgency = 'Low';
    urgencyReason = 'Civil legal dispute or advisory inquiry with no imminent threat to life or physical bodily harm.';
    confidence = '91%';
    recommendedService = '15100 National Legal Services Authority (NALSA)';
  } else {
    urgency = 'Medium';
    urgencyReason = 'General helpline report evaluated based on standard triage heuristics. Requires operator verification.';
    confidence = '88%';
    recommendedService = '112 Emergency Central Dispatch';
  }

  // Generate concise summary
  const summarySentences = [];
  summarySentences.push(`Caller reports a ${urgency.toLowerCase()} priority issue involving ${hasCriticalMedical ? 'a severe medical emergency' : hasCriticalSafety ? 'an active physical security threat' : hasHarassment ? 'ongoing harassment and intimidation' : hasEmotionalDistress ? 'acute emotional distress and panic symptoms' : hasLegal ? 'a civil tenancy or legal rights dispute' : 'a helpline assistance inquiry'}.`);
  if (extractedLocation !== 'Not mentioned') {
    summarySentences.push(`The reported incident is located at or near ${extractedLocation}.`);
  }
  if (extractedTime !== 'Not mentioned') {
    summarySentences.push(`Reported timeframe: ${extractedTime}.`);
  }
  if (extractedPrevRef !== 'Not mentioned') {
    summarySentences.push(`Follow-up linked to earlier record ${extractedPrevRef}.`);
  }
  summarySentences.push(`Immediate assessment routed to ${recommendedService} for verification.`);

  // Build evidence spans
  const evidenceSpans = [];
  if (locationMatch) {
    evidenceSpans.push({
      text: locationMatch[0],
      category: 'Location References',
      explanation: 'Geographic identifier explicitly named in transcript for operational dispatch routing.',
    });
  }
  if (timeMatch) {
    evidenceSpans.push({
      text: timeMatch[0],
      category: 'Incident Details',
      explanation: 'Temporal reference specifying when the reported event occurred.',
    });
  }
  if (prevRefMatch) {
    evidenceSpans.push({
      text: prevRefMatch[0],
      category: 'Previous Complaint References',
      explanation: 'Case identifier referencing earlier communication or open ticket.',
    });
  }

  // Extract key distress snippets
  const words = cleanText.split(/\s+/);
  const snippet = words.slice(0, Math.min(words.length, 12)).join(' ');
  evidenceSpans.push({
    text: snippet,
    category: urgency === 'Critical' ? 'Urgency Indicators' : 'Incident Details',
    explanation: `Introductory context indicating ${urgency.toLowerCase()} classification.`,
  });

  return {
    caseId: generatedId,
    caseRef: caseRef || 'Not mentioned',
    receivedDateTime: `${dateStr} at ${timeStr}`,
    receivedTime: timeStr,
    detectedLanguage: detectedLang,
    reviewStatus: 'Awaiting Human Review',
    urgency,
    urgencyReason,
    confidence,
    confidenceNote: 'Deterministic heuristic analysis. Human operator verification is mandatory before dispatch.',
    summary: summarySentences.join(' '),
    extracted: {
      incidentType: hasCriticalMedical ? 'Medical Emergency' : hasCriticalSafety ? 'Security & Physical Threat' : hasHarassment ? 'Harassment & Stalking' : hasEmotionalDistress ? 'Psychological Distress' : hasLegal ? 'Civil / Legal Dispute' : 'General Helpline Request',
      incidentDescription: cleanText.length > 120 ? `${cleanText.substring(0, 120)}...` : cleanText,
      location: extractedLocation,
      timeOrDate: extractedTime,
      threatIndicators: hasCriticalSafety ? 'Threatening language or intrusion indicators detected' : 'Not mentioned',
      medicalIndicators: hasCriticalMedical ? 'Acute physiological distress indicators detected' : 'Not mentioned',
      harassmentIndicators: hasHarassment ? 'Stalking or persistent contact indicators detected' : 'Not mentioned',
      emotionalDistressIndicators: hasEmotionalDistress ? 'Severe anxiety, panic, or overwhelming dread expressed' : 'Not mentioned',
      previousComplaintRef: extractedPrevRef,
      relevantPeople: 'Caller and parties explicitly mentioned in transcript',
      missingInfo: extractedLocation === 'Not mentioned' ? 'Exact location/address not mentioned by caller' : 'Specific landmark or building number unverified',
    },
    recommendedService,
    evidenceSpans,
    originalTranscript: cleanText,
    operatorNotes: operatorNotes || 'Not mentioned',
  };
}
