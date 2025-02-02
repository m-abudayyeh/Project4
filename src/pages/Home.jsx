export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Task Manager
        </h1>
        <p className="text-lg text-center mb-8">
          Manage your tasks efficiently and stay productive!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Task Categories */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
            {/* Add task list here */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">In Progress</h2>
            {/* Add task list here */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
            {/* Add task list here */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Urgent Tasks</h2>
            {/* Add task list here */}
          </div>
        </div>
      </div>
    </div>
  );
}
