import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { classes } from "../../../lib/global";
import Students from "../../../components/Students/Students";
import Attendance from "../../../components/Attendance/Attendance";
import { useDB } from "../../../context/DBContext";
import StudentsModal from "../../../components/Students/StudentsModal";
import { useStudent } from "../../../context/StudentContext";

function Class() {
  const db = useDB();
  const {currentStudent} = useStudent()
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classid = queryParams.get("id");
  const [thisClass, setThisClass] = useState(null);

  useEffect(() => {
    if (classid) {
      const fetchData = async () => {
        const classData = await db.getClassInfo(classid);

        setThisClass(classData);
      };
      fetchData();
    }
  }, [classid]);
  return (
    <div className="h-screen w-full pt-32 px-10 gap-10 flex flex-col overflow-y-hidden">
      {thisClass && classid && (
        <>
          <header>
            <h1 className="font-bold text-[28px]">{thisClass.SubjectCode}</h1>
          </header>
          <main className="flex flex-row w-full h-full justify-between">
            <Attendance id={classid} />
            <div className="students w-[35%] h-full ">
              <Students id={classid} />
            </div>
          </main>
        </>
      )}
      {currentStudent && <StudentsModal />}
    </div>
  );
}

export default Class;
