"use client";

import * as React from "react";
import useSound from "use-sound";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Slider } from "@/components/ui/slider";
import { NotebookPen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./card";
import { Music4 } from "lucide-react";
import { Volume2 } from "lucide-react";

const rain = "/audio/rain.mp3";
const dryer = "/audio/dryer.mp3";
const fan = "/audio/fan.mp3";
const ocean = "/audio/ocean.mp3";
const water = "/audio/water.mp3";
const whiteNoise = "/audio/white-noise.mp3";

export function AudioPlayer() {
  const [selectedAudio, setSelectedAudio] = React.useState<
    "rain" | "dryer" | "fan" | "ocean" | "water" | "whiteNoise"
  >("rain");

  const [volume, setVolume] = React.useState(0.3);

  const audioMap = {
    rain,
    dryer,
    fan,
    ocean,
    water,
    whiteNoise,
  };

  const [playSound, { stop: stopCurrent }] = useSound(audioMap[selectedAudio], {
    volume,
    loop: true,
  });

  const currentSoundRef = React.useRef<(() => void) | null>(null);

  const handlePlay = () => {
    if (currentSoundRef.current) {
      currentSoundRef.current();
    }
    playSound();
    currentSoundRef.current = stopCurrent;
  };

  return (
    <div className="p-4 bg-darkBlue text-white rounded-md w-[220px] flex flex-col items-center gap-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-[130px] bg-white text-black font-bold"
          >
            {selectedAudio.replace("-", " ")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Audio</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedAudio}
            onValueChange={(value) => {
              if (currentSoundRef.current) {
                currentSoundRef.current();
              }
              setSelectedAudio(
                value as
                  | "rain"
                  | "dryer"
                  | "fan"
                  | "ocean"
                  | "water"
                  | "whiteNoise"
              );
            }}
          >
            <DropdownMenuRadioItem  className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow"value="rain">Rain</DropdownMenuRadioItem>
            <DropdownMenuRadioItem  className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow"value="dryer">Dryer</DropdownMenuRadioItem>
            <DropdownMenuRadioItem  className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow"value="fan">Fan</DropdownMenuRadioItem>
            <DropdownMenuRadioItem  className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow"value="ocean">Ocean</DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow" value="water">Water</DropdownMenuRadioItem>
            <DropdownMenuRadioItem  className="bg-white text-black font-bold px-4 py-2 rounded hover:bg-darkYellow"value="whiteNoise">
              White Noise
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center justify-center">
        <span role="img" aria-label="volume" className="mr-2"></span>
        <Volume2 color={darkYellow} />
        <Slider
          defaultValue={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(value: number[]) => setVolume(value[0] / 100)}
          className="bg-darkYellow rounded w-[90px]"
        />
      </div>
      <div className="flex justify-center">
        <Button
          className="flex flex-row items-center justify-center gap-2 bg-darkYellow w-20 h-10 text-black border-darkYellow rounded hover:bg-light"
          onClick={handlePlay}
        >
          Play
        </Button>
      </div>
    </div>
  );
}

const darkYellow = "#FFD700";

const AudioCard = () => {
  return (
    <Card className="w-[260px] h-[320px] border-2 bg-darkBlue">
      <CardHeader className="gap-6">
        <CardTitle className="font-bold text-darkYellow text-5xl flex flex-row justify-between gap-2">
          <Music4
            size={60}
            color={darkYellow}
            className="text-darkYellow text-5xl flex flex-row justify-between gap-2"
          />
          Music
        </CardTitle>
      </CardHeader>
      <AudioPlayer />
    </Card>
  );
};

export default AudioCard;
