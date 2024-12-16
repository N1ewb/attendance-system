import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContenxt";
import ClassesCard from "../../../components/Classes/ClassesCard";
import Modal from "../../../components/modal/AddClassModal";
import { useDB } from "../../../context/DBContext";

function Dashboard() {
  const db = useDB();
  const [show, setShow] = useState(false);
  const [classes, setClasses] = useState([]);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = await db.subscribetoClassesChanges((callback) => {
        setClasses(callback);
      });
      return () => unsubscribe();
    };
    fetchData();
  }, [db]);

  return (
    <div className="h-screen w-full pt-24">
      <header className="flex gap-5 justify-between p-10">
        <h3 className="font-bold text-[20px] flex-1">Your Classes</h3>{" "}
        <div className="button-container flex-1 justify-end flex">
          <button
            onClick={handleShow}
            className="px-10 py-3 rounded-md bg-green-950 hover:bg-green-600 text-white "
          >
            ADD CLASS
          </button>
        </div>
      </header>
      <main className="flex-1">
        <ClassesCard classes={classes} />
      </main>
      <Modal show={show} setShow={setShow} />
    </div>
  );
}

export default Dashboard;
