import { useEffect, useState, useCallback } from "react";
import ClassesCard from "../../../components/Classes/ClassesCard";
import Modal from "../../../components/modal/AddClassModal";
import { useDB } from "../../../context/DBContext";
import { Button } from "../../../components/ui";

function Dashboard() {
  const db = useDB();
  const [show, setShow] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleShow = () => setShow(true);

  const loadClasses = useCallback(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = db.subscribetoClassesChanges((event) => {
      setLoading(false);
      if (event.type === "INITIAL") {
        setClasses(event.data);
      } else if (event.type === "INSERT") {
        setClasses((prev) => [event.data, ...prev]);
      } else if (event.type === "UPDATE") {
        setClasses((prev) =>
          prev.map((c) => (c.id === event.data.id ? event.data : c))
        );
      } else if (event.type === "DELETE") {
        setClasses((prev) => prev.filter((c) => c.id !== event.data.id));
      }
    });

    return unsubscribe;
  }, [db]);

  useEffect(() => {
    const unsubscribe = loadClasses();
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
  }, [loadClasses]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setClasses([]);
    loadClasses();
  };

  return (
    <div className="min-h-screen w-full pt-24 pb-10">
      <header className="flex gap-5 justify-between items-center px-5 md:px-10 py-5 flex-wrap">
        <h3 className="font-bold text-xl md:text-[20px]">Your Classes</h3>
        <Button onClick={handleShow} className="bg-green-950 hover:bg-green-600 text-white px-8 py-3 rounded-md">
          ADD CLASS
        </Button>
      </header>
      <main className="flex-1">
        <ClassesCard
          classes={classes}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />
      </main>
      <Modal show={show} setShow={setShow} />
    </div>
  );
}

export default Dashboard;
