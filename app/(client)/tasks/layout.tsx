import { listTasks } from "@/features/tasks/queries";
import { getMyActivity } from "@/features/tasks/activity";
import { listProperties } from "@/features/properties/queries";
import { RequestsSplit } from "@/features/tasks/components/requests-split";

export default async function RequestsLayout({ children }: { children: React.ReactNode }) {
  const [tasks, properties, activity] = await Promise.all([listTasks(), listProperties(), getMyActivity()]);
  return (
    <RequestsSplit tasks={tasks} showProperty={properties.length > 1} activity={Object.fromEntries(activity)}>
      {children}
    </RequestsSplit>
  );
}
