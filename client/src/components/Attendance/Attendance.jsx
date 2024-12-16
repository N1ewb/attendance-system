import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContenxt";
import { useDB } from "../../context/DBContext";

function Attendance({ id }) {
  const db = useDB();
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (currentUser && id) {
      const fetchData = async () => {
        const unsubscribe = await db.subscribetoAttendanceChanges(
          id,
          (callback) => {
            setAttendance(callback);
          }
        );
        return () => unsubscribe();
      };
      fetchData();
    }
  }, [id, currentUser]);

  return (
    <div className="w-[60%] p-5">
      <header className="flex flex-row justify-between px-5 py-4 rounded-sm text-white items-center bg-green-950">
        <h1 className="font-semibold text-[20px]">Attendance</h1>
        <Link className="bg-white hover:bg-gray-800 rounded-md px-5 py-3 text-green-900 font-semibold" to={`/private/attendance?id=${id}`}>Record Today Attendance</Link>
      </header>
      <div className="attendance-container flex flex-col gap-5 pt-5">
        {attendance.length !== 0 ?
          attendance.map((att, index) => (
            <div key={index} className=" shadow-md p-5  rounded-lg flex flex-row justify-between items-center capitalize">
              <p>{att.session}</p>
              <p>{att.dateToday}</p>
            </div>
          )) : <p>No attendance was taken on this subject yet</p>}
      </div>
    </div>
  );
}

export default Attendance;
