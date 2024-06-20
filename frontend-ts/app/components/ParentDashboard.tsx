"use client";

import ToyPicker from "./ToyPicker";

interface ParentDashboardProps {
    selectedUser: IUser | null;
    // chooseUser: (user: IUser) => void;
    selectedToy: IToy;
    // chooseToy: (toy: IToy) => void;
    allToys: IToy[];
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
    selectedUser,
    selectedToy,
    allToys,
}) => {
    // const [displayUsers, setDisplayUsers] = useState<IUser[]>(users);
    // useEffect(() => {
    //     if (selectedUser) {
    //         setDisplayUsers([
    //             selectedUser,
    //             ...users.filter(
    //                 (user) => user.user_id !== selectedUser.user_id
    //             ),
    //         ]);
    //     }
    // }, [selectedUser]);
    return (
        <div className="p-4 overflow-hidden w-full flex-auto">
            {/* <p>Parent dashboard (choose your characters)</p> */}
            {/* <div className="flex mt-2 flex-row gap-2 items-center justify-center">
                {toys.map((toy) => {
                    const chosen = selectedToy?.toy_id === toy.toy_id;
                    return (
                        <HoverCard key={toy.toy_id}>
                            <HoverCardTrigger asChild>
                                <div
                                    key={toy.toy_id}
                                    className={`flex flex-col border gap-2 p-2 mb-4 hover:shadow-md rounded-md cursor-pointer ${
                                        chosen ? "bg-slate-100 shadow-lg" : ""
                                    } transition-colors duration-200 ease-in-out`}
                                    onClick={() => chooseToy(toy)}
                                >
                                    <Image
                                        src={toy.image_src!}
                                        width={200}
                                        height={200}
                                        alt={toy.name}
                                    />
                                    <div className="font-bold">{toy.name}</div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="p-4">
                                    <div className="font-bold">{toy.name}</div>
                                    <div className="text-gray-600">
                                        {toy.prompt}
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    );
                })}
            </div> */}
            {/* <div className="flex flex-row gap-2 h-full py-4">
                <ScrollArea>
                    {displayUsers.map((user) => {
                        const chosen = selectedUser?.user_id === user.user_id;
                        return (
                            <div
                                key={user.user_id}
                                className={`flex flex-col gap-2 mr-3 border p-2 mb-4 hover:shadow-md rounded-md cursor-pointer ${
                                    chosen ? "bg-slate-100 shadow-lg" : ""
                                } transition-colors duration-200 ease-in-out`}
                                onClick={() => chooseUser(user)}
                            >
                                <div className="font-bold">
                                    {user.child_name}
                                </div>
                                <div className="text-gray-600">
                                    {user.parent_name}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {user.child_persona}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {user.child_age} years old
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    {user.modules.map((module, index) => {
                                        return (
                                            <Badge
                                                key={index}
                                                // variant="defaul"
                                            >
                                                {module}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </ScrollArea>
            </div> */}
            <ToyPicker
                allToys={allToys}
                currentToy={selectedToy}
                buttonText={"Pick"}
                imageSize={200}
                chooseToy={() => {}}
                showCurrent={true}
            />
        </div>
    );
};

export default ParentDashboard;
