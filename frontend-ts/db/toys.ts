import { SupabaseClient } from "@supabase/supabase-js";

export const getToyById = async (supabase: SupabaseClient, toy_id: string) => {
    const { data, error } = await supabase
        .from("toys")
        .select("*")
        .eq("toy_id", toy_id)
        .single();

    if (error) {
        console.log("error", error);
    }

    return data as IToy | undefined;
};
