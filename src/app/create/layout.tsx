import { CreateTimetableProvider } from "./context";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CreateTimetableProvider>
      {children}
    </CreateTimetableProvider>
  );
}
