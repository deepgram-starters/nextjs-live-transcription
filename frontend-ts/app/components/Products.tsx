"use client";

import { useState } from "react";
import ToyPicker from "./ToyPicker";

const IMAGE_SIZE = 200;

interface ProductsProps {
    allToys: IToy[];
}

const Products: React.FC<ProductsProps> = ({ allToys }) => {
    const [selectedToy, setSelectedToy] = useState<IToy | null>(null);
    const chooseToy = (toy: IToy) => {
        setSelectedToy(toy);
    };
    return (
        <ToyPicker
            allToys={allToys}
            chooseToy={chooseToy}
            selectedToy={selectedToy}
            imageSize={IMAGE_SIZE}
            buttonText={"Get started"}
        />
    );
};

export default Products;
