import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { SiTodoist } from "react-icons/si";
import todoimg from "@public/todoimg.png";
import Image from "next/image";

const TODO = () => {
    return (
        <>
            <Card className="w-full max-w-5xl mx-auto p-8 min-h-[400px]">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow flex items-center">
                        <div className="flex items-center ml-4">
                            <SiTodoist className="text-[48px]" />
                            <span className="ml-2 text-[48px]">TODO</span>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col justify-between space-y-6">
                    <div className="flex justify-end">
                        <Image
                            src={todoimg}
                            alt="todo image"
                            className="w-48 h-auto"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <Checkbox id="terms1" className="w-6 h-6" />
                            <label
                                htmlFor="terms1"
                                className="font-semibold text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Read chapter 1 database
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox id="terms2" className="w-6 h-6" />
                            <label
                                htmlFor="terms2"
                                className="font-semibold text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Create UI design for project
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox id="terms3" className="w-6 h-6" />
                            <label
                                htmlFor="terms3"
                                className="font-semibold text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Finish mobile computing assignment
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default TODO;
