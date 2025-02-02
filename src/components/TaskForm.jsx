import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        priority,
        status: "Pending",
        createdAt: new Date(),
      });
      toast.success("Task added successfully!");
      setTitle("");
      setDescription("");
      setPriority("Low");
    } catch (error) {
      toast.error("Error adding task: " + error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Add Task
      </button>
    </form>
  );
}
