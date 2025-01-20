import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PopularQuestion = () => {
    return (
        <Card className="w-auto min-h-[100%]">
            <CardHeader>
                <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow">
                    Popular Questions
                </CardTitle>
            </CardHeader>
            <CardContent className="max-w-[500px] min-w-full ">



                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='text-xl' style={{ textDecoration: 'none' }}>Is it accessible?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='text-xl' style={{ textDecoration: 'none' }}>Is it accessible?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='text-xl' style={{ textDecoration: 'none' }}>Is it accessible?</AccordionTrigger>
                        <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>




            </CardContent>
        </Card>
    );
};

export default PopularQuestion;
