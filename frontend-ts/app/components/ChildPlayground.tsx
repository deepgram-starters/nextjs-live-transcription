import App from "./App";

const ChildPlayground: React.FC<{
    selectedUser: IUser | null;
    children: React.ReactNode;
}> = ({ selectedUser, children }) => {
    const user = selectedUser;
    return (
        <div className="p-4 overflow-y-scroll">
            <p>Child playground</p>
            {user && (
                <div className="p-2 flex flex-col gap-4">
                    <p>Talking to {selectedUser?.childName}</p>
                    <div>
                        <div className="text-gray-600">{user.childName}</div>
                        <div className="text-gray-500 text-sm">
                            {user.childPersona}
                        </div>
                        <div className="text-gray-400 text-xs">
                            {user.childAge} years old
                        </div>
                    </div>
                    {children}
                    {/* <App /> */}
                </div>
            )}
        </div>
    );
};

export default ChildPlayground;
