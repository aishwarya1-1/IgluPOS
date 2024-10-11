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
import { getSalesByDate } from "@/app/lib/actions"
import { useUser } from "@/context/UserContext"
import {SalesDataEntry} from "@/app/lib/actions"
import { ComponentBar } from "./Bar"
import { Report } from "./Report"
import ErrorComponent from "./ErrorComponent"



export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { userId } = useUser();
  const today = new Date();
  const lastWeek = subWeeks(today, 1);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: lastWeek,
    to: today,
  })

  const [graphResults,setgraphResults]= React.useState<SalesDataEntry[] >([])
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const fetchData = async () => {
     
      const st=format(lastWeek, "yyyy-MM-dd")
      const en=format(today, "yyyy-MM-dd")
      try{
      
    const defaultRes=await getSalesByDate(st,en,userId)
   
    setgraphResults(defaultRes)

      }catch(error){
        const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
    setError(errorMessage)
}
    }
    fetchData()
  }, []);
  // React.useEffect(() => {
  //   console.log('graphResults ',graphResults); // Log the updated graphResults
  // }, [graphResults]);

const handleGoClick = async () => {
  if(date !== undefined){
  if (date.from && date.to) {
    const startDate = format(date.from, "yyyy-MM-dd");
    const endDate = format(date.to, "yyyy-MM-dd");
 try{
   const graphResult=await getSalesByDate(startDate,endDate,userId)
   
   setgraphResults(graphResult)
 }catch(error){
  const errorMessage =
  error instanceof Error ? error.message : "An unknown error occurred";
  setError(errorMessage)
 }

  }
}
};

if (error) {
  return <ErrorComponent message={error} />;
}
  return (
    <div>
    <div className ="flex space-x-10">
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
      <Report data = {date} />
      </div>
      <div className="mt-6  pl-15"> {/* You can add margin or padding as needed */}
      {graphResults!==undefined && graphResults.length > 0 && <ComponentBar data={graphResults}  />}
      </div>
      
    </div>
  )
}
