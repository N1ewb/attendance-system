import { createContext, useContext, useState } from "react";

const studentContext = createContext();  

export function useStudent() {
  return useContext(studentContext);  
}

export const StudentProvider = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleToggleModal = (currentStudent) => {
    console.log('Clicked ', currentStudent);
    setCurrentStudent(prevStudent => prevStudent === currentStudent ? null : currentStudent);
  };

  const value = {
    currentStudent,
    handleToggleModal
  };

  return (
    <studentContext.Provider value={value}>  
      {children}
    </studentContext.Provider>
  );
};
