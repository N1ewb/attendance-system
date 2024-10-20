import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContenxt";
import ClassesCard from "../../../components/Classes/ClassesCard";
import Modal from "../../../components/modal/AddClassModal";
import { useDB } from "../../../context/DBContext";

function Dashboard() {
  const db = useDB()
  const { currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [classes, setClasses] = useState([])
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchData = async ()=> {
      const unsubscribe = await db.subscribetoClassesChanges((callback) => {
        setClasses(callback)
      })
      return () => unsubscribe()
    }
    fetchData()
  },[db])

  return (
    <div className="h-screen w-full pt-24">
      <header>
        <h1>{currentUser?.email} Dashboard</h1>
      </header>
      <main>
        <div className="classes-container">
          <div className="title flex flex-row w-full items-center justify-between px-20 py-10">
            <h3 className="font-bold text-[20px]">Your Classes</h3>{" "}
            <button onClick={handleShow} className="px-10 py-3 rounded-md bg-green-950 text-white">
              ADD CLASS
            </button>
          </div>
          <ClassesCard  classes={classes}/>
        </div>
      </main>
      <Modal show={show} setShow={setShow} />
    </div>
  );
}

export default Dashboard;
