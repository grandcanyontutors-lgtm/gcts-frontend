/**
 * Canonical order-form options.
 *
 * `value` here is the exact choice value the backend accepts — these lists
 * mirror `Order.SUBJECTS`, `ORDER_TYPE`, `ORDER_LEVEL`, `ORDER_STYLE` and
 * `URGENCY_LEVELS` in `gcts-backend/api/models.py`. The form stores the value
 * and submits it unchanged; nothing translates labels into codes on the way
 * out. That mapping step is what previously produced values like `dissertation`
 * and `english` that no `ChoiceField` would accept, so every affected order was
 * rejected with a 400 at submit time.
 *
 * These are also the fallback used when `/dropdown-options/` is unreachable.
 * The API returns the same pairs (`name` = value, `display_name` = label), so
 * an admin adding an option in the dashboard changes the form without a
 * deploy — but an outage degrades to a list that still validates.
 *
 * Keep in sync with the backend choice lists.
 */

export interface OrderOption {
  value: string;
  label: string;
}

export const SUBJECT_OPTIONS: OrderOption[] = [
  { value: 'nursing', label: 'Nursing' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'business', label: 'Business' },
  { value: 'management', label: 'Management' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'education', label: 'Education' },
  { value: 'law', label: 'Law' },
  { value: 'history', label: 'History' },
  { value: 'literature', label: 'Literature' },
  { value: 'biology', label: 'Biology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'physics', label: 'Physics' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'computer science', label: 'Computer Science' },
  { value: 'information technology', label: 'Information Technology' },
  { value: 'economics', label: 'Economics' },
  { value: 'finance', label: 'Finance' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'political science', label: 'Political Science' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'religion', label: 'Religion' },
  { value: 'arts', label: 'Arts' },
  { value: 'music', label: 'Music' },
  { value: 'film', label: 'Film' },
  { value: 'theater', label: 'Theater' },
  { value: 'dance', label: 'Dance' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'sports', label: 'Sports' },
  { value: 'tourism', label: 'Tourism' },
  { value: 'geography', label: 'Geography' },
  { value: 'anthropology', label: 'Anthropology' },
  { value: 'archaeology', label: 'Archaeology' },
  { value: 'linguistics', label: 'Linguistics' },
  { value: 'foreign languages', label: 'Foreign Languages' },
  { value: 'other', label: 'Other' },
];

export const ORDER_TYPE_OPTIONS: OrderOption[] = [
  { value: 'essay', label: 'Essay (any type)' },
  { value: 'admission essay', label: 'Admission Essay' },
  { value: 'annotated bibliography', label: 'Annotated Bibliography' },
  { value: 'analyis', label: 'Analyis (any type)' },
  { value: 'article review', label: 'Article Review' },
  { value: 'article', label: 'Article (written)' },
  { value: 'book review', label: 'Book/Movie Review' },
  { value: 'business plan', label: 'Business Plan' },
  { value: 'business proposal', label: 'Business Proposal' },
  { value: 'case study', label: 'Case Study' },
  { value: 'coursework', label: 'Coursework' },
  { value: 'capstone project', label: 'Capstone Project' },
  { value: 'creative writing', label: 'Creative Writing' },
  { value: 'critical thinking', label: 'Critical Thinking' },
  { value: 'discussion post', label: 'Discussion Post' },
  { value: 'lab report', label: 'Lab Report' },
  { value: 'letter', label: 'Letter/Memos' },
  { value: 'literature review', label: 'Literature Review' },
  { value: 'outline', label: 'Outline' },
  { value: 'personal narrative', label: 'Personal Narrative' },
  { value: 'presentation', label: 'Presentation or Speech' },
  { value: 'reaction paper', label: 'Reaction Paper' },
  { value: 'reflective writing', label: 'Reflective Writing' },
  { value: 'report', label: 'Report' },
  { value: 'research paper', label: 'Research Paper' },
  { value: 'research proposal', label: 'Research Proposal' },
  { value: 'systematic review', label: 'Systematic Review' },
  { value: 'thesis', label: 'Thesis/Dissertation' },
  { value: 'term paper', label: 'Term Paper' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'powerpoint presentation', label: 'PowerPoint Presentation' },
  {
    value: 'powerpoint presentation with speaker notes',
    label: 'PowerPoint Presentation with Speaker Notes',
  },
  { value: 'homework', label: 'Homework' },
  { value: 'online assignment', label: 'Online Assignment' },
  { value: 'multiple choice questions', label: 'Multiple Choice Questions' },
  { value: 'problem solving', label: 'Problem Solving' },
  { value: 'question and answer', label: 'Question and Answer' },
  { value: 'short answer questions', label: 'Short Answer Questions' },
  { value: 'class discussion', label: 'Class Discussion' },
  { value: 'online test', label: 'Online Test' },
  { value: 'exam', label: 'Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'test', label: 'Test' },
  { value: 'other', label: 'Other' },
];

export const ACADEMIC_LEVEL_OPTIONS: OrderOption[] = [
  { value: 'college', label: 'College' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'doctorate', label: 'Doctorate' },
];

export const CITATION_STYLE_OPTIONS: OrderOption[] = [
  { value: 'chicago', label: 'Chicago/Turabian' },
  { value: 'mla', label: 'MLA' },
  { value: 'apa6', label: 'APA 6th Edition' },
  { value: 'apa7', label: 'APA 7th Edition' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'other', label: 'Other' },
];

/**
 * Urgency doubles as the price multiplier input, so it carries one extra field
 * and is not served by the dropdown-options API in this form.
 */
export const URGENCY_OPTIONS: (OrderOption & { multiplier: number })[] = [
  { value: 'low', label: 'Standard (7+ days)', multiplier: 1 },
  { value: 'medium', label: 'Urgent (3-6 days)', multiplier: 1.5 },
  { value: 'high', label: 'Very Urgent (1-2 days)', multiplier: 2 },
];

/** Human-readable label for a stored value, falling back to the value itself. */
/**
 * The human label for a stored value.
 *
 * Tolerant of what the API actually returns rather than what the types claim:
 * `Order.subject` is typed as a `Subject` object in `types/api.ts` but arrives
 * as a plain string, and several fields are optional. An unknown value is
 * echoed back rather than blanked — a raw `case study` is worth more to the
 * reader than an empty cell.
 */
export function labelFor(options: OrderOption[], value: unknown): string {
  if (value == null) return '—';
  const key = typeof value === 'string' ? value : String((value as any)?.name ?? value);
  return options.find((option) => option.value === key)?.label || key;
}

/**
 * Normalise `/dropdown-options/<type>/` rows into the local shape. Returns the
 * fallback when the API returned nothing, so a Select is never empty.
 */
export function optionsFromApi(
  rows: { name: string; display_name: string }[],
  fallback: OrderOption[]
): OrderOption[] {
  if (!rows?.length) return fallback;
  return rows.map((row) => ({ value: row.name, label: row.display_name || row.name }));
}
