import { getHumeAccessToken } from "@/lib/getHumeAccessToken";
import Playground from "../components/Playground";
import supabaseServerClient from "@/db/supabaseServerClient";
import { getUserById } from "@/db/users";
import { getToyById } from "@/db/toys";

export default async function Home() {
    const supabase = supabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const dbUser = await getUserById(supabase, user!.id);
    const dbToy = await getToyById(supabase, dbUser?.toy_id!);

    console.log("dbUser", dbUser);
    console.log("dbToy", dbToy);

    const accessToken = await getHumeAccessToken();

    if (!accessToken) {
        throw new Error();
    }

    return (
        <div className="flex flex-col gap-2 font-baloo2">
            <h1 className="text-4xl font-semibold">Playground</h1>
            {dbUser && dbToy && (
                <Playground
                    accessToken={accessToken}
                    selectedUser={dbUser}
                    selectedToy={dbToy}
                />
            )}
        </div>
    );
}
