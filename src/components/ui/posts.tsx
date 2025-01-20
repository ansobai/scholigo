import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { BiMessageAltDetail } from "react-icons/bi";

const Posts = () => {
    return (
        <>
            <Card className="w-auto min-h-[100%]">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow flex items-center">
                        <div className="flex items-center ml-4">
                            <BiMessageAltDetail className="text-[48px]" />
                            <p className="ml-2 text-[48px]">Posts</p>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-xl border-b border-lightYellow pb-4 mb-4">
                        New event is here! Come to E3 @ 12 14/11 for a cup of coffee
                    </div>

                    <div className="text-xl">
                        Midterms are coming! And we’re here for you. Come to CSM-101 tmrrw for a physics review
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default Posts;
