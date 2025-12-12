import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Share2, X, ChevronRight, ChevronLeft, ShoppingBag, Utensils, UtensilsCrossed, Package, Trophy, Medal, Truck, IndianRupee, Leaf, Beef } from 'lucide-react';

interface Props {
  analysis: AnalysisResult;
  onClose: () => void;
}

const getImage = (hash?: string) => {
    if (!hash) return null;
    return `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_100,h_100,c_fill/${hash}`;
}

const getAOVLine = (amount: number) => {
    if (amount > 800) return "You've got expensive taste. Fancy!";
    if (amount > 500) return "Quality over quantity, always.";
    if (amount > 300) return "Perfectly balanced, as all things should be.";
    return "Smart spending. Your wallet thanks you.";
}

export const WrappedStory: React.FC<Props> = ({ analysis, onClose }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const vegData = [
    { name: 'Veg', value: analysis.vegNonVegStats.veg, color: '#16a34a' },
    { name: 'Non-Veg', value: analysis.vegNonVegStats.nonVeg, color: '#dc2626' },
  ];

  // Only show chart if there is data
  const hasDietData = analysis.vegNonVegStats.veg > 0 || analysis.vegNonVegStats.nonVeg > 0;

  const slides = [
    // Slide 1: Intro
    <div key="intro" className="flex flex-col items-center justify-center h-full space-y-6 animate-fadeIn">
      <div className="text-6xl animate-bounce">🍔</div>
      <h1 className="text-4xl font-extrabold text-swiggy-orange">2025 Wrapped</h1>
      <p className="text-xl text-gray-300">Your year in flavor (so far).</p>
    </div>,

    // Slide 2: The Big Numbers
    <div key="numbers" className="flex flex-col items-center justify-center h-full space-y-8 p-4">
      <h2 className="text-2xl font-bold text-gray-400">You were hungry!</h2>
      <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
        <div className="bg-white/10 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <p className="text-sm text-gray-400 uppercase tracking-wide">Total Orders</p>
          <p className="text-5xl font-black text-white">{analysis.totalOrders}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <p className="text-sm text-gray-400 uppercase tracking-wide">Total Spent</p>
          <p className="text-4xl font-black text-swiggy-orange">₹{analysis.totalSpend.toLocaleString()}</p>
        </div>
      </div>
    </div>,

    // Slide 3: The Hidden Costs (Refined)
    <div key="costs" className="flex flex-col items-center justify-center h-full space-y-6 p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Money Matters, Ain't?</h2>
      
      <div className="w-full max-w-xs">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-swiggy-orange/30 shadow-[0_10px_40px_-10px_rgba(252,128,25,0.3)] text-center transform transition-all hover:scale-105">
           <div className="bg-swiggy-orange/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-swiggy-orange">
              <IndianRupee size={32} />
           </div>
           
           <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Average Order Value</p>
           <p className="text-5xl font-black text-white mb-6">₹{analysis.avgOrderValue.toLocaleString()}</p>
           
           <div className="border-t border-gray-700 pt-4">
               <p className="text-gray-300 italic font-medium">"{getAOVLine(analysis.avgOrderValue)}"</p>
           </div>
        </div>
      </div>
    </div>,

    // REMOVED: Breakdown Slide

    // Slide 4: Diet Profile (Veg/Non-Veg Donut Chart)
    <div key="diet" className="flex flex-col items-center justify-center h-full space-y-6 p-4">
        <h2 className="text-2xl font-bold text-white">Your Diet Profile</h2>
        
        {hasDietData ? (
          <>
            <div className="w-full h-64 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={vegData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} // Creates the donut effect
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {vegData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', color: '#fff'}} 
                            itemStyle={{color: '#fff'}}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text in Donut */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Food Orders</p>
                        <p className="text-xl font-bold text-white">{analysis.categoryStats.Food.count}</p>
                    </div>
                 </div>
            </div>
            
            <div className="flex gap-6">
                <div className="flex flex-col items-center gap-1">
                    <div className="bg-green-600/20 p-2 rounded-full">
                        <Leaf size={20} className="text-green-500" />
                    </div>
                    <span className="font-bold text-white">{analysis.vegNonVegStats.veg}</span>
                    <span className="text-xs text-gray-400">Pure Veg</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                     <div className="bg-red-600/20 p-2 rounded-full">
                        <Beef size={20} className="text-red-500" />
                    </div>
                    <span className="font-bold text-white">{analysis.vegNonVegStats.nonVeg}</span>
                    <span className="text-xs text-gray-400">Non-Veg</span>
                </div>
            </div>
          </>
        ) : (
            <div className="text-gray-400 text-center px-8">
                <p>No food data available to determine diet profile yet.</p>
                <p className="text-sm mt-2">Try ordering some food!</p>
            </div>
        )}
    </div>,

    // Slide 5: Restaurant Rankings (Flavor Hall of Fame)
    <div key="rankings" className="flex flex-col items-center justify-center h-full space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Flavor Hall of Fame</h2>
        <p className="text-sm text-gray-400">Your most frequented spots</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {analysis.restaurantRankings.map((rest, index) => {
          const imgUrl = getImage(rest.image);
          return (
            <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    index === 0 ? 'bg-orange-500/20 border-orange-500 text-white scale-105 shadow-lg' : 
                    index === 1 ? 'bg-gray-700/50 border-gray-600 text-gray-100' :
                    'bg-gray-800/30 border-gray-800 text-gray-300'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`font-black text-lg w-6 flex-shrink-0 text-center ${index === 0 ? 'text-swiggy-orange' : 'text-gray-500'}`}>
                        #{index + 1}
                    </div>
                    
                    {imgUrl ? (
                        <img src={imgUrl} alt={rest.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs">🍽️</div>
                    )}

                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold truncate text-sm">{rest.name}</span>
                        {index === 0 && <span className="text-[10px] text-orange-300 uppercase tracking-wider flex items-center gap-1"><Trophy size={10} /> Top Fan</span>}
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="font-bold">{rest.count}</div>
                    <div className="text-[10px] uppercase opacity-60">Orders</div>
                </div>
            </div>
          );
        })}
        {analysis.restaurantRankings.length === 0 && (
          <p className="text-center text-gray-500 italic">No restaurants found yet!</p>
        )}
      </div>
    </div>,

    // Slide 6: Top Restaurant (Spotlight)
    <div key="restaurant" className="flex flex-col items-center justify-center h-full space-y-6 p-4 text-center">
      <h2 className="text-xl text-gray-300">The Undisputed Champion</h2>
      
      <div className="relative">
          {getImage(analysis.topRestaurant.image) ? (
             <img 
               src={getImage(analysis.topRestaurant.image)!} 
               alt={analysis.topRestaurant.name}
               className="w-40 h-40 rounded-full object-cover border-4 border-swiggy-orange animate-pulse shadow-[0_0_30px_rgba(252,128,25,0.4)]"
             />
          ) : (
             <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center border-4 border-swiggy-orange text-4xl animate-pulse">
                🏆
             </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-swiggy-orange text-white w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 border-black">
            #1
          </div>
      </div>

      <h1 className="text-3xl font-bold text-white leading-tight">{analysis.topRestaurant.name}</h1>
      <p className="text-lg text-gray-400">
        You ordered <span className="text-swiggy-orange font-bold">{analysis.topRestaurant.count} times</span> from here.
      </p>
    </div>,

    // Slide 7: Top Dish (Updated Text)
    <div key="dish" className="flex flex-col items-center justify-center h-full space-y-6 p-4 text-center">
      <h2 className="text-xl text-gray-300">True Love Exists...</h2>
      <p className="text-sm text-swiggy-orange italic -mt-4 animate-pulse">True love isn’t found… it’s delivered.</p>
      
      <div className="text-6xl my-4">🍲</div>
      <h1 className="text-3xl font-bold text-white break-words w-full">{analysis.topDish.name}</h1>
      <p className="text-lg text-gray-400">
        Ordered <span className="text-swiggy-orange font-bold">{analysis.topDish.count} times</span>.
      </p>
    </div>,

    // Slide 8: Time of Day Chart
    <div key="time" className="flex flex-col items-center justify-center h-full w-full p-4">
      <h2 className="text-2xl font-bold text-white mb-8">When You Eat</h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: 'Morn', value: analysis.orderingTimeDistribution.morning },
              { name: 'Lunch', value: analysis.orderingTimeDistribution.lunch },
              { name: 'Snack', value: analysis.orderingTimeDistribution.afternoon },
              { name: 'Dinner', value: analysis.orderingTimeDistribution.dinner },
              { name: 'Night', value: analysis.orderingTimeDistribution.lateNight },
            ]}
          >
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.1)'}}
              contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff'}}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              <Cell fill="#fc8019" />
              <Cell fill="#fc8019" />
              <Cell fill="#fc8019" />
              <Cell fill="#fc8019" />
              <Cell fill="#818cf8" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>,

    // Slide 9: Personality
    <div key="personality" className="flex flex-col items-center justify-center h-full space-y-6 p-6 text-center bg-gradient-to-b from-gray-900 to-gray-800">
      <p className="text-sm text-gray-400 tracking-[0.2em] uppercase">Your Food Persona</p>
      <div className="text-8xl animate-pulse">{analysis.personalityType.icon}</div>
      <h1 className="text-3xl font-black text-white uppercase">{analysis.personalityType.title}</h1>
      <p className="text-gray-300 italic">"{analysis.personalityType.description}"</p>
    </div>,

    // Slide 10: Share
    <div key="share" className="flex flex-col items-center justify-center h-full space-y-8 p-4">
      <h2 className="text-3xl font-bold text-white">That's a wrap!</h2>
      <div className="bg-orange-500/10 p-6 rounded-xl border border-orange-500/20 w-full">
         <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs uppercase">Orders</span>
            <span className="text-white font-bold">{analysis.totalOrders}</span>
         </div>
         <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs uppercase">Top Spot</span>
            <span className="text-white font-bold truncate ml-2">{analysis.topRestaurant.name}</span>
         </div>
         <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs uppercase">Vibe</span>
            <span className="text-white font-bold">{analysis.personalityType.title}</span>
         </div>
      </div>
      <button 
        onClick={() => alert('Screenshot this screen to share!')}
        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
      >
        <Share2 size={20} /> Share
      </button>
      <button onClick={onClose} className="text-gray-500 text-sm hover:text-white underline">
        Close
      </button>
    </div>
  ];

  const nextSlide = () => {
    if (slideIndex < slides.length - 1) setSlideIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (slideIndex > 0) setSlideIndex(prev => prev - 1);
  };

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-10">
        {slides.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ${
                i < slideIndex ? 'w-full' : i === slideIndex ? 'w-full' : 'w-0'
              } ${i === slideIndex ? 'opacity-100' : i < slideIndex ? 'opacity-50' : 'opacity-0'}`}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-hidden relative">
         <div className="w-full h-full animate-fadeIn">
            {slides[slideIndex]}
         </div>
      </div>

      {/* Navigation Areas (Invisible Touch Zones) */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-0 cursor-pointer" onClick={prevSlide} />
      <div className="absolute inset-y-0 right-0 w-1/4 z-0 cursor-pointer" onClick={nextSlide} />

      {/* Fixed Controls (Clickable Buttons) */}
      <div className="absolute bottom-4 right-4 flex gap-4 z-50">
        <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            disabled={slideIndex === 0}
            className={`p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all ${slideIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            disabled={slideIndex === slides.length - 1}
            className={`p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all ${slideIndex === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}