import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { GoGoal } from "react-icons/go";


const Goals = () => {

    return (<>

        <Card className="w-auto min-h-[100%]">
            <CardHeader>
                <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow flex items-center">
                    <div className="flex items-center ml-4">
                        <GoGoal className="text-[48px]" />
                        <p className="ml-2 text-[48px]">Goals</p>
                    </div>

                </CardTitle>

            </CardHeader>
            <CardContent>

                <div className="text-xl ">

                    You’ve spent <span className="text-yellow-400">30 </span>  Hours Weekly Goal

                </div>

                <div >

                    You’ve spent <span className="text-yellow-400">120</span> Monthly Weekly Goal

                </div>



            </CardContent>
        </Card>

    </>)

}

export default Goals;