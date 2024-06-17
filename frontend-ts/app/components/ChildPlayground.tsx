"use client";

import App from "./App";

const ChildPlayground: React.FC<{}> = () => {
    return (
        <div className="p-4">
            <p>Child playground</p>
            <App />
        </div>
    );
};

export default ChildPlayground;
