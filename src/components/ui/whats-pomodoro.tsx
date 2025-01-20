import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./card";
import { CircleHelp } from "lucide-react";

const WhatsPomodoro = () => {
  const darkYellow = "#FFD700";

  return (
    <Card className="w-fit h-[485px] p-6 bg-darkBlue rounded-lg  border-[#043864] border-2">
      <CardHeader className="gap-6">
        <div className="flex flex-col items-start gap-4 font-bold">
          <CardTitle className="font-bold text-darkYellow text-5xl flex flex-row justify-between gap-2">
          <CircleHelp size={40} color={darkYellow} />
            What's Pomodoro?
          </CardTitle>
          <CardDescription className="text-white text-base">
            A Pomodoro Timer is a time-management tool that breaks work into
            intervals, typically 25 minutes of focused work followed by a
            5-minute break. After completing four work sessions, a longer break
            of 15–30 minutes is taken. This technique, known as the Pomodoro
            Technique, helps improve concentration and productivity by balancing
            work and rest, preventing burnout, and making tasks more manageable.
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
};

export default WhatsPomodoro;
