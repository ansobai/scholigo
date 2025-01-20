import Qotd from "@/components/qotd";
import Statistics from "@/components/ui/statistics";
import TODO from "@/components/ui/todo";
import Welcome from "@/components/ui/welcome";

export default function DashboardPage() {
    return (
        <div className="w-full h-screen p-6 space-y-6">
            <h1 className="text-3xl font-bold text-start text-lightYellow">Dashboard</h1>

            <div className="w-full flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                    <Welcome />
                </div>
                <div className="w-full lg:w-1/3">
                    <Qotd />
                </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row gap-6 flex-grow">
                <div className="w-full lg:w-1/2 h-full">
                    <Statistics />
                </div>
                <div className="w-full lg:w-1/2 h-full">
                    <TODO />
                </div>
            </div>
        </div>
    );
}
