import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useDB } from "../../context/DBContext";
import { useModal } from "../../context/ModalContext";
import { Skeleton, EmptyState } from "../ui";

function Attendance({ id }) {
  const db = useDB();
  const { currentUser } = useAuth();
  const { handleToggleAttendanceModal } = useModal();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !id) return;
    setLoading(true);
    setError(null);

    const unsubscribe = db.subscribetoAttendanceChanges(id, (event) => {
      setLoading(false);
      if (event.type === "INITIAL") {
        setAttendance(event.data);
      } else if (event.type === "INSERT") {
        setAttendance((prev) => [event.data, ...prev]);
      } else if (event.type === "DELETE") {
        setAttendance((prev) => prev.filter((s) => s.id !== event.data.id));
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
  }, [id, currentUser]);

  return (
    <div className="w-full lg:w-[60%] p-5">
      <header className="flex flex-row justify-between items-center px-5 py-4 rounded-sm text-white bg-green-950 flex-wrap gap-3">
        <h1 className="font-semibold text-xl">Attendance</h1>
        <Link
          className="bg-white hover:bg-gray-200 rounded-md px-5 py-3 text-green-900 font-semibold min-h-[44px] flex items-center text-sm"
          to={`/private/attendance?id=${id}`}
        >
          Record Today
        </Link>
      </header>

      <div className="attendance-container flex flex-col gap-3 pt-5">
        {error ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01" />
              </svg>
            }
            title="Failed to load attendance"
            description="Please try again later."
          />
        ) : loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="shadow-sm p-5 rounded-lg flex flex-row justify-between items-center"
            >
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-24" />
            </div>
          ))
        ) : attendance.length !== 0 ? (
          attendance.map((att, index) => (
            <div
              onClick={() => handleToggleAttendanceModal(att)}
              key={att.id || index}
              className="shadow-sm p-5 cursor-pointer rounded-lg flex flex-row justify-between items-center capitalize hover:shadow-md transition-shadow min-h-[44px]"
            >
              <p className="font-medium text-sm">{att.sessionName}</p>
              <p className="text-sm text-gray-500">{att.date}</p>
            </div>
          ))
        ) : (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="No attendance sessions"
            description="Record your first attendance session to see history here."
          />
        )}
      </div>
    </div>
  );
}

export default Attendance;
