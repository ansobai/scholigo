import 'server-only'

import {cache} from "react";
import {createClient} from "@/utils/supabase/server";
import {unstable_cache} from "next/cache";

export const getUser = cache(async () => {
    const supabase = await createClient()

    const { data : { user }, error} = await supabase.auth.getUser()

    if (error || !user) {
        return null;
    }


    return unstable_cache(
        async () => {
            return user;
        },
        ["user", user.id],
        {
            tags: [`user_${user.id}`],
            // 30 minutes, jwt expires in 1 hour
            revalidate: 1800,
        },
    )();
});