"use client";

import ToyPicker from "./ToyPicker";

const IMAGE_SIZE = 200;

interface ProductsProps {
    allToys: IToy[];
    toy: IToy;
}

const Products: React.FC<ProductsProps> = ({ allToys, toy }) => {
    const chooseToy = (toy: IToy) => {};

    return (
        <ToyPicker
            allToys={allToys}
            chooseToy={chooseToy}
            currentToy={toy}
            imageSize={IMAGE_SIZE}
            buttonText={"Get started"}
            showCurrent={false}
        />
    );
};

export default Products;
