import React, { useState, useCallback, useEffect } from 'react';
import { fetchOrderHistory } from './services/swiggyService';
import { analyzeOrders } from './services/analytics';
import { SwiggyOrder, AnalysisResult } from './types';
import { WrappedStory } from './components/WrappedStory';
import { Loader } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleStart = useCallback(async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Fetch Data
      const orders = await fetchOrderHistory((count, total) => {
        // Simple progress estimation
        const estimated = total > 0 ? (count / total) * 100 : 10;
        setProgress(Math.min(estimated, 90));
      });

      if (orders.length === 0) {
        throw new Error("No delivered orders found for 2025 yet. Order something tasty!");
      }

      // Analyze
      const result = analyzeOrders(orders);
      setAnalysis(result);
      setProgress(100);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch Swiggy data. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed inset-0 z-[100000] pointer-events-auto flex items-center justify-center"
        style={{ pointerEvents: 'auto' }} 
      >
        <button
          onClick={handleStart}
          className="bg-swiggy-orange text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2 animate-bounce cursor-pointer"
        >
          <span>🍔</span> View My Swiggy Wrapped 2025
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center pointer-events-auto font-sans"
      style={{ pointerEvents: 'auto' }} 
    >
      <div className="relative w-full max-w-md h-[80vh] max-h-[800px] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-white text-center">
          
          {loading ? (
            <div className="space-y-6">
              <Loader className="w-12 h-12 text-swiggy-orange animate-spin mx-auto" />
              <div>
                <h2 className="text-xl font-bold mb-2">Cooking your data...</h2>
                <p className="text-gray-400 text-sm">Fetching your 2025 order history...</p>
              </div>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-swiggy-orange transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Processing locally. No data leaves your browser.</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="text-4xl">😕</div>
              <h2 className="text-xl font-bold text-red-400">Oops!</h2>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={handleClose}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : analysis ? (
            <WrappedStory analysis={analysis} onClose={handleClose} />
          ) : null}
          
        </div>

        {/* Footer / Branding */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Swiggy, "Wrapped" with ❤️</p>
        </div>
      </div>
    </div>
  );
}