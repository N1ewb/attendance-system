import { useNavigate } from "react-router-dom";
import { Skeleton, EmptyState } from "../ui";

function ClassesCard({ classes, loading = false, error = null, onRetry }) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="w-full p-5">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="Something went wrong"
          description="Failed to load classes. Please try again."
          action={
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px] text-sm"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 border border-gray-200">
              <Skeleton variant="text" className="w-2/3 mb-3" />
              <Skeleton variant="text" className="w-1/2 mb-3" />
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="rectangular" className="w-full h-32 mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5">
      {classes.length !== 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((myclass) => (
            <div
              onClick={() => navigate(`/private/class?id=${myclass.id}`)}
              key={myclass.id}
              className="flex flex-col items-start gap-3 shadow-sm cursor-pointer rounded-xl bg-white p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <p className="text-lg font-semibold text-gray-800">
                {myclass.subjectCode}
              </p>
              <p className="text-sm text-gray-500">
                Offer: <span className="text-gray-700">{myclass.offerNumber}</span>
              </p>
              <p className="text-sm text-gray-500">{myclass.description}</p>
              <p className="text-xs text-gray-400 mt-auto">
                {myclass.units} {myclass.units === 1 ? "unit" : "units"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No classes yet"
          description="Create your first class to get started with attendance tracking."
        />
      )}
    </div>
  );
}

export default ClassesCard;
