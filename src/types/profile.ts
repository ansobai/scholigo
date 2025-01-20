import {z} from "zod";

export type Profile = {
    id: string,
    name: string,
    avatar_url?: string,
    bio?: string,
    field?: string,
    university?: string,
    daily_goal: number,
    monthly_goal: number,
    interests?: string[],
}

export const profileSchema = z.object({
    name: z.string().min(3, {
        message: "Please enter your name"
    }).max(30, {
        message: "Name must be less than 30 characters"
    }),
    avatar: z.instanceof(File)
        .refine((file) => file.size < 5000000, {
            message: "File size must be less than 5MB",
        }).optional(),
    bio: z.string().nullish(),
    field: z.string().nullish(),
    university: z.string().nullish(),
    dailyGoal: z.number().positive({
        message: "Daily goal must be a positive number",
    }),
    monthlyGoal: z.number().positive({
        message: "Monthly goal must be a positive number",
    }),
    interests: z.array(z.string()).max(10, {
        message: "You can only have up to 10 interests",
    }).nullish(),
})