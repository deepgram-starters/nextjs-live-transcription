"use client";

import { toys } from "@/lib/data";
import Image from "next/image";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const IMAGE_SIZE = 320;

const Products = () => {
    const [selectedToy, setSelectedToy] = useState<IToy | null>(null);
    const chooseToy = (toy: IToy) => {
        setSelectedToy(toy);
    };
    return (
        <div className="flex md:flex-col flex-col-reverse gap-8 pb-6">
            <div className="flex md:mt-7 md:flex-row flex-col gap-8 items-center justify-center">
                {toys.map((toy) => {
                    const chosen = selectedToy?.toy_id === toy.toy_id;
                    return (
                        // <HoverCard key={toy.toy_id}>
                        //     <HoverCardTrigger asChild>

                        //     </HoverCardTrigger>
                        //     <HoverCardContent className="w-80">
                        //         <div className="p-4">
                        //             <div className="font-bold">{toy.name}</div>
                        //             <div className="text-gray-600">
                        //                 {toy.prompt}
                        //             </div>
                        //         </div>
                        //     </HoverCardContent>
                        // </HoverCard>
                        <div key={toy.toy_id} className="flex flex-col gap-2 ">
                            <div
                                className={`flex flex-col max-w-[320px] border max-h-[320px] gap-2 mb-4 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 ease-in-out`}
                                onClick={() => chooseToy(toy)}
                            >
                                <Image
                                    src={toy.image_src!}
                                    width={IMAGE_SIZE}
                                    height={IMAGE_SIZE}
                                    alt={toy.name}
                                    className="transition-transform duration-300 ease-in-out transform hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="font-baloo2 text-2xl font-normal">
                                    {toy.name}
                                </div>
                                {chosen && (
                                    <>
                                        <div className="font-quicksand max-w-[320px] text-gray-600 text-sm font-normal">
                                            {toy.third_person_prompt}
                                        </div>
                                        <Button
                                            variant="pink"
                                            className="font-bold text-lg flex flex-row gap-2 items-center"
                                        >
                                            <span>Get started</span>
                                            <ArrowRight
                                                strokeWidth={3}
                                                size={20}
                                            />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {!selectedToy && (
                <p className="flex self-center">
                    (pick your favorite plushie to get started!)
                </p>
            )}
            {/* {selectedToy ? (
                <div className="flex flex-row gap-4 rounded-md font-quicksand self-center items-center p-2 w-fit">
                    <div className="flex flex-col">
                        <p className="font-bold text-lg">
                            Great choice! You picked {selectedToy.name}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="flex self-center">
                    (pick your favorite plushie to get started!)
                </p>
            )} */}
        </div>
    );
};

export default Products;
