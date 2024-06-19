import { dbGetConversation } from "@/db/conversations";
import supabaseServerClient from "@/db/supabaseServerClient";
import { MyResponsiveBar } from "@/app/components/BarChart";
import TopCard from "@/app/components/TopCard";

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

const Charts: React.FC<ChartsProps> = async ({ selectedUser, selectedToy }) => {
    // get the user data from the selected user and period

    const supabase = supabaseServerClient();
    const data_ = await dbGetConversation(
        supabase,
        "24ecc593-098e-4550-b48a-6551f837fd8b"
    );
    console.log("+++++", data_.length, data_);
    return (
        <>
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mx-6">
        <TopCard title="Happiness" value="12.9%" delta={11.2} day={7} />
        <TopCard title="Relief" value="12.1%" delta={-2.8} day={7} />
        <TopCard title="Anger" value="5.9%" delta={15.8} day={7} />
        <TopCard title="Disappointment" value="3.2%" delta={-5.4} day={7} />
      </div> */}

            <div className="flex flex-col md:flex-row md:space-x-4 mx-6">
                <div className="w-full">
                    <h2 className="my-3 text-lg font-medium text-gray-700">
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
                    <h2 className="my-3 text-lg font-medium text-gray-700">
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

            <div className="flex flex-col md:flex-row md:space-x-4 mx-6">
                <div className="order-2 md:order-1 h-96 md:flex-grow">
                    <MyResponsiveBar data={data} />
                </div>
                {/* <div className="order-2 md:order-1 h-96 md:flex-grow">
          <MyResponsiveBar data={data} />
        </div> */}
                <div className="order-1 md:order-2 h-96 w-full md:w-96 bg-gray-200 md:flex-shrink-0">
                    {" "}
                    pie chart (postive/negative Emotions)
                </div>
            </div>
        </>
    );
};

export default Charts;
