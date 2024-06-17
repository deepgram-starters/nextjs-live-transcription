import { v4 as uuidv4 } from "uuid";

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
