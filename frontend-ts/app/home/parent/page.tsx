import ParentDashboard from "@/app/components/ParentDashboard";
import supabaseServerClient from "@/db/supabaseServerClient";
import { getAllToys, getToyById } from "@/db/toys";
import { getUserById } from "@/db/users";

export default async function Home() {
    const supabase = supabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const dbUser = await getUserById(supabase, user!.id);
    const allToys = await getAllToys(supabase);

    return (
        <div className="flex flex-col gap-2 font-baloo2">
            <h1 className="text-4xl font-semibold">Parent controls</h1>
            {dbUser && (
                <ParentDashboard
                    selectedUser={dbUser}
                    selectedToy={dbUser.toy!}
                    allToys={allToys}
                />
            )}
        </div>
    );
}
