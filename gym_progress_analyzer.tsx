import React, { useState, useMemo } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, Plus, Trash2, TrendingUp, Activity } from 'lucide-react';

const GymProgressAnalyzer = () => {
  const [dataPoints, setDataPoints] = useState([
    { id: 1, hours: 5, diet: 7, sleep: 7, type: 'Strength', muscleGain: 2.5, fatLoss: 1.2 },
    { id: 2, hours: 3, diet: 5, sleep: 6, type: 'Cardio', muscleGain: 0.8, fatLoss: 2.8 },
    { id: 3, hours: 6, diet: 8, sleep: 8, type: 'Strength', muscleGain: 3.2, fatLoss: 1.8 },
    { id: 4, hours: 4, diet: 6, sleep: 7, type: 'Mixed', muscleGain: 1.9, fatLoss: 2.1 },
    { id: 5, hours: 7, diet: 9, sleep: 8, type: 'Strength', muscleGain: 4.1, fatLoss: 2.3 },
    { id: 6, hours: 2, diet: 4, sleep: 5, type: 'Cardio', muscleGain: 0.3, fatLoss: 1.5 },
    { id: 7, hours: 5, diet: 7, sleep: 6, type: 'Mixed', muscleGain: 2.2, fatLoss: 2.0 },
    { id: 8, hours: 4, diet: 8, sleep: 9, type: 'Strength', muscleGain: 2.8, fatLoss: 1.4 },
    { id: 9, hours: 6, diet: 6, sleep: 7, type: 'Cardio', muscleGain: 1.5, fatLoss: 3.2 },
    { id: 10, hours: 5, diet: 9, sleep: 8, type: 'Mixed', muscleGain: 2.9, fatLoss: 2.4 },
  ]);

  const [newEntry, setNewEntry] = useState({
    hours: 5,
    diet: 7,
    sleep: 7,
    type: 'Strength',
    muscleGain: 2.5,
    fatLoss: 2.0
  });

  const [activeMetric, setActiveMetric] = useState('muscleGain');

  const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlationData = useMemo(() => {
    const metric = activeMetric === 'muscleGain' ? 'muscleGain' : 'fatLoss';
    const yValues = dataPoints.map(d => d[metric]);
    
    return [
      { 
        factor: 'Hours/Week', 
        correlation: calculateCorrelation(dataPoints.map(d => d.hours), yValues),
        impact: 'Volume'
      },
      { 
        factor: 'Diet Quality', 
        correlation: calculateCorrelation(dataPoints.map(d => d.diet), yValues),
        impact: 'Nutrition'
      },
      { 
        factor: 'Sleep Hours', 
        correlation: calculateCorrelation(dataPoints.map(d => d.sleep), yValues),
        impact: 'Recovery'
      },
    ].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [dataPoints, activeMetric]);

  const workoutTypeData = useMemo(() => {
    const types = ['Strength', 'Cardio', 'Mixed'];
    return types.map(type => {
      const filtered = dataPoints.filter(d => d.type === type);
      if (filtered.length === 0) return { type, avgMuscle: 0, avgFat: 0, count: 0 };
      
      return {
        type,
        avgMuscle: filtered.reduce((sum, d) => sum + d.muscleGain, 0) / filtered.length,
        avgFat: filtered.reduce((sum, d) => sum + d.fatLoss, 0) / filtered.length,
        count: filtered.length
      };
    });
  }, [dataPoints]);

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { ...newEntry, id: Date.now() }]);
    setNewEntry({
      hours: 5,
      diet: 7,
      sleep: 7,
      type: 'Strength',
      muscleGain: 2.5,
      fatLoss: 2.0
    });
  };

  const deleteDataPoint = (id) => {
    setDataPoints(dataPoints.filter(d => d.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['Hours/Week', 'Diet Quality', 'Sleep Hours', 'Workout Type', 'Muscle Gain (lbs)', 'Fat Loss (lbs)'];
    const csv = [
      headers.join(','),
      ...dataPoints.map(d => `${d.hours},${d.diet},${d.sleep},${d.type},${d.muscleGain},${d.fatLoss}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gym_progress_data.csv';
    a.click();
  };

  const getCorrelationColor = (corr) => {
    const abs = Math.abs(corr);
    if (abs > 0.7) return '#10b981';
    if (abs > 0.4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10" />
                Gym Progress Analyzer
              </h1>
              <p className="text-purple-200">Discover which factors drive your fitness results</p>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveMetric('muscleGain')}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                activeMetric === 'muscleGain'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              💪 Muscle Gain Analysis
            </button>
            <button
              onClick={() => setActiveMetric('fatLoss')}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                activeMetric === 'fatLoss'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              🔥 Fat Loss Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Correlation Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Factor Correlations
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="factor" stroke="#fff" />
                <YAxis stroke="#fff" domain={[-1, 1]} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="correlation" radius={[8, 8, 0, 0]}>
                  {correlationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCorrelationColor(entry.correlation)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              {correlationData.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-lg">
                  <div className="text-purple-300 font-semibold">{item.factor}</div>
                  <div className="text-2xl font-bold text-white">{(item.correlation * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-400">{item.impact}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Type Comparison */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Workout Type Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="type" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgMuscle" name="Avg Muscle Gain (lbs)" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgFat" name="Avg Fat Loss (lbs)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Diet Quality vs {activeMetric === 'muscleGain' ? 'Muscle Gain' : 'Fat Loss'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="diet" name="Diet Quality" stroke="#fff" label={{ value: 'Diet Quality (1-10)', position: 'insideBottom', offset: -5, fill: '#fff' }} />
              <YAxis dataKey={activeMetric} name={activeMetric === 'muscleGain' ? 'Muscle Gain' : 'Fat Loss'} stroke="#fff" />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter data={dataPoints} fill={activeMetric === 'muscleGain' ? '#10b981' : '#f59e0b'} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Data Entry Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Add New Entry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="text-purple-200 text-sm block mb-1">Hours/Week</label>
              <input
                type="number"
                value={newEntry.hours}
                onChange={(e) => setNewEntry({...newEntry, hours: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="text-purple-200 text-sm block mb-1">Diet (1-10)</label>
              <input
                type="number"
                value={newEntry.diet}
                onChange={(e) => setNewEntry({...newEntry, diet: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="text-purple-200 text-sm block mb-1">Sleep (hrs)</label>
              <input
                type="number"
                value={newEntry.sleep}
                onChange={(e) => setNewEntry({...newEntry, sleep: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                min="0"
                max="12"
              />
            </div>
            <div>
              <label className="text-purple-200 text-sm block mb-1">Type</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-purple-200 text-sm block mb-1">Muscle Gain (lbs)</label>
              <input
                type="number"
                value={newEntry.muscleGain}
                onChange={(e) => setNewEntry({...newEntry, muscleGain: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-purple-200 text-sm block mb-1">Fat Loss (lbs)</label>
              <input
                type="number"
                value={newEntry.fatLoss}
                onChange={(e) => setNewEntry({...newEntry, fatLoss: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
                step="0.1"
              />
            </div>
          </div>
          <button
            onClick={addDataPoint}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Dataset ({dataPoints.length} entries)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Hours/Week</th>
                  <th className="text-left p-3">Diet</th>
                  <th className="text-left p-3">Sleep</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Muscle Gain</th>
                  <th className="text-left p-3">Fat Loss</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((point) => (
                  <tr key={point.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-3">{point.hours}</td>
                    <td className="p-3">{point.diet}</td>
                    <td className="p-3">{point.sleep}</td>
                    <td className="p-3">{point.type}</td>
                    <td className="p-3">{point.muscleGain} lbs</td>
                    <td className="p-3">{point.fatLoss} lbs</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteDataPoint(point.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📈 Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2">Strongest Factor</div>
              <div className="text-2xl font-bold text-white">{correlationData[0]?.factor}</div>
              <div className="text-sm text-gray-300 mt-1">
                {(Math.abs(correlationData[0]?.correlation || 0) * 100).toFixed(0)}% correlation
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2">Sample Size</div>
              <div className="text-2xl font-bold text-white">{dataPoints.length} entries</div>
              <div className="text-sm text-gray-300 mt-1">Total data points</div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2">Best Workout</div>
              <div className="text-2xl font-bold text-white">
                {workoutTypeData.reduce((best, curr) => 
                  curr[activeMetric === 'muscleGain' ? 'avgMuscle' : 'avgFat'] > 
                  best[activeMetric === 'muscleGain' ? 'avgMuscle' : 'avgFat'] ? curr : best
                ).type}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                For {activeMetric === 'muscleGain' ? 'muscle gain' : 'fat loss'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymProgressAnalyzer;