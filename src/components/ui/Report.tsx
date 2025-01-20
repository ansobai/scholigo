import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"


const IssueReport = () => {

    return (<>

        <Card className="w-auto min-h-[100%]">
            <CardHeader>

                <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow">

                    Issue Report

                </CardTitle>

            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-2">

                    <Textarea placeholder="Tell Us a little bit about your issue." />
                    <Button className=" my-3 text-black text-xs py-0.5 px-2 max-w-[200px]">Start Live Chat</Button>

                </div>
            </CardContent>
        </Card>

    </>)


}
export default IssueReport;