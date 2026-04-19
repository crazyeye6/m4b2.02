export interface ParsedField {
  value: string;
  confidence: 'high' | 'medium' | 'low' | 'missing';
}

export interface ParsedSlot {
  media_name: ParsedField;
  media_type: ParsedField;
  publisher_name: ParsedField;
  audience_size: ParsedField;
  category: ParsedField;
  geography: ParsedField;
  open_rate: ParsedField;
  placement_type: ParsedField;
  send_date: ParsedField;
  deadline_date: ParsedField;
  original_price: ParsedField;
  discount_price: ParsedField;
  slots_available: ParsedField;
  sample_link: ParsedField;
  past_advertisers_text: ParsedField;
  description: ParsedField;
  booking_url: ParsedField;
  raw_slot_text: string;
  confidence_score: number;
  missing_fields: string[];
  field_confidence: Record<string, number>;
}

const REQUIRED_FIELDS = [
  'media_name',
  'media_type',
  'audience_size',
  'original_price',
  'discount_price',
  'deadline_date',
] as const;

const FIELD_ALIASES: Record<string, string[]> = {
  media_name: ['media name', 'newsletter name', 'publication', 'media', 'newsletter'],
  media_type: ['media type', 'type', 'format'],
  publisher_name: ['publisher', 'publisher name', 'company', 'brand'],
  audience_size: ['audience size', 'subscribers', 'subscriber count', 'audience', 'list size', 'reach'],
  category: ['category', 'niche', 'topic', 'vertical'],
  geography: ['geography', 'location', 'region', 'geo', 'country', 'audience geography'],
  open_rate: ['open rate', 'open rates', 'opens', 'avg open rate'],
  placement_type: ['placement type', 'placement', 'opportunity type', 'ad type', 'slot type', 'sponsorship type'],
  send_date: ['send date', 'date', 'publication date', 'issue date', 'sending date'],
  deadline_date: ['deadline', 'booking deadline', 'book by', 'deadline date', 'closes', 'close date'],
  original_price: ['rate card price', 'original price', 'list price', 'regular price', 'rate card', 'rack rate', 'price'],
  discount_price: ['this week price', 'discount price', 'special price', 'your price', 'offer price', 'discounted price', 'sale price'],
  slots_available: ['slots available', 'slots', 'availability', 'available slots', 'spots'],
  sample_link: ['sample link', 'sample', 'example link', 'past issue', 'sample url'],
  past_advertisers_text: ['past advertisers', 'previous advertisers', 'advertisers', 'past clients', 'sponsors'],
  description: ['description', 'details', 'notes', 'about', 'summary'],
  booking_url: ['booking url', 'booking link', 'book here', 'link', 'url'],
};

function extractField(lines: string[], aliases: string[]): { value: string; confidence: ParsedField['confidence'] } {
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    if (!value) continue;

    for (const alias of aliases) {
      if (key === alias || key.endsWith(alias) || alias.endsWith(key)) {
        return { value, confidence: 'high' };
      }
    }
  }

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    if (!value) continue;

    for (const alias of aliases) {
      if (key.includes(alias) || alias.includes(key)) {
        return { value, confidence: 'medium' };
      }
    }
  }

  return { value: '', confidence: 'missing' };
}

function confidenceToScore(c: ParsedField['confidence']): number {
  if (c === 'high') return 100;
  if (c === 'medium') return 60;
  if (c === 'low') return 30;
  return 0;
}

function inferMediaType(text: string): ParsedField {
  const lower = text.toLowerCase();
  if (lower.includes('newsletter') || lower.includes('email') || lower.includes('subscribers') || lower.includes('open rate')) {
    return { value: 'newsletter', confidence: 'high' };
  }
  if (lower.includes('podcast') || lower.includes('episode') || lower.includes('downloads') || lower.includes('listeners')) {
    return { value: 'podcast', confidence: 'high' };
  }
  if (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('youtube') || lower.includes('influencer') || lower.includes('followers')) {
    return { value: 'influencer', confidence: 'high' };
  }
  return { value: 'newsletter', confidence: 'low' };
}

export function parseEmailBody(rawBody: string): ParsedSlot[] {
  const slotPattern = /---+\s*SLOT\s*\d+\s*---+/gi;
  const hasSlotDividers = slotPattern.test(rawBody);

  let segments: string[];
  if (hasSlotDividers) {
    segments = rawBody.split(/---+\s*SLOT\s*\d+\s*---+/gi).filter(s => s.trim().length > 0);
  } else {
    segments = [rawBody];
  }

  return segments.map(segment => parseSegment(segment));
}

function parseSegment(text: string): ParsedSlot {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const extract = (key: string): ParsedField => {
    const aliases = FIELD_ALIASES[key] ?? [key];
    return extractField(lines, aliases);
  };

  let media_type = extract('media_type');
  if (media_type.confidence === 'missing' || media_type.confidence === 'low') {
    const inferred = inferMediaType(text);
    if (inferred.confidence !== 'low') media_type = inferred;
  }

  const slot: ParsedSlot = {
    media_name: extract('media_name'),
    media_type,
    publisher_name: extract('publisher_name'),
    audience_size: extract('audience_size'),
    category: extract('category'),
    geography: extract('geography'),
    open_rate: extract('open_rate'),
    placement_type: extract('placement_type'),
    send_date: extract('send_date'),
    deadline_date: extract('deadline_date'),
    original_price: extract('original_price'),
    discount_price: extract('discount_price'),
    slots_available: extract('slots_available'),
    sample_link: extract('sample_link'),
    past_advertisers_text: extract('past_advertisers_text'),
    description: extract('description'),
    booking_url: extract('booking_url'),
    raw_slot_text: text,
    confidence_score: 0,
    missing_fields: [],
    field_confidence: {},
  };

  if (slot.publisher_name.confidence === 'missing' && slot.media_name.value) {
    slot.publisher_name = { value: slot.media_name.value, confidence: 'low' };
  }

  const requiredFieldScores: number[] = [];
  const allFieldScores: number[] = [];
  const missing: string[] = [];
  const fieldConf: Record<string, number> = {};

  for (const [key, field] of Object.entries(slot) as [string, ParsedField][]) {
    if (typeof field === 'object' && field !== null && 'confidence' in field) {
      const score = confidenceToScore(field.confidence);
      fieldConf[key] = score;
      allFieldScores.push(score);
      if ((REQUIRED_FIELDS as readonly string[]).includes(key)) {
        requiredFieldScores.push(score);
        if (field.confidence === 'missing') missing.push(key);
      }
    }
  }

  const reqAvg = requiredFieldScores.length ? requiredFieldScores.reduce((a, b) => a + b, 0) / requiredFieldScores.length : 0;
  const allAvg = allFieldScores.length ? allFieldScores.reduce((a, b) => a + b, 0) / allFieldScores.length : 0;
  slot.confidence_score = Math.round(reqAvg * 0.7 + allAvg * 0.3);
  slot.missing_fields = missing;
  slot.field_confidence = fieldConf;

  return slot;
}

export function confidenceLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'High Confidence', color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
  if (score >= 50) return { label: 'Medium Confidence', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Needs Review', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
}

export function fieldConfidenceColor(score: number): string {
  if (score >= 80) return 'border-green-200 bg-green-50/50';
  if (score >= 50) return 'border-amber-200 bg-amber-50/50';
  if (score > 0) return 'border-orange-200 bg-orange-50/50';
  return 'border-red-200 bg-red-50/30';
}
