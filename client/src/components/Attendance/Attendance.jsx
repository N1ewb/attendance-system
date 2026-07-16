import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useDB } from "../../context/DBContext";
import { useModal } from "../../context/ModalContext";

function Attendance({ id }) {
  const db = useDB();
  const { currentUser } = useAuth();
  const { handleToggleAttendanceModal } = useModal();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!currentUser || !id) return;
    const unsubscribe = db.subscribetoAttendanceChanges(id, (event) => {
      if (event.type === "INITIAL") {
        setAttendance(event.data);
      } else if (event.type === "INSERT") {
        setAttendance((prev) => [event.data, ...prev]);
      } else if (event.type === "DELETE") {
        setAttendance((prev) => prev.filter((s) => s.id !== event.data.id));
      }
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  return (
    <div className="w-[60%] p-5">
      <header className="flex flex-row justify-between px-5 py-4 rounded-sm text-white items-center bg-green-950">
        <h1 className="font-semibold text-[20px]">Attendance</h1>
        <Link
          className="bg-white hover:bg-gray-800 rounded-md px-5 py-3 text-green-900 font-semibold"
          to={`/private/attendance?id=${id}`}
        >
          Record Today Attendance
        </Link>
      </header>
      <div className="attendance-container flex flex-col gap-5 pt-5">
        {attendance.length !== 0 ? (
          attendance.map((att, index) => (
            <div
              onClick={() => handleToggleAttendanceModal(att)}
              key={att.id || index}
              className="shadow-md p-5 cursor-pointer rounded-lg flex flex-row justify-between items-center capitalize"
            >
              <p>{att.sessionName}</p>
              <p>{att.date}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center pt-10">
            No attendance was taken on this subject yet
          </p>
        )}
      </div>
    </div>
  );
}

export default Attendance;
