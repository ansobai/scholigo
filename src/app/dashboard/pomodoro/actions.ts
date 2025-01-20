//todo:
//handle stop
//handle tags

"use server";
import { PomodoroSession } from "@/types/pomodoro";
import { createClient } from "@/utils/supabase/server";
// Starting a Pomodoro Session
// Define the types for the parameters
interface StartPomodoroParams {
  userId: string;
  tagId: string;
  duration: string;
}

export async function getActiveSession(): Promise<PomodoroSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Failed to get logged in user", error);
    return null;
  }

  const { data: sessionInfo, error: sessionError } = await supabase
    .from("pomodoro")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (sessionError) {
    if (sessionError.details !== "The result contains 0 rows")
      console.error("No session was found", sessionError);
    return null;
  }

  const dateDiff = Date.now() - new Date(sessionInfo.session_start).getTime();
  const remainingTimeInSeconds = sessionInfo.duration - dateDiff / 1000;

  if (remainingTimeInSeconds <= 0) {
    await supabase.from("pomodoro").delete().eq("id", sessionInfo.id);
    return null;
  }

  return sessionInfo;
}

export async function startPomodoro(duration: number, tagId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get logged in user", userError);
    return null;
  }

  const { data: activeSession, error: checkError } = await supabase
    .from("pomodoro")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (checkError && checkError.details !== "The result contains 0 rows") {
    console.error("Failed to get active session", checkError);
    return {
      status: "error",
      message: "Failed to start pomodoro session",
    };
  }

  if (activeSession) {
    const dateDiff =
      Date.now() - new Date(activeSession.session_start).getTime();
    const remainingTimeInSeconds = activeSession.duration - dateDiff / 1000;

    if (remainingTimeInSeconds <= 0) {
      const { error: deleteError } = await supabase
        .from("pomodoro")
        .delete()
        .eq("id", activeSession.id);

      if (deleteError) {
        console.error("Error deleting expired session", deleteError);
        return {
          status: "error",
          message: "Error deleting expired session",
        };
      }
    } else {
      return {
        status: "error",
        message: "Active session already exists! Can't start a new one",
      };
    }
  }

  if (tagId) {
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", tagId)
      .single();

    if (tagError) {
      console.error("Failed to get tag belonging to user", tagError);
      return {
        status: "error",
        message: "Failed to get tag belonging to user",
      };
    }
  }

  const { data, error } = await supabase.from("pomodoro").insert({
    user_id: user.id,
    tag: tagId,
    duration,
  });

  if (error) {
    console.error("Error starting Pomodoro session", error);
    return {
      status: "error",
      message: "Error starting Pomodoro session",
    };
  }

  return {
    status: "success",
    message: "Session started!",
  };
}

export async function stopPomodoro() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: runningPomodoro, error: fetchError } = await supabase
    .from("pomodoro")
    .delete()
    .eq("user_id", user?.id)
    .single();
}
