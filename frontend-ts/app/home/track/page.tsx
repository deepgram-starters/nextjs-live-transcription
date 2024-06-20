import Charts from "@/app/components/Insights/Charts";
import { getHumeAccessToken } from "@/lib/getHumeAccessToken";

export default async function Home() {
    const accessToken = await getHumeAccessToken();

    if (!accessToken) {
        throw new Error();
    }

    return (
        <div className="flex flex-col gap-2 font-baloo2">
            <h1 className="text-4xl font-semibold">Insights</h1>
            <div className="">
                <Charts selectedUser={null} selectedToy={null} />
            </div>
        </div>
    );
}
