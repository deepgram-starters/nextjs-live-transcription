import { BarChartData, IToy, IUser } from "@/types/types";
import { MyResponsiveBar } from "./ui/BarChart";

export const data: BarChartData[] = [
  {
    country: "USA",
    "hot dog": 50,
    burger: 80,
    sandwich: 60,
    kebab: 40,
    fries: 90,
    donut: 70,
  },
  {
    country: "UK",
    "hot dog": 60,
    burger: 70,
    sandwich: 50,
    kebab: 30,
    fries: 80,
    donut: 60,
  },
  {
    country: "Canada",
    "hot dog": 70,
    burger: 60,
    sandwich: 40,
    kebab: 20,
    fries: 70,
    donut: 50,
  },
  // Add more data points as needed
];

interface ChartsProps {
  selectedUser: IUser | null;
  selectedToy: IToy | null;
}

const Charts: React.FC<ChartsProps> = ({ selectedUser, selectedToy }) => {
  // get the user data from the selected user and period
  return (
    <div className="h-80">
      <MyResponsiveBar data={data} />
    </div>
  );
};

export default Charts;
