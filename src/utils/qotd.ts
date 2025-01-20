'use server';

import { createClient } from "@/utils/supabase/server";

export async function getQuoteOfTheDay() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('quotes').select('quote_text');

    if (error) {
        console.error("Error fetching quotes:", error);
        throw new Error("Failed to fetch quotes");
    }

    if (data && data.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const dayIndex = new Date(today).getDate() % data.length;
        return { quote: data[dayIndex]?.quote_text || "No quote found" };
    }

    return { quote: "No quotes available" };
}
