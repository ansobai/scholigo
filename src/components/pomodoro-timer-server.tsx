import React from "react";
import { PomodoroTimer } from "./ui/timer-form";
import { createClient } from "@/utils/supabase/server";
import { getActiveSession } from "@/app/dashboard/pomodoro/actions";

const PomodoroTimerServer = async () => {
  const activeSession = await getActiveSession();

  if (activeSession != null) {
    const dateDiff =
      Date.now() - new Date(activeSession.session_start).getTime();
    const remainingTimeInSeconds = activeSession.duration - dateDiff / 1000;
    // Ensure remaining time is not negative
    const finalRemainingTimeInSeconds = Math.max(remainingTimeInSeconds, 0);

    const minutes = Math.floor(finalRemainingTimeInSeconds / 60);
    const seconds = Math.floor(finalRemainingTimeInSeconds % 60);

    return (
      <div>
        <PomodoroTimer
          initIsRunning={true}
          initMinutes={minutes}
          initSeconds={seconds}
          initCycleOn={false}
        />
      </div>
    );
  }

  return (
    <div>
      <PomodoroTimer
        initIsRunning={false}
        initMinutes={25}
        initSeconds={0}
        initCycleOn={true}
      />
    </div>
  );
};

export default PomodoroTimerServer;
