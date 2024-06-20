"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TrendingDown } from "lucide-react";

interface CardProps {
    title: string;
    value: number | string | null;
    delta: number | null;
    day: number | null;
    type: string | null;
}

const TopCard: React.FC<CardProps> = ({ title, value, delta, day, type }) => {
    const isPositiveDelta = delta !== null && delta >= 0;
    // get the user data from the selected user and period

    const bgColor = type === "top" ? "bg-amber-500" : "bg-violet-500";
    const titleColor = type === "top" ? "text-amber-50" : "text-violet-50";
    const footerColor = type === "top" ? "text-amber-100" : "text-violet-100";

    return (
        <>
            <Card className={`${bgColor}`}>
                <CardHeader className="pt-4 pb-2 ">
                    <CardTitle
                        className={`text-base font-medium ${titleColor}`}
                    >
                        <div className="flex justify-between items-center w-full">
                            {title}
                        </div>
                    </CardTitle>
                    {/* <CardDescription className="text-2xl font-bold text-gray-800">
            + 1.8%
          </CardDescription> */}
                </CardHeader>
                <CardContent className="py-1 text-2xl font-bold text-white">
                    <p>{value}</p>
                </CardContent>

                <CardFooter
                    className={`text-sm ${footerColor} flex items-start`}
                >
                    {delta !== null &&
                        (isPositiveDelta ? (
                            <TrendingUp className="h-[20px] text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-[20px] text-rose-500 mr-1" />
                        ))}
                    <p>
                        {delta}% from last {day} days
                    </p>
                </CardFooter>
            </Card>
        </>
    );
};

export default TopCard;
