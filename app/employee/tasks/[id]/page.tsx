import TaskDetail from "@/components/TaskDetail";

export default async function EmployeeTaskDetailPage(
  props: PageProps<"/employee/tasks/[id]">
) {
  const { id } = await props.params;

  return <TaskDetail taskId={id} backHref="/employee" />;
}
