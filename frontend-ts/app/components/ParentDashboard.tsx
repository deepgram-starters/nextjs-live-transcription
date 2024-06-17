import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { users, toys } from "@/lib/data";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ParentDashboardProps {
    selectedUser: IUser | null;
    chooseUser: (user: IUser) => void;
    selectedToy: IToy | null;
    chooseToy: (toy: IToy) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
    selectedUser,
    chooseUser,
    selectedToy,
    chooseToy,
}) => {
    const [displayUsers, setDisplayUsers] = useState<IUser[]>(users);
    useEffect(() => {
        if (selectedUser) {
            setDisplayUsers([
                selectedUser,
                ...users.filter((user) => user.id !== selectedUser.id),
            ]);
        }
    }, [selectedUser]);
    return (
        <div className="p-4 overflow-hidden w-full flex-auto">
            <p>Parent dashboard</p>
            <div className="flex flex-row gap-2 items-center justify-center">
                {toys.map((toy) => {
                    const chosen = selectedToy?.id === toy.id;
                    return (
                        <div
                            key={toy.id}
                            className={`flex flex-col gap-2 p-2 mb-4 hover:bg-slate-100 rounded-md cursor-pointer ${
                                chosen ? "bg-slate-200" : ""
                            } transition-colors duration-200 ease-in-out`}
                            onClick={() => chooseToy(toy)}
                        >
                            <Image
                                src={toy.imageSrc!}
                                width={200}
                                height={200}
                                alt={toy.name}
                            />
                            <div className="font-bold">{toy.name}</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-row gap-2 h-full py-4">
                <ScrollArea>
                    {displayUsers.map((user) => {
                        const chosen = selectedUser?.id === user.id;
                        return (
                            <div
                                key={user.id}
                                className={`flex flex-col gap-2 p-2 mb-4 hover:bg-slate-100 rounded-md cursor-pointer ${
                                    chosen ? "bg-slate-200" : ""
                                } transition-colors duration-200 ease-in-out`}
                                onClick={() => chooseUser(user)}
                            >
                                <div className="font-bold">
                                    {user.childName}
                                </div>
                                <div className="text-gray-600">
                                    {user.parentName}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {user.childPersona}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {user.childAge} years old
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
            </div>
        </div>
    );
};

export default ParentDashboard;
