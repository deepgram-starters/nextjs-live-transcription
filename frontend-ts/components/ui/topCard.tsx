import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoMdTrendingUp } from "react-icons/io";
import { IoMdTrendingDown } from "react-icons/io";

interface CardProps {
  title: string;
  value: number | string | null;
  delta: number | null;
  day: number | null;
  type: string | null;
}

const TopCard: React.FC<CardProps> = async ({
  title,
  value,
  delta,
  day,
  type,
}) => {
  const isPositiveDelta = delta !== null && delta >= 0;
  // get the user data from the selected user and period

  const bgColor = type === "top" ? "bg-amber-500" : "bg-violet-500";
  const titleColor = type === "top" ? "text-amber-50" : "text-violet-50";
  const footerColor = type === "top" ? "text-amber-100" : "text-violet-100";

  return (
    <>
      <Card className={`${bgColor}`}>
        <CardHeader className="pt-4 pb-2 ">
          <CardTitle className={`text-base font-medium ${titleColor}`}>
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

        <CardFooter className={`text-sm ${footerColor}`}>
          {/* <div className="flex justify-between items-center w-full"> */}
          {delta !== null &&
            (isPositiveDelta ? (
              <IoMdTrendingUp className="text-xl text-green-500 mr-1" />
            ) : (
              <IoMdTrendingDown className="text-xl text-red-500 mr-1" />
            ))}
          <p>
            {delta}% from last {day} days
          </p>

          {/* </div> */}
        </CardFooter>
      </Card>
    </>
  );
};

export default TopCard;
