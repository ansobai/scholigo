import { Card, CardContent, CardTitle } from "@/components/ui/card";
import RankCard from "@/components/ui/ranks";

const leaderboard = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-start text-lightYellow">Leaderboard</h1>
            <div>
                <Card className="w-[1500px] h-[80px] mb-6"> 
                    <div className="flex justify-between w-full">
                        <CardTitle className="text-left ml-56 mt-4 text-lightYellow">NAME</CardTitle>
                        <CardTitle className="text-right mr-40 mt-4 text-lightYellow">RANK</CardTitle>
                    </div>
                    <CardContent></CardContent>
                </Card>

                <RankCard />
            </div>
        </div>
    );
}

export default leaderboard;
