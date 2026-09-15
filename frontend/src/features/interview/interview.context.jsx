import { createContext, useState } from "react";

const InterviewContext = createContext();

const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);

  return (
    <InterviewContext.Provider
      value={{
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { InterviewContext, InterviewProvider };
