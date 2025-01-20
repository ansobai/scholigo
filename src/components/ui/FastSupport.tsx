import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const FastSupport = () => {
    return (
        <>
            <Card className="w-auto">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow">
                        Fast Support
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col space-y-2">
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Account Settings
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Reset Your Password
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            View Order History
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Manage Your Subscriptions
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Change Your Payment Method
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Cancel Subscription
                        </Link>
                        <Link href="" className="text-blue-600 hover:underline text-white">
                            Delete Your Account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default FastSupport;
