import App from "./App";

const ChildPlayground: React.FC<{
    selectedUser: IUser | null;
    selectedToy: IToy | null;
    children: React.ReactNode;
}> = ({ selectedUser, children, selectedToy }) => {
    const user = selectedUser;
    return (
        <div className="p-4 overflow-y-scroll">
            <p>Child playground</p>
            {user && selectedToy && (
                <div>
                    <p>
                        <span className="font-bold">{selectedToy?.name}</span>{" "}
                        talking to{" "}
                        <span className="font-bold">
                            {selectedUser?.child_name}
                        </span>
                    </p>
                    {/* <div>
                        <div className="text-gray-600">{user.childName}</div>
                        <div className="text-gray-500 text-sm">
                            {user.childPersona}
                        </div>
                        <div className="text-gray-400 text-xs">
                            {user.childAge} years old
                        </div>
                    </div> */}
                    {children}
                    {/* <App /> */}
                </div>
            )}
        </div>
    );
};

export default ChildPlayground;
