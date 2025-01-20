'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuoteOfTheDay } from "@/utils/qotd";

export default function Qotd() {
    const [quote, setQuote] = useState<string>("Loading...");

    const fetchQuote = async () => {
        try {
            const res = await getQuoteOfTheDay();
            setQuote(res.quote);
        } catch (error) {
            console.error("Error fetching the quote:", error);
            setQuote("Error fetching the quote");
        }
    };

    useEffect(() => {
        fetchQuote();
    }, []);

    return (
        <Card className="w-auto min-h-[100%]">
            <CardHeader>
                <CardTitle className="text-[48px] scroll-m-20 font-semibold tracking-tight text-lightYellow">
                    QOTD
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-balance text-lg leading-7 [&:not(:first-child)]:mt-6">
                    {quote}
                </p>
            </CardContent>
        </Card>
    );
}
