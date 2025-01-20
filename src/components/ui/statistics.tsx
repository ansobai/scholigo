import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { IoMdStats } from "react-icons/io";

const Statistics = () => {
    return (
        <>
            <Card className="w-auto min-h-[100%]">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow flex items-center">
                        <div className="flex items-center ml-4">
                            <IoMdStats className="text-[48px]" />
                            <p className="ml-2 text-[48px]">Statistics</p>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-xl">
                        You’ve spent <span className="text-yellow-400">10 hours</span> this week focusing!
                    </div>

                    <div>
                        That’s 15% increase (3 hours) compared to the last week!
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default Statistics;
