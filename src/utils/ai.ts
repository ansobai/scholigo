'use server'

import {DataContent, streamText} from "ai";
import {openai} from "@ai-sdk/openai";
import {AiSystemPrompts} from "@/types/ai";

export async function aiStreamText(prompt: DataContent, systemPrompt: AiSystemPrompts = AiSystemPrompts.WHITEBOARD) {
    const { textStream } = streamText({
        model: openai('gpt-4o-mini', {
            downloadImages: true,
        }),
        system: systemPrompt,
        maxSteps: 1,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        image: prompt,
                    }
                ]
            }

        ]
    })

    return textStream
}