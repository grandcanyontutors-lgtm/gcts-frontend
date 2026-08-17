/**
 * Who sees which parts of an order.
 *
 * GCTS deliberately has no direct student↔writer relationship: work flows
 * student → admin → writer and back, and payment is arranged off-site. The UI
 * has to reflect that, so these rules live in one place rather than being
 * re-derived (differently) in every list and panel.
 *
 * The rules:
 *
 * - **The writer is never shown to a student.** Not "hidden until assigned" —
 *   never. Naming the writer would imply a working relationship the platform
 *   does not offer, and invites contact that is supposed to go through the
 *   admin.
 * - **The requester is not shown to themselves.** A student's own name in a
 *   column of their own orders is pure noise; staff need it to know whose work
 *   this is.
 * - **Cost belongs on the order, not in the list.** The admin sets it after
 *   review, so in a list it is blank more often than not; the detail page's
 *   Payment card carries the amount, the status and the instructions together,
 *   which is the only form in which it is actionable.
 */

export type OrderViewerRole = 'student' | 'writer' | 'admin' | undefined;

export interface OrderVisibility {
  /** The requester's identity — staff only. */
  requester: boolean;
  /** The assigned writer's identity — admin only. */
  writer: boolean;
  /** Cost and payment state in list rows and cards. */
  costInList: boolean;
  /** Writer assignment controls. */
  assignment: boolean;
}

export function orderVisibility(role: OrderViewerRole): OrderVisibility {
  const isAdmin = role === 'admin';
  const isStaff = isAdmin || role === 'writer';

  return {
    requester: isStaff,
    writer: isAdmin,
    costInList: isAdmin,
    assignment: isAdmin,
  };
}

/**
 * A person's display name from either serialiser shape.
 *
 * The API returns camelCase (`firstName`), but several components were reading
 * snake_case (`first_name`), which is why order lists rendered a bare
 * "Student:" with no name after it. Falling back to the username or email means
 * a row never renders an empty label.
 */
export function personName(person: any): string {
  if (!person) return '';
  const first = person.firstName ?? person.first_name ?? '';
  const last = person.lastName ?? person.last_name ?? '';
  const full = `${first} ${last}`.trim();
  return full || person.username || person.email || '';
}
