import React, { useEffect, useState } from "react";
import { students } from "../../lib/global";
import { useDB } from "../../context/DBContext";
import AddStudentModal from "../modal/AddStudentModal";
const Students = ({ id }) => {
  const db = useDB();
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const unsubscribe = db.subscribetoStudentChanges(id, (callback) => {
          setStudents(callback);
        });
        return () => unsubscribe();
      };
      fetchData();
    }
  }, [db, id]);

  return (
    <div className="w-full h-full">
      <header className="flex flex-row justify-between py-10 px-3">
        <h1 className="font-semibold text-[20px]">Students</h1>
        <button onClick={handleShow}>Add Student</button>
      </header>
      <div className="students-container w-full flex flex-col gap-5 items-start h-[80%] max-h-[80%] overflow-auto pb-5">
        {students.length !== 0 &&
          students.map((student, index) => (
            <div
              key={index}
              className="w-full flex flex-row gap-5 shadow-md p-5 rounded-lg"
            >
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Name:
                </span>{" "}
                <br></br>
                {student.firstName} {student.lastName}
              </p>
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Student ID Number:
                </span>{" "}
                <br></br>
                {student.studentID}
              </p>
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Total Attendance:
                </span>{" "}
                <br></br>
                {student.total_attendance}
              </p>
            </div>
          ))}
      </div>
      <AddStudentModal id={id} show={show} setShow={setShow} />
    </div>
  );
};

export default Students;
