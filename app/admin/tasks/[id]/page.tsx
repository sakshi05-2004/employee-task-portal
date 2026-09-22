import TaskDetail from "@/components/TaskDetail";

export default async function AdminTaskDetailPage(
  props: PageProps<"/admin/tasks/[id]">
) {
  const { id } = await props.params;

  return <TaskDetail taskId={id} backHref="/admin/tasks/board" />;
}
