import { v4 as uuidv4 } from "uuid";

export const toys: IToy[] = [
    {
        id: "6c3eb71a-8d68-4fc6-85c5-27d283ecabc8",
        name: "Whisker",
        prompt: "You are a plushie explorer, with keen senses and a curiosity that knows no bounds. Your twitching whiskers and alert eyes are always on the lookout for the next great discovery, making every moment exciting and new.",
        humeAiConfigId: "0e2e4b87-4df2-4409-b4d6-7dc1cfcc444d",
        imageSrc: "/whisker.png",
    },
    {
        id: "56224f7f-250d-4351-84ee-e4a13b881c7b",
        name: "Coco",
        prompt: "You are a plushie connoisseur of comfort, radiating warmth and coziness. Your soft, chocolatey fur invites endless cuddles, and your calming presence is perfect for snuggling up on rainy days.",
        humeAiConfigId: "2eab6067-5583-47f9-8850-005ceb08935b",
        imageSrc: "/coco.png",
    },
    {
        id: "14d91296-eb6b-41d7-964c-856a8614d80e",
        name: "Tumble",
        prompt: "You are a plushie acrobat, always ready to roll, flip, and somersault into fun. With your boundless energy and playful spirit, every day is a new adventure waiting to happen!",
        humeAiConfigId: "6947ac53-5f3b-4499-abc5-f8b368552cb6",
        imageSrc: "/tumble.png",
    },
];

export const users: IUser[] = [
    {
        id: uuidv4(),
        parentName: "Alice Johnson",
        childName: "Timmy",
        childPersona:
            "Timmy is a smart kid in elementary who loves sports, especially soccer, and is a huge fan of Batman. He enjoys solving puzzles and building with LEGO.",
        childAge: "7",
        modules: ["MATH", "GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Bob Smith",
        childName: "Lucy",
        childPersona:
            "Lucy is a creative and artistic child who loves to draw and paint. She adores unicorns and spends hours crafting and making up stories about magical lands.",
        childAge: "8",
        modules: ["GENERAL_TRIVIA"],
    },
    {
        id: uuidv4(),
        parentName: "Catherine Lee",
        childName: "Ethan",
        childPersona:
            "Ethan is a curious and energetic boy who is fascinated by dinosaurs and space. He loves exploring the outdoors and has a knack for science experiments.",
        childAge: "6",
        modules: ["MATH", "GENERAL_TRIVIA", "SPELLING"],
    },
    {
        id: uuidv4(),
        parentName: "David Kim",
        childName: "Sophia",
        childPersona:
            "Sophia is a thoughtful and caring girl who loves animals and reading books. She often pretends to be a vet and takes great care of her stuffed animals.",
        childAge: "5",
        modules: ["GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Emma Brown",
        childName: "Jake",
        childPersona:
            "Jake is an adventurous and brave boy who enjoys action figures and superheroes. He dreams of being a firefighter and is always ready to help others.",
        childAge: "7",
        modules: ["MATH", "GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Frank Green",
        childName: "Mia",
        childPersona:
            "Mia is a lively and cheerful girl who loves dancing and singing. She is a big fan of princesses and spends her time dressing up and putting on performances.",
        childAge: "6",
        modules: ["GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Grace White",
        childName: "Aiden",
        childPersona:
            "Aiden is a tech-savvy and imaginative boy who enjoys video games and robots. He is always tinkering with gadgets and has a vivid imagination.",
        childAge: "8",
        modules: ["MATH", "GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Henry Black",
        childName: "Ella",
        childPersona:
            "Ella is a gentle and kind-hearted girl who loves flowers and fairy tales. She enjoys gardening with her parents and creating fairy gardens in the backyard.",
        childAge: "5",
        modules: ["GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Ivy Parker",
        childName: "Liam",
        childPersona:
            "Liam is a bright and energetic boy who loves cars and trucks. He enjoys playing with his toy vehicles and dreams of becoming a race car driver one day.",
        childAge: "7",
        modules: ["MATH", "GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
    {
        id: uuidv4(),
        parentName: "Jack Taylor",
        childName: "Chloe",
        childPersona:
            "Chloe is a bubbly and adventurous girl who loves the beach and marine life. She enjoys swimming and learning about different sea creatures.",
        childAge: "6",
        modules: ["GENERAL_TRIVIA", "SPELLING", "SCIENCE"],
    },
];
