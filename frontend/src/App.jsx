import { useState } from 'react';
import { ShoppingBag, CheckCircle } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ShoppingBag className="w-16 h-16 text-indigo-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dự án CNPM Bán Nội Thất
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Khởi tạo Frontend React + Tailwind CSS thành công!
        </p>

        <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium mb-6">
          <CheckCircle className="w-5 h-5" />
          <span>Hệ thống sẵn sàng cho Ngày 2</span>
        </div>

        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition duration-200 shadow-md hover:shadow-indigo-200"
        >
          Số lần click: {count}
        </button>
      </div>
    </div>
  );
}

export default App;