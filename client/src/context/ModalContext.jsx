import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export const ModalProvider = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentAttendance, setCurrentAttendance] = useState(null);

  const handleToggleStudentModal = (student) => {
    setCurrentStudent((prev) => (prev === student ? null : student));
  };
  const handleToggleAttendanceModal = (attendance) => {
    setCurrentAttendance((prev) => (prev === attendance ? null : attendance));
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
