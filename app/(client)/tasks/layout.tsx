import { listTasks } from "@/features/tasks/queries";
import { listProperties } from "@/features/properties/queries";
import { RequestsSplit } from "@/features/tasks/components/requests-split";

export default async function RequestsLayout({ children }: { children: React.ReactNode }) {
  const [tasks, properties] = await Promise.all([listTasks(), listProperties()]);
  return (
    <RequestsSplit tasks={tasks} showProperty={properties.length > 1}>
      {children}
    </RequestsSplit>
  );
}
