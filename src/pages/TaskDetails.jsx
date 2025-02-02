import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (taskDoc.exists()) {
        setTask({ id: taskDoc.id, ...taskDoc.data() });
        setStatus(taskDoc.data().status);
      } else {
        toast.error("Task not found");
      }
    };
    fetchTask();
  }, [taskId]);

  const handleStatusUpdate = async () => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { status });
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Error updating status: " + error.message);
    }
  };

  const handleAddComment = async () => {
    if (!comment) {
      toast.error("Please enter a comment");
      return;
    }
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        comments: [...(task.comments || []), comment],
      });
      toast.success("Comment added successfully!");
      setComment("");
    } catch (error) {
      toast.error("Error adding comment: " + error.message);
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Task Details</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">{task.title}</h2>
          <p className="text-gray-600 mb-4">{task.description}</p>
          <div className="flex justify-between items-center mb-4">
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              className="mt-2 bg-blue-600 text-white p-2 rounded"
            >
              Update Status
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <textarea
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white p-2 rounded"
          >
            Add Comment
          </button>
          <div className="mt-4">
            {task.comments?.map((comment, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                <p>{comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
