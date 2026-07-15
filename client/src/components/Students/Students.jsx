import { useEffect, useState } from "react";
import { useDB } from "../../context/DBContext";
import AddStudentModal from "../modal/AddStudentModal";
import { useModal } from "../../context/ModalContext";

const Students = ({ id }) => {
  const db = useDB();
  const { handleToggleStudentModal } = useModal();
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = db.subscribetoStudentChanges(id, (event) => {
      if (event.type === "INITIAL") {
        setStudents(event.data);
      } else if (event.type === "INSERT") {
        setStudents((prev) => [event.data, ...prev]);
      } else if (event.type === "UPDATE") {
        setStudents((prev) =>
          prev.map((s) => (s.id === event.data.id ? event.data : s))
        );
      } else if (event.type === "DELETE") {
        setStudents((prev) => prev.filter((s) => s.id !== event.data.id));
      }
    });
    return () => unsubscribe();
  }, [db, id]);

  return (
    <div className="w-full h-full">
      <header className="flex flex-row justify-between py-10 px-3">
        <h1 className="font-semibold text-[20px]">Students</h1>
        <button
          className="bg-green-700 hover:bg-green-800 rounded-md px-5 py-3 text-white font-semibold"
          onClick={handleShow}
        >
          Add Student
        </button>
      </header>
      <div className="students-container w-full flex flex-col gap-5 items-start h-[80%] max-h-[80%] overflow-auto pb-5">
        {students.length !== 0 ? (
          students.map((student, index) => (
            <div
              key={student.id || index}
              className="w-full flex flex-row gap-5 shadow-md p-5 rounded-lg cursor-pointer"
              onClick={() => handleToggleStudentModal(student)}
            >
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Name:
                </span>
                <br />
                {student.firstName} {student.lastName}
              </p>
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Student ID Number:
                </span>
                <br />
                {student.studentId}
              </p>
              <p>
                <span className="text-[14px] font-light text-[#9f9f9f]">
                  Total Attendance:
                </span>
                <br />
                {student.totalAttendance}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 w-full text-center pt-10">No students yet</p>
        )}
      </div>
      <AddStudentModal id={id} show={show} setShow={setShow} />
    </div>
  );
};

export default Students;
