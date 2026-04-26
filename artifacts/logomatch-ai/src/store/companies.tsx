import { createContext, useContext, useReducer, ReactNode } from "react";

export type CompanyImage = {
  id: string;
  dataUrl: string;
  name: string;
};

export type Company = {
  id: string;
  name: string;
  images: CompanyImage[];
  createdAt: number;
};

type State = {
  companies: Company[];
  recognitionTests: number;
};

type Action =
  | { type: "ADD_COMPANY"; payload: Company }
  | { type: "REMOVE_COMPANY"; payload: string }
  | { type: "INCREMENT_RECOGNITION_TESTS" };

const initialState: State = {
  companies: [],
  recognitionTests: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_COMPANY":
      return { ...state, companies: [...state.companies, action.payload] };
    case "REMOVE_COMPANY":
      return {
        ...state,
        companies: state.companies.filter((c) => c.id !== action.payload),
      };
    case "INCREMENT_RECOGNITION_TESTS":
      return { ...state, recognitionTests: state.recognitionTests + 1 };
    default:
      return state;
  }
}

const CompaniesContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CompaniesContext.Provider value={{ state, dispatch }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error("useCompanies must be used within a CompaniesProvider");
  }
  return context;
}
