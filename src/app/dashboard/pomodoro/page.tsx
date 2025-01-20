import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";
import PomodoroTimerServer from "@/components/pomodoro-timer-server";
import React from "react";
import WhatsPomodoro from "@/components/ui/whats-pomodoro";
import Notes from "@/components/ui/notes";
import AudioCard from "@/components/ui/audio-player";


const page = () => {
  return (
    <div className="p-2">
      <h1 className="text-darkYellow scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-left">
        Pomodoro Timer
      </h1>

      <div className="flex flex-row items-start justify-between">
        <div className=" max-w-[30%]">
          <PomodoroTimerServer />
        </div>

        <div className=" max-w-[30%]">
          <WhatsPomodoro />
        </div>

        <div className=" max-w-[30%]">
          <Notes />
        </div>
        <div></div>
      </div>
      <div className="py-6 flex items-center justify-start gap-x-10 ">
  <AudioCard />
  <img src="/sessionstats.png" alt="session statistics" width={900} />
</div>

    </div>
  );
};

export default page;
