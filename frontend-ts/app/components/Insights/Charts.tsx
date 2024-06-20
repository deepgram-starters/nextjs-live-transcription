import { dbGetConversation } from "@/db/conversations";
import supabaseServerClient from "@/db/supabaseServerClient";
import TopCard from "@/app/components/Insights/TopCard";
import { MyResponsiveBar } from "./BarChart";
import { MyResponsivePie } from "./PieChart";
import { MyResponsiveHeatMap } from "./Heatmap";
import { MyResponsiveLine } from "./LineChart";

export const data: BarChartData[] = [
    {
        country: "Entrancement",
        "Current Period": 200,
        "Previou Period": 93,
    },
    {
        country: "Excitement",
        "Current Period": 188,
        "Previou Period": 40,
    },
    {
        country: "Interest",
        "Current Period": 168,
        "Previou Period": 28,
    },
    {
        country: "Determination",
        "Current Period": 165,
        "Previou Period": 107,
    },
    {
        country: "Contempt",
        "Current Period": 145,
        "Previou Period": 26,
    },
];

export const pieData: PieChartData[] = [
    {
        id: "Positive",
        label: "Positive",
        value: 60.0,
    },
    {
        id: "Negative",
        label: "Negative",
        value: 24.5,
    },
    {
        id: "Neutral",
        label: "Neutral",
        value: 15.5,
    },
];

export const HeatMapData: HeatMapData[] = [
    {
        id: "Japan",
        data: [
            {
                x: "Train",
                y: -65348,
            },
            {
                x: "Subway",
                y: 31437,
            },
            {
                x: "Bus",
                y: 90254,
            },
            {
                x: "Car",
                y: 41562,
            },
            {
                x: "Boat",
                y: -9626,
            },
            {
                x: "Moto",
                y: -99736,
            },
            {
                x: "Moped",
                y: -65921,
            },
            {
                x: "Bicycle",
                y: -42891,
            },
            {
                x: "Others",
                y: 10186,
            },
        ],
    },
    {
        id: "France",
        data: [
            {
                x: "Train",
                y: 85301,
            },
            {
                x: "Subway",
                y: -60444,
            },
            {
                x: "Bus",
                y: 10959,
            },
            {
                x: "Car",
                y: 94452,
            },
            {
                x: "Boat",
                y: 21484,
            },
            {
                x: "Moto",
                y: -61793,
            },
            {
                x: "Moped",
                y: -86777,
            },
            {
                x: "Bicycle",
                y: 69156,
            },
            {
                x: "Others",
                y: 23816,
            },
        ],
    },
    {
        id: "US",
        data: [
            {
                x: "Train",
                y: -12326,
            },
            {
                x: "Subway",
                y: -32125,
            },
            {
                x: "Bus",
                y: 50279,
            },
            {
                x: "Car",
                y: 94819,
            },
            {
                x: "Boat",
                y: 66350,
            },
            {
                x: "Moto",
                y: -92854,
            },
            {
                x: "Moped",
                y: 92879,
            },
            {
                x: "Bicycle",
                y: 43272,
            },
            {
                x: "Others",
                y: -14192,
            },
        ],
    },
    {
        id: "Germany",
        data: [
            {
                x: "Train",
                y: 48961,
            },
            {
                x: "Subway",
                y: -20728,
            },
            {
                x: "Bus",
                y: 73743,
            },
            {
                x: "Car",
                y: -90951,
            },
            {
                x: "Boat",
                y: 22556,
            },
            {
                x: "Moto",
                y: -10717,
            },
            {
                x: "Moped",
                y: 50095,
            },
            {
                x: "Bicycle",
                y: -32067,
            },
            {
                x: "Others",
                y: -59123,
            },
        ],
    },
    {
        id: "Norway",
        data: [
            {
                x: "Train",
                y: 59485,
            },
            {
                x: "Subway",
                y: -19917,
            },
            {
                x: "Bus",
                y: 41351,
            },
            {
                x: "Car",
                y: -34041,
            },
            {
                x: "Boat",
                y: 1205,
            },
            {
                x: "Moto",
                y: 74829,
            },
            {
                x: "Moped",
                y: -42406,
            },
            {
                x: "Bicycle",
                y: 13178,
            },
            {
                x: "Others",
                y: 60414,
            },
        ],
    },
    {
        id: "Iceland",
        data: [
            {
                x: "Train",
                y: 82611,
            },
            {
                x: "Subway",
                y: 22359,
            },
            {
                x: "Bus",
                y: -49202,
            },
            {
                x: "Car",
                y: 62459,
            },
            {
                x: "Boat",
                y: -92128,
            },
            {
                x: "Moto",
                y: 80082,
            },
            {
                x: "Moped",
                y: 7981,
            },
            {
                x: "Bicycle",
                y: -63366,
            },
            {
                x: "Others",
                y: -48027,
            },
        ],
    },
    {
        id: "UK",
        data: [
            {
                x: "Train",
                y: 21073,
            },
            {
                x: "Subway",
                y: 74701,
            },
            {
                x: "Bus",
                y: 21975,
            },
            {
                x: "Car",
                y: -39841,
            },
            {
                x: "Boat",
                y: 40392,
            },
            {
                x: "Moto",
                y: 98508,
            },
            {
                x: "Moped",
                y: 57432,
            },
            {
                x: "Bicycle",
                y: 87882,
            },
            {
                x: "Others",
                y: -28709,
            },
        ],
    },
    {
        id: "Vietnam",
        data: [
            {
                x: "Train",
                y: -14991,
            },
            {
                x: "Subway",
                y: 5491,
            },
            {
                x: "Bus",
                y: -27812,
            },
            {
                x: "Car",
                y: -10829,
            },
            {
                x: "Boat",
                y: -10085,
            },
            {
                x: "Moto",
                y: 27205,
            },
            {
                x: "Moped",
                y: -81142,
            },
            {
                x: "Bicycle",
                y: -43939,
            },
            {
                x: "Others",
                y: -98853,
            },
        ],
    },
];

const lineData = [
    {
        id: "Negative",
        name: "Negative",
        data: [
            {
                x: 0,
                y: 7,
            },
            {
                x: 1,
                y: 5,
            },
            {
                x: 2,
                y: 11,
            },
            {
                x: 3,
                y: 12,
            },
            {
                x: 4,
                y: 13,
            },
            {
                x: 5,
                y: 14,
            },
            {
                x: 6,
                y: 12,
            },
        ],
    },
    {
        id: "Negative-P",
        name: "Negative-Prediction",
        data: [
            {
                x: 6,
                y: 12,
            },
            {
                x: 7,
                y: 10,
            },
            {
                x: 8,
                y: 15,
            },
        ],
    },
    {
        id: "Postive",
        name: "Postive",
        data: [
            {
                x: 0,
                y: 8,
            },
            {
                x: 1,
                y: 12,
            },
            {
                x: 2,
                y: 13,
            },
            {
                x: 3,
                y: 14,
            },
            {
                x: 4,
                y: 16,
            },
            {
                x: 5,
                y: 19,
            },
            {
                x: 6,
                y: 18,
            },
        ],
    },
    {
        id: "Postive-P",
        name: "Postive-Prediction",
        data: [
            {
                x: 6,
                y: 18,
            },
            {
                x: 7,
                y: 12,
            },
            {
                x: 8,
                y: 13,
            },
        ],
    },
    {
        id: "Neutral",
        name: "Neutral",
        data: [
            {
                x: 0,
                y: 9,
            },
            {
                x: 1,
                y: 10,
            },
            {
                x: 2,
                y: 12,
            },
            {
                x: 3,
                y: 10,
            },
            {
                x: 4,
                y: 12,
            },
            {
                x: 5,
                y: 15,
            },
            {
                x: 6,
                y: 13,
            },
        ],
    },
    {
        id: "Neutral-P",
        name: "Neutral-Prediction",
        data: [
            {
                x: 6,
                y: 13,
            },
            {
                x: 7,
                y: 9,
            },
            {
                x: 8,
                y: 12,
            },
        ],
    },
];

const barData = [
    { id: "june", "Key 1": 67, "Key 2": 52, "Key 3": 4 },
    { id: "july", "Key 1": 142, "Key 2": 104, "Key 3": 112 },
    { id: "aug", "Key 1": 113, "Key 2": 149, "Key 3": 88 },
    { id: "sept", "Key 1": 136, "Key 2": 149, "Key 3": 37 },
    { id: "oct", "Key 1": 60, "Key 2": 149, "Key 3": 55 },
    { id: "nov", "Key 1": 192, "Key 2": 65, "Key 3": 5 },
    { id: "dec", "Key 1": 146, "Key 2": 181, "Key 3": 193 },
];

interface ChartsProps {
    selectedUser: IUser | null;
    selectedToy: IToy | null;
}

const Charts: React.FC<ChartsProps> = async ({ selectedUser, selectedToy }) => {
    // get the user data from the selected user and period

    const supabase = supabaseServerClient();
    const data_ = await dbGetConversation(
        supabase,
        "24ecc593-098e-4550-b48a-6551f837fd8b"
    );
    console.log("+++++", data_.length, data_);
    return (
        <div>
            What you should do
            <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="w-full">
                    <h2 className="my-4 text-lg font-bold text-gray-700">
                        Main Emotions
                    </h2>
                    <div className="flex space-x-4">
                        <div className="flex-grow">
                            <TopCard
                                title="Happiness"
                                value="12.9%"
                                delta={11.2}
                                day={7}
                                type="top"
                            />
                        </div>
                        <div className="flex-grow">
                            <TopCard
                                title="Relief"
                                value="12.1%"
                                delta={-2.8}
                                day={7}
                                type="top"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full mt-2 md:mt-0">
                    <h2 className="my-4 text-lg font-bold text-gray-700">
                        Significant Emotional Shifts
                    </h2>
                    <div className="flex space-x-4">
                        <div className="flex-grow">
                            <TopCard
                                title="Anger"
                                value="5.9%"
                                delta={15.8}
                                day={7}
                                type="shift"
                            />
                        </div>
                        <div className="flex-grow">
                            <TopCard
                                title="Disappointment"
                                value="3.2%"
                                delta={-5.4}
                                day={7}
                                type="shift"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-8 mx-6-">
                <div className="w-full order-2 md:order-1  md:flex-grow">
                    <h2 className="mt-6 text-lg font-bold text-gray-700">
                        Emotions Over Time and Forecast
                    </h2>
                    <div className="h-96">
                        <MyResponsiveLine data={lineData} />
                    </div>
                </div>

                <div className="w-full order-1 md:order-2 md:w-72 md:flex-shrink-0">
                    <h2 className="mt-6 text-lg font-bold text-gray-700">
                        Current Emotions Proportions
                    </h2>
                    <div className="h-96">
                        <MyResponsivePie data={pieData} />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <h2 className="mt-6 text-lg font-bold text-gray-700">
                    Emotion Correlations
                </h2>
                <div className="h-[600px] md:h-[700px] lg:h-[800px]">
                    <MyResponsiveHeatMap data={HeatMapData} />
                </div>
            </div>
        </div>
    );
};

export default Charts;
