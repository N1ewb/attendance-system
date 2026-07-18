import { useEffect, useState, useRef } from "react";
import { useDB } from "../../context/DBContext";
import AddStudentModal from "../modal/AddStudentModal";
import { useModal } from "../../context/ModalContext";
import { getStudents } from "../../lib/api";
import { toCamelCaseArray } from "../../lib/mapper";
import { Skeleton, EmptyState, Button } from "../ui";

const Students = ({ id }) => {
  const db = useDB();
  const { currentStudent, handleToggleStudentModal } = useModal();
  const [show, setShow] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const unsubscribe = db.subscribetoStudentChanges(id, (event) => {
      setLoading(false);
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

    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("timeout");
      }
    }, 15000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [db, id]);

  const prevModalOpen = useRef(!!currentStudent);
  useEffect(() => {
    if (prevModalOpen.current && !currentStudent && id) {
      getStudents(id).then(({ data }) => {
        if (data) setStudents(toCamelCaseArray(data));
      });
    }
    prevModalOpen.current = !!currentStudent;
  }, [currentStudent, id]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
  };

  return (
    <div className="w-full h-full">
      <header className="flex flex-row justify-between items-center py-5 px-3 flex-wrap gap-3">
        <h1 className="font-semibold text-xl">Students</h1>
        <Button
          variant="primary"
          className="bg-green-700 hover:bg-green-800 rounded-md text-white font-semibold"
          onClick={() => setShow(true)}
        >
          Add Student
        </Button>
      </header>

      <div className="students-container w-full flex flex-col gap-3 h-[80%] max-h-[80%] overflow-auto pb-5">
        {error ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01" />
              </svg>
            }
            title="Failed to load students"
            description="Please try again."
            action={
              <button onClick={handleRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]">
                Retry
              </button>
            }
          />
        ) : loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="w-full flex flex-row gap-5 shadow-sm p-5 rounded-lg">
              <Skeleton variant="circular" width="48px" height="48px" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
              <Skeleton variant="text" className="w-20" />
            </div>
          ))
        ) : students.length !== 0 ? (
          students.map((student, index) => (
            <div
              key={student.id || index}
              className="w-full flex flex-row gap-5 shadow-sm p-5 rounded-lg cursor-pointer hover:shadow-md transition-shadow min-h-[44px]"
              onClick={() => handleToggleStudentModal(student)}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0">
                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {student.studentId}
                </p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <p className="text-xs text-gray-400">Attendance</p>
                <p className="font-semibold text-green-600 text-sm">
                  {student.totalAttendance || 0}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            title="No students yet"
            description="Add your first student to begin tracking attendance."
            action={
              <Button variant="primary" onClick={() => setShow(true)}>
                Add Student
              </Button>
            }
          />
        )}
      </div>

      <AddStudentModal id={id} show={show} setShow={setShow} />
    </div>
  );
};

export default Students;
