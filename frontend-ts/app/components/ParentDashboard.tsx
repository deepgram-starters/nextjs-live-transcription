import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { users } from "@/lib/testUsers";
import { useEffect, useState } from "react";

interface ParentDashboardProps {
    selectedUser: IUser | null;
    chooseUser: (user: IUser) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
    selectedUser,
    chooseUser,
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
        <div className="p-4 overflow-hidden flex-auto">
            <p>Parent dashboard</p>
            <div className="flex flex-row gap-2 w-full h-full py-4">
                <ScrollArea>
                    {displayUsers.map((user) => {
                        const chosen = selectedUser?.id === user.id;
                        return (
                            <div
                                key={user.id}
                                className={`flex flex-col gap-2 p-2 mb-4 hover:bg-slate-50 rounded-md cursor-pointer ${
                                    chosen ? "bg-slate-100" : ""
                                } transition-colors duration-200 ease-in-out`}
                                onClick={() => chooseUser(user)}
                            >
                                <div className="font-bold">
                                    {user.parentName}
                                </div>
                                <div className="text-gray-600">
                                    {user.childName}
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
                                                variant="secondary"
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
