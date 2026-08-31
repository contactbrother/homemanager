/** Storage paths follow `{property_id}/{document_or_task_id}/{filename}`, which is what
 *  keeps the bucket policies simple enough to mirror the table policies. */
export function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
}
