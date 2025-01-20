"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsIcon } from "lucide-react";
import { PlayIcon, CircleCheckBig } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  startPomodoro,
  stopPomodoro,
} from "@/app/dashboard/pomodoro/actions";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ToggleGroupDemo({
  onToggle,
  isCycleOn,
}: {
  onToggle: any;
  isCycleOn: boolean;
}) {
  return (
    <ToggleGroup type="single" className="flex gap-2" onValueChange={onToggle}>
      <ToggleGroupItem
        value="Pomodoro"
        aria-label="Toggle pomodoro"
        className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-lightLightYellow data-[state=on]:bg-darkYellow"
        disabled={isCycleOn}
      >
        Pomodoro
      </ToggleGroupItem>
      <ToggleGroupItem
        value="Short Break"
        aria-label="Toggle short break"
        className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-lightLightYellow data-[state=on]:bg-darkYellow"
        disabled={isCycleOn}
      >
        Short Break
      </ToggleGroupItem>
      <ToggleGroupItem
        value="Long Break"
        aria-label="Toggle long break"
        className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-lightLightYellow data-[state=on]:bg-darkYellow"
        disabled={isCycleOn}
      >
        Long Break
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function DialogSettings({
  handleSwitchChange,
  isCycleOn,
}: {
  handleSwitchChange: (value: boolean) => void;
  isCycleOn: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SettingsIcon className="mt-2 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cycle Pomodoro</DialogTitle>
          <DialogDescription>
            If turned on, after the break finishes another session will start.
            After four sessions, a long break will be given.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="switch" className="sr-only">
              pomodoro cycle
            </Label>
            <SwitchPomodoro
              isCycleOn={isCycleOn}
              onToggle={handleSwitchChange}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <div className="bg-lightYellow rounded text-blackBluish font-extrabold">
              <Button type="button" variant="secondary">
                Close
              </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SwitchPomodoro({
  onToggle,
  isCycleOn,
}: {
  onToggle: (value: boolean) => void;
  isCycleOn: boolean;
}) {
  const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  };

  useEffect(() => {
    const cookieValue = getCookie("isCycleOn");
    if (cookieValue) {
      onToggle(cookieValue === "true");
    }
  }, []);

  const handleToggle = () => {
    const newValue = !isCycleOn;
    setCookie("isCycleOn", newValue.toString());
    onToggle(newValue);
  };

  return (
    <div className="flex items-center space-x-2 text-blackBluish font-bold">
      <Switch
        id="cycle-mode"
        checked={isCycleOn}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="cycle-mode" className="text-white">
        Cycle Pomodoro: {isCycleOn ? "On" : "Off"}
      </Label>
    </div>
  );
}



export function PomodoroTimer({
  initMinutes,
  initSeconds,
  initIsRunning,
  initCycleOn,
}: {
  initMinutes: number;
  initSeconds: number;
  initIsRunning: boolean;
  initCycleOn: boolean;
}) {
  const [minutes, setMinutes] = useState(initMinutes);
  const [seconds, setSeconds] = useState(initSeconds);
  const [isRunning, setIsRunning] = useState(initIsRunning);
  const [currentMode, setCurrentMode] = useState("Pomodoro");
  const [isBreak, setIsBreak] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const [isCycleOn, setIsCycleOn] = useState(initCycleOn);

  const handleSwitchChange = (value: boolean): void => {
    setIsCycleOn(value);
  };

    // setMinutes(25);
    // setSeconds(0);

  let sessionCounter = 0;
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    // setMinutes(25);
    // setSeconds(0);

    if (isRunning && (minutes > 0 || seconds > 0)) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0 && seconds === 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (isRunning && minutes === 0 && seconds === 0) {
      sessionCounter += 1;
      handleSwitchMode();
    }

    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]);

  const handleStart = async () => {
    if (minutes > 0 || seconds > 0) {
      setIsRunning(true);
      const result = await startPomodoro(minutes * 60 + seconds);

      if (!result || result.status == "error") {
        toast({
          title: "Failed to start a pomodoro session",
          variant: "destructive",
        });
        setIsRunning(false);
      }
    }
  };


  const handleStop = async () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
    setCurrentMode("Pomodoro");
    stopPomodoro();
  };

  const handleToggle = (value: string) => {
    if (value === "Pomodoro") {
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);
    } else if (value === "Short Break") {
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
    } else if (value === "Long Break") {
      setIsBreak(true);
      setMinutes(15);
      setSeconds(0);
    }
    setCurrentMode(value);
    setIsRunning(false);
    return value;
  };

  const handleSwitchMode = () => {
    if (!isBreak && sessionCounter <= 3) {
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
      setIsRunning(true);
    } else {
      setIsBreak(true);
      setCurrentMode(handleToggle);
      setMinutes(20);
      setSeconds(0);
      setIsRunning(true);
      sessionCounter=0;
    }
  };
  

  const toggleSettingsMenu = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  return (
    <Card className="w-fit h-[485px] border-2">
      <CardHeader className="">
        <CardTitle className="font-bold text-darkYellow text-5xl flex flex-row justify-between">
          Timer
          <DialogSettings
            handleSwitchChange={handleSwitchChange}
            isCycleOn={isCycleOn}
          />
        </CardTitle>
        <ToggleGroupDemo onToggle={handleToggle} isCycleOn={isCycleOn} />
      </CardHeader>

      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">
          {isBreak ? "Break Time" : "Study Time"}
        </h2>
        <div className="flex justify-center items-center p-6">
          <div className="flex flex-row items-center justify-center gap-2 h-20">
            <Input
              type="number"
              disabled={isCycleOn}
              value={minutes}
              onChange={(e) =>
                !isRunning &&
                setMinutes(Math.min(60, Math.max(0, Number(e.target.value))))
              }
              placeholder="Minutes"
              className={`text-center text-blackBluish font-bold w-24 h-20 border-4 border-darkYellow rounded bg-white ${
                isRunning
                  ? "pointer-events-none bg-white cursor-not-allowed"
                  : "hover:bg-white"
              } placeholder:text-sm md:text-3xl`}
              style={{
                backgroundColor: "white",
                opacity: 1,
              }}
            />

            <h1 className="font-bold text-4xl text-white px-2 bg-darkBlue">
              :
            </h1>

            <Input
              type="number"
              disabled={isCycleOn}
              value={seconds}
              onChange={(e) =>
                !isRunning &&
                setMinutes(Math.min(60, Math.max(0, Number(e.target.value))))
              }
              placeholder="Seconds"
              className={`text-center text-blackBluish font-bold w-24 h-20 border-4 border-darkYellow rounded bg-white ${
                isRunning
                  ? "pointer-events-none bg-white cursor-not-allowed"
                  : "hover:bg-white"
              } placeholder:text-sm md:text-3xl`}
              style={{
                backgroundColor: "white",
                opacity: 1,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-4 mb-4">
        <Select>
          <SelectTrigger className="w-[140px] bg-white text-black border font-bold border-darkYellow">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent className="bg-darkBlue">
            <SelectGroup>
              <SelectLabel className="font-bold text-darkYellow">
                Tags
              </SelectLabel>
              <SelectItem
                className="bg-lightYellow hover:bg-darkYellow text-blackBluish border border-gray-200 rounded-md px-4 py-2 font-bold mb-2 flex justify-center items-center"
                value="tag 1"
              >
                Tag 1
              </SelectItem>
              <SelectItem
                className="bg-lightYellow hover:bg-darkYellow text-blackBluish border border-gray-200 rounded-md px-4 py-2 font-bold mb-2 flex justify-center items-center"
                value="tag 2"
              >
                Tag 2
              </SelectItem>
              <SelectItem
                className="bg-lightYellow hover:bg-darkYellow text-blackBluish border border-gray-200 rounded-md px-4 py-2 font-bold flex justify-center items-center"
                value="tag 3"
              >
                Tag 3
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row items-center justify-center gap-4">
        {!isRunning && (
          <button
            onClick={handleStart}
            className="flex flex-row items-center justify-center gap-2 bg-darkYellow w-20 h-10 text-black border-darkYellow font-bold rounded hover:bg-light"
          >
            <PlayIcon size={15} />
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={handleStop}
            className="flex flex-row items-center justify-center gap-2 bg-gray-300 w-20 h-10 text-black border-darkYellow rounded hover:bg-light"
          >
            <CircleCheckBig size={15} />
            stop
          </button>
        )}
      </div>
    </Card>
  );
}
