export default function Articles() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Articles</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            How to Manage Your Tasks Effectively
          </h2>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel
            purus nec libero tincidunt tincidunt.
          </p>
          {/* Add more articles here */}
        </div>
      </div>
    </div>
  );
}
