import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { CgHello } from "react-icons/cg";
import helloimg from '@public/hello.png';
import Image from "next/image";

const Welcome = () => {
    return (
        <>
            <Card className="w-auto min-h-[100%]">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow flex justify-between items-start">
                        <div className="flex items-center">
                            <CgHello className="text-[48px]" />
                            <p className="ml-2 text-[48px]">WELCOME, ABODE!</p>
                        </div>

                        <div className="flex">
                            <Image
                                src={helloimg}
                                alt="hello image"
                                className="ml-auto mt-[-35px] mr-1 w-60 h-15"
                            />
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-xl max-w-[400px] mt-[-51px]">
                        New day, new you! Start your study session now! Your goal for the day: 2 hours
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default Welcome;
