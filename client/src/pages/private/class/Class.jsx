import { useEffect, useState } from "react";
import Students from "../../../components/Students/Students";
import Attendance from "../../../components/Attendance/Attendance";
import StudentsModal from "../../../components/Students/StudentsModal";
import AttendanceModal from "../../../components/Attendance/AttendanceModal";
import { useLocation } from "react-router-dom";
import { useModal } from "../../../context/ModalContext";
import { useDB } from "../../../context/DBContext";
import { Skeleton } from "../../../components/ui";

function Class() {
  const db = useDB();
  const { currentStudent, currentAttendance } = useModal();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classid = queryParams.get("id");
  const [thisClass, setThisClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classid) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const classData = await db.getClassInfo(classid);
        setThisClass(classData);
      } catch {
        setError("Failed to load class info.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classid, db]);

  if (loading) {
    return (
      <div className="min-h-screen w-full pt-32 px-10">
        <Skeleton variant="text" className="w-1/3 h-8 mb-8" />
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <Skeleton variant="rectangular" className="w-full h-64" />
          </div>
          <div className="w-full lg:w-[35%]">
            <Skeleton variant="text" className="w-1/2 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="text" className="w-full h-12 mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-24 px-4 md:px-10 flex flex-col overflow-y-auto">
      {thisClass && classid && (
        <>
          <header className="py-5">
            <h1 className="font-bold text-2xl md:text-[28px]">{thisClass.subjectCode}</h1>
            <p className="text-sm text-gray-500 mt-1">{thisClass.description}</p>
          </header>
          <main className="flex flex-col lg:flex-row w-full h-full justify-between gap-6">
            <Attendance id={classid} />
            <div className="students w-full lg:w-[35%]">
              <Students id={classid} />
            </div>
          </main>
        </>
      )}
      {currentStudent && <StudentsModal />}
      {currentAttendance && <AttendanceModal />}
    </div>
  );
}

export default Class;
