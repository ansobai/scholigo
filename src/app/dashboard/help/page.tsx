import React from "react";
import PopularQuestion from "@/components/ui/PopularQuestions"; 
import IssueReport from "@/components/ui/Report";
import ServiceHours from "@/components/ui/ServiceHours";
import FastSupport from "@/components/ui/FastSupport";

const HelpCenter = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-start text-lightYellow">Help Center</h1>

            <div className="w-full flex flex-col md:flex-row gap-5"> {/* تعديل هنا */}
                <div className="min-w-[100%] md:min-w-[70%]"> {/* تعديل هنا */}
                    <PopularQuestion />
                </div>

                <div className="min-w-[100%] md:min-w-[30%]"> {/* تعديل هنا */}
                    <ServiceHours />
                </div>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-5"> {/* تعديل هنا */}
                <div className="min-w-[100%] md:min-w-[70%]"> {/* تعديل هنا */}
                    <IssueReport />
                </div>

                <div className="min-w-[100%] md:min-w-[30%]"> {/* تعديل هنا */}
                    <FastSupport />
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
