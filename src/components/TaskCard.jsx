export default function TaskCard({ task }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="flex justify-between items-center">
        <span
          className={`text-sm font-semibold ${
            task.priority === "High"
              ? "text-red-600"
              : task.priority === "Medium"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {task.priority} Priority
        </span>
        <span className="text-sm text-gray-500">{task.status}</span>
      </div>
    </div>
  );
}
