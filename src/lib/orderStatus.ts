/**
 * The order lifecycle, in one place.
 *
 * Mirrors `Order.ORDER_STATUS` in the backend:
 *
 *   pending → assigned → in_progress → solution_submitted → released
 *           → (in_revision → released)* → completed
 *
 * The components that render status were each carrying their own switch, and
 * every one of them matched on values the backend does not emit — `revision`
 * (it is `in_revision`) and a lowercased `in progress` — so those branches
 * could never fire and half the lifecycle fell through to a grey "default"
 * chip. Anything not listed here is genuinely unknown rather than a typo.
 */

import { accents, brand } from './brand';

interface StatusMeta {
  label: string;
  tone: string;
  /** Rough completion, for the progress bar on a card. */
  progress: number;
}

const STATUS: Record<string, StatusMeta> = {
  pending: { label: 'Pending', tone: accents.pending, progress: 10 },
  assigned: { label: 'Assigned', tone: accents.active, progress: 30 },
  in_progress: { label: 'In progress', tone: accents.active, progress: 50 },
  // Deliberately not "Submitted": to a student this reads as *their* submission.
  // It is the writer's draft sitting with the admin for review.
  solution_submitted: { label: 'In review', tone: accents.active, progress: 75 },
  released: { label: 'Delivered', tone: accents.done, progress: 90 },
  in_revision: { label: 'In revision', tone: accents.pending, progress: 80 },
  completed: { label: 'Completed', tone: accents.done, progress: 100 },
  cancelled: { label: 'Cancelled', tone: '#8a8496', progress: 0 },
};

export function statusLabel(status?: string): string {
  if (!status) return 'Unknown';
  return STATUS[status]?.label ?? status.replace(/_/g, ' ');
}

export function statusTone(status?: string): string {
  return STATUS[status ?? '']?.tone ?? brand.body;
}

export function progressFor(status?: string): number {
  return STATUS[status ?? '']?.progress ?? 0;
}

/**
 * The steps shown on the order detail page.
 *
 * `in_revision` is deliberately absent: it is a loop back into review, not a
 * stage of its own, and giving it a step would make the tracker jump backwards.
 */
export const ORDER_STEPS = ['Placed', 'Assigned', 'In progress', 'In review', 'Delivered'] as const;

export function activeStep(status?: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'assigned':
      return 1;
    case 'in_progress':
      return 2;
    case 'solution_submitted':
    case 'in_revision':
      return 3;
    case 'released':
      return 4;
    case 'completed':
      return ORDER_STEPS.length;
    default:
      return 0;
  }
}
