import { TimetableGridEditor } from "@/components/editor/TimetableGridEditor";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditorPage({ params }: PageProps) {
  const { id } = await params;
  
  if (!id) return notFound();

  return <TimetableGridEditor timetableId={id} />;
}
