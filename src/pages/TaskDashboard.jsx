import { useEffect, useState } from "react";
import { db } from "../firebase"; // Ensure `db` is initialized for Realtime Database
import { ref, onValue } from "firebase/database"; // Import Realtime Database functions
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Reference to the "tasks" node in the Realtime Database
    const tasksRef = ref(db, "tasks");

    // Listen for changes in the "tasks" node
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((childSnapshot) => {
        tasksData.push({
          id: childSnapshot.key, // Use the key as the task ID
          ...childSnapshot.val(), // Spread the task data
        });
      });
      setTasks(tasksData);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Task Dashboard</h1>
        <TaskForm />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}
