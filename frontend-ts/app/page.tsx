// "use client";
import App from "./components/App";
import ChildPlayground from "./components/ChildPlayground";
import ParentDashboard from "./components/ParentDashboard";

const Home = () => {
    return (
        <div className="h-full overflow-hidden">
            {/* height 4rem */}
            <div className="bg-[#fff0f3] h-[4rem] flex items-center">
                <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
                    <div>
                        <a
                            className="flex items-center text-2xl font-bold text-pink-600"
                            href="/"
                        >
                            Parakeet AI
                        </a>
                    </div>
                </header>
            </div>
            <main className="mx-auto px-4 md:px-6 mt-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
                <div className="flex flex-col gap-6 h-full">
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-bold text-center">
                            Welcome to Parakeet AI
                        </h1>
                        <p className="text-center">
                            We make toys you can grow and learn with.
                        </p>
                    </div>
                    <div className="flex sm:flex-row flex-col gap-2 sm:h-[70%] h-full">
                        <div className="flex flex-col gap-2 sm:w-1/2 border border-black rounded-md">
                            <ParentDashboard />
                        </div>
                        <div className="flex flex-col gap-2 sm:w-1/2 border border-black rounded-md">
                            <ChildPlayground />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
