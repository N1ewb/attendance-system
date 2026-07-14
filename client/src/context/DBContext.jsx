import { createContext, useContext } from "react";

const dbContext = createContext();

export function useDB() {
  return useContext(dbContext);
}

export function DBProvider({ children }) {
  const MakeClass = async () => ({ message: "Supabase migration pending (Phase 3)" });
  const getClassInfo = async () => null;
  const AddStudent = async () => ({ message: "Supabase migration pending (Phase 3)", status: "pending" });
  const RecordAttendance = async () => {};
  const subscribetoAttendanceChanges = async () => () => {};
  const subscribetoStudentChanges = async () => () => {};
  const subscribetoClassesChanges = async () => () => {};

  const value = {
    MakeClass,
    getClassInfo,
    AddStudent,
    RecordAttendance,
    subscribetoAttendanceChanges,
    subscribetoClassesChanges,
    subscribetoStudentChanges,
  };

  return <dbContext.Provider value={value}>{children}</dbContext.Provider>;
}
