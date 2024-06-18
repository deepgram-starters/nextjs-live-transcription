import { SupabaseClient } from "@supabase/supabase-js";

export const dbInsertConversation = async (
    supabase: SupabaseClient,
    data: IConversation
) => {
    await supabase.from("conversations").insert([data]);
};
