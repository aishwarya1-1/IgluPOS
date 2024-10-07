"use client"

import * as React from "react"
import { addDays, format ,subWeeks} from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const today = new Date();
  const lastWeek = subWeeks(today, 1);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: lastWeek,
    to: today,
  })
console.log(date)

const handleGoClick = () => {
  if(date !== undefined){
  if (date.from && date.to) {
    const startDate = format(date.from, "yyyy-MM-dd");
    const endDate = format(date.to, "yyyy-MM-dd");
    console.log("Start Date:", typeof(startDate));
    console.log("End Date:", endDate);
    // Do something with startDate and endDate here
  }
}
};
  return (
    <div className={cn("flex flex-col space-y-4 pl-10 p-5 border border-gray-300 rounded-md max-w-md ml-10", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={{ after: today }} 
          />
        </PopoverContent>
      </Popover>
      <Button className= "w-20 pl-18" onClick={handleGoClick}>Go</Button>
    </div>
  )
}
