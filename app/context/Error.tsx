"use client";

import { createContext, useContext, useState } from "react";

type ErrorContext = {
  error: string;
  setError: (index: string) => void;
};

interface ErrorContextInterface {
  children: React.ReactNode;
}

const ErrorContext = createContext({} as ErrorContext);

const ErrorContextProvider = ({ children }: ErrorContextInterface) => {
  const [error, setError] = useState("");

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

function useErrorContext() {
  return useContext(ErrorContext);
}

export { ErrorContextProvider, useErrorContext };
