import { TimetableGridEditor } from "@/components/editor/TimetableGridEditor";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditorPage({ params }: PageProps) {
  const { id } = await params;
  
  if (!id) return notFound();

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // For protected routes, check if user owns the timetable
  const { data: timetable, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !timetable) {
    return notFound();
  }

  // Double check ownership if user exists
  if (user && (timetable as any).user_id !== user.id) {
     return redirect('/dashboard/timetables');
  }

  return <TimetableGridEditor timetableId={id} initialData={timetable} />;
}
