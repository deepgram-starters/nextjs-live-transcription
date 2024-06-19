import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface ToyPickerProps {
    selectedToy: IToy | null;
    chooseToy: (toy: IToy) => void;
    allToys: IToy[];
    imageSize: number;
    buttonText: string;
}

const ToyPicker: React.FC<ToyPickerProps> = ({
    selectedToy,
    allToys,
    chooseToy,
    imageSize,
    buttonText,
}) => {
    console.log("allToys", allToys);
    return (
        <div className="flex md:flex-col flex-col-reverse gap-8 pb-6">
            <div className="flex md:mt-7 md:flex-row flex-col gap-8 items-center justify-center">
                {allToys.map((toy) => {
                    const chosen = selectedToy?.toy_id === toy.toy_id;
                    return (
                        <div key={toy.toy_id} className="flex flex-col gap-2 ">
                            <div
                                className={`flex flex-col max-w-[320px] max-h-[320px] gap-2 mb-4 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 ease-in-out`}
                                onClick={() => chooseToy(toy)}
                            >
                                <Image
                                    src={"/" + toy.image_src! + ".png"}
                                    width={imageSize}
                                    height={imageSize}
                                    alt={toy.name}
                                    className="transition-transform duration-300 ease-in-out scale-90 transform hover:scale-100"
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
                                            <span>{buttonText}</span>
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
        </div>
    );
};

export default ToyPicker;
