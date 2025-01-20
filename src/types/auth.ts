import {z} from "zod";
import google from "@public/oauth/google.svg";
import discord from "@public/oauth/discord.svg";
import github from "@public/oauth/github.svg";

export enum AuthStatus {
    Success = "success",
    Error = "error",
    Loading = "loading",
}

export enum OAuthProvider {
    Google = "google",
    Github = "github",
    Discord = "discord",
}

export const providerImages = {
    [OAuthProvider.Google]: google,
    [OAuthProvider.Github]: github,
    [OAuthProvider.Discord]: discord,
};

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
});

export const signupSchema = z.object({
    name: z.string().min(3, {
        message: "Please enter your name"
    }).max(30, {
        message: "Name must be less than 30 characters"
    }),
    email: z.string().email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string(),
    tos: z.boolean()
}).superRefine(({password, confirmPassword, tos}, ctx) => {
    if (password !== confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"]
        })
    }

    if (!tos) {
        ctx.addIssue({
            code: "custom",
            message: "You must agree to the terms of service",
            path: ["tos"]
        })
    }
});

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string(),
}).superRefine(({password, confirmPassword}, ctx) => {
    if (password !== confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"]
        })
    }
});

export const forgotPasswordSchema = loginSchema.omit({password: true});
