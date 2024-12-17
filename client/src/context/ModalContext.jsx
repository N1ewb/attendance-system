import { createContext, useContext, useState } from "react";

const ModalContext = createContext();  

export function useModal() {
  return useContext(ModalContext);  
}

export const ModalProvider = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentAttendance, setCurrentAttendance] = useState(null);

  const handleToggleStudentModal = (currentStudent) => {
    console.log('Clicked ', currentStudent);
    setCurrentStudent(prevStudent => prevStudent === currentStudent ? null : currentStudent);
  };
  const handleToggleAttendanceModal = (currentAttendance) => {
    console.log('Clicked ', currentAttendance);
    setCurrentAttendance(prevAttendance => prevAttendance === currentAttendance ? null : currentAttendance);
  };

  const value = {
    currentStudent,
    currentAttendance,
    handleToggleStudentModal,
    handleToggleAttendanceModal,
  };

  return (
    <ModalContext.Provider value={value}>  
      {children}
    </ModalContext.Provider>
  );
};
