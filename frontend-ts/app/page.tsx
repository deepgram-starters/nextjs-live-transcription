import { getHumeAccessToken } from "@/lib/getHumeAccessToken";
import Products from "./components/Products";
import supabaseServerClient from "@/db/supabaseServerClient";
import { getAllToys } from "@/db/toys";

export default async function Home() {
    const accessToken = await getHumeAccessToken();

    if (!accessToken) {
        throw new Error();
    }
    const supabase = supabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log(user);

    const allToys = await getAllToys(supabase);

    return (
        <div className="h-full font-quicksand">
            {/* height 4rem */}

            <main className="mx-auto px-4 md:px-6 mt-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
                <div className="flex flex-col gap-6 h-full">
                    <div className="flex flex-col items-center gap-2 justify-center">
                        <h1 className="text-4xl font-bold text-center ">
                            Welcome to Parakeet toys :)
                        </h1>
                        <p className="text-center text-lg font-quicksand">
                            We make AI-enabled toys for children that foster
                            learning & growth.
                        </p>
                    </div>
                    <Products allToys={allToys} />
                </div>
            </main>
        </div>
    );
}
