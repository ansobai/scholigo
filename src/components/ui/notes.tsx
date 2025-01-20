import React from "react";
import { Card, CardTitle, CardHeader } from "./card";
import { NotebookPen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const grey = "#A8A8A8";
export function TextareaNotes() {
  return (
    <div className="grid w-full gap-1.5 text font-bold h-[500px]">
      {/* <Label htmlFor="message">Your Message</Label> */}
      <Textarea
        placeholder="Type your notes here."
        id="message"
        className="bg-white text-black  border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-sm text-muted-foreground font-mono">
        Notes will be saved in this session only.
      </p>
    </div>
  );
}

const darkYellow = "#FFD700";
const notes = () => {
  return (
    <Card className="w-fit h-[485px] p-6 border-2 ">
      <CardHeader className="gap-6">
        <CardTitle className="font-bold text-darkYellow text-5xl flex flex-row justify-between gap-2">
          <NotebookPen size={40} color={darkYellow} />
          Notes
        </CardTitle>
        <TextareaNotes />
      </CardHeader>
    </Card>
  );
};

export default notes;
