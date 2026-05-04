/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  ChevronDown,
  LayoutDashboard,
  ListTodo,
  Sun,
  Moon,
  Coffee,
  AlertCircle,
  User,
  Settings,
  Camera,
  X,
  ArrowRight
} from 'lucide-react';
import { Task, Priority, TaskStatus, TimeBlock, UserProfile } from './types';

// Utils
const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' ');

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('student_planner_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('student_planner_profile');
    return saved ? JSON.parse(saved) : { name: 'Nitin Jaiswal', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nitin' };
  });

  const [filter, setFilter] = useState<{ status: 'All' | TaskStatus; priority: 'All' | Priority }>({
    status: 'All',
    priority: 'All'
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('student_planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('student_planner_profile', JSON.stringify(profile));
  }, [profile]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'Pending'
    };
    setTasks([newTask, ...tasks]);
    setIsFormOpen(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Pending' ? 'Completed' : 'Pending' } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesStatus = filter.status === 'All' || t.status === filter.status;
        const matchesPriority = filter.priority === 'All' || t.priority === filter.priority;
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.description?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        const pMap = { High: 0, Medium: 1, Low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      });
  }, [tasks, filter, search, sortBy]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length
  };

  const todayTasks = tasks.filter(t => {
    const d = new Date(t.dueDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const getTimelineTasks = (period: TimeBlock) => {
    return todayTasks.filter(t => {
      const hour = new Date(t.dueDate).getHours();
      if (period === 'Morning') return hour >= 5 && hour < 12;
      if (period === 'Afternoon') return hour >= 12 && hour < 17;
      if (period === 'Evening') return hour >= 17 || hour < 5;
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 3D Atmospheric Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none mb-1">StudentPlanner</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-sm font-semibold text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="group relative flex items-center gap-3 pl-4 py-1 pr-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{profile.name.split(' ')[0]}</span>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500/40 group-hover:border-indigo-400 transition-all">
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </button>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Dashboard & Daily Planner */}
        <div className="lg:col-span-4 space-y-8">
          {/* Welcome Dashboard - Enhanced Glassmorphism KPI */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="group bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2 leading-tight">Focus Up,<br />{profile.name.split(' ')[0]}!</h2>
                <p className="text-slate-400 text-sm font-medium">You have <span className="text-indigo-400 font-bold">{stats.pending} assignments</span> still pending completion.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-auto">
                <StatCard label="Total" value={stats.total} icon={<ListTodo size={14} />} color="indigo" />
                <StatCard label="Done" value={stats.completed} icon={<CheckCircle2 size={14} />} color="emerald" />
                <StatCard label="Wait" value={stats.pending} icon={<Clock size={14} />} color="amber" />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500/20 text-[10px] font-bold text-indigo-400 flex items-center justify-center">+12</div>
                </div>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group/btn">
                  Classmates activity <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Background 3D element */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          </motion.section>

          {/* Daily Planner Section - Interactive Timeline */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white text-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Calendar size={18} />
                </div>
                Daily Timeline
              </h3>
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {todayTasks.length} TODAY
                </span>
              </div>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
              <TimelineSection 
                title="Morning" 
                icon={<Sun className="w-4 h-4" />} 
                tasks={getTimelineTasks('Morning')}
                color="text-amber-500"
                glow="shadow-amber-500/20"
              />
              <TimelineSection 
                title="Afternoon" 
                icon={<Coffee className="w-4 h-4" />} 
                tasks={getTimelineTasks('Afternoon')}
                color="text-indigo-400"
                glow="shadow-indigo-500/20"
              />
              <TimelineSection 
                title="Evening" 
                icon={<Moon className="w-4 h-4" />} 
                tasks={getTimelineTasks('Evening')}
                color="text-violet-400"
                glow="shadow-violet-500/20"
              />
            </div>
          </motion.section>
        </div>

        {/* Right Column - Task List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls - Glassmorphism Form */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg"
          >
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assignments..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border-white/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <FilterButton active={filter.status === 'All'} onClick={() => setFilter({ ...filter, status: 'All' })}>All</FilterButton>
                <FilterButton active={filter.status === 'Pending'} onClick={() => setFilter({ ...filter, status: 'Pending' })}>Wait</FilterButton>
                <FilterButton active={filter.status === 'Completed'} onClick={() => setFilter({ ...filter, status: 'Completed' })}>Done</FilterButton>
              </div>

              <select 
                className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value as any })}
              >
                <option value="All" className="bg-slate-900">Priority: All</option>
                <option value="High" className="bg-slate-900 text-rose-400">High</option>
                <option value="Medium" className="bg-slate-900 text-indigo-400">Medium</option>
                <option value="Low" className="bg-slate-900 text-emerald-400">Low</option>
              </select>

              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl px-6 py-3 text-sm font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={18} />
                New Task
              </button>
            </div>
          </motion.div>

          {/* List Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Assignment Queue</h3>
               <button 
                onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
                className="text-xs font-bold text-indigo-400 flex items-center gap-2 hover:text-indigo-300 transition-colors"
               >
                 <ArrowRight size={14} className={sortBy === 'priority' ? 'rotate-90' : ''} />
                 Sort by {sortBy === 'date' ? 'Priority' : 'Date'}
               </button>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "group bg-slate-900/30 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 flex items-start gap-5 hover:bg-slate-900/50 hover:border-white/20 transition-all duration-300",
                      task.status === 'Completed' && "opacity-60 saturate-[0.5]"
                    )}
                  >
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-1 flex-shrink-0 relative"
                    >
                      {task.status === 'Completed' ? (
                        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-slate-900 shadow-lg shadow-indigo-500/40">
                          <CheckCircle2 size={18} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-700 bg-transparent group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                          <Circle size={18} className="text-transparent group-hover:text-indigo-500/20" />
                        </div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className={cn(
                          "font-bold text-lg text-white truncate max-w-full",
                          task.status === 'Completed' && "line-through text-slate-500"
                        )}>
                          {task.title}
                        </h4>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {task.description && (
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                          <Calendar size={12} className="text-indigo-400" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                          <Clock size={12} className="text-violet-400" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                            {new Date(task.dueDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <ListTodo size={32} className="text-slate-700" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Queue is Empty</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Nothing scheduled? That's your chance to get ahead. Add a task to start organizing.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <TaskForm onSubmit={addTask} onCancel={() => setIsFormOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-10 text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-8 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-500/50 shadow-2xl">
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setProfile({ ...profile, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}` })}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-slate-900 border-4 border-slate-900 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                  <Camera size={18} />
                </button>
              </div>

              <h2 className="text-2xl font-black text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-slate-300 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
        active ? "bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-500/30" : "text-slate-500 hover:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: 'indigo' | 'emerald' | 'amber' }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20 text-amber-400'
  }
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-all group">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-white/5", colors[color])}>
        {icon}
      </div>
      <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">{label}</span>
      <span className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{value}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={cn(
      "text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider",
      styles[priority]
    )}>
      {priority}
    </span>
  );
}

function TimelineSection({ title, icon, tasks, color, glow }: { 
  title: string; 
  icon: React.ReactNode; 
  tasks: Task[];
  color: string;
  glow: string;
}) {
  return (
    <div className="relative pl-10">
      <div className={cn(
        "absolute left-0 top-0.5 w-[31px] h-[31px] rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center z-10 shadow-lg",
        color,
        glow
      )}>
        {icon}
      </div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{title}</h4>
        <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
        <span className="text-[10px] text-slate-500 font-black">{tasks.length}</span>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map(t => (
            <motion.div 
              key={t.id} 
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group/t"
            >
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0 shadow-sm", 
                 t.priority === 'High' ? 'bg-rose-500' : t.priority === 'Medium' ? 'bg-indigo-500' : 'bg-emerald-500'
              )}></div>
              <p className={cn(
                "text-[11px] font-bold truncate transition-colors",
                t.status === 'Completed' ? "text-slate-500 line-through" : "text-slate-300 group-hover/t:text-white"
              )}>
                {t.title}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-slate-500 italic pl-1 font-medium">Free period — keep it up!</p>
      )}
    </div>
  );
}

function TaskForm({ onSubmit, onCancel }: { 
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toJSON().slice(0, 16),
    priority: 'Medium' as Priority
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is mandatory');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2">New Assignment</h2>
        <p className="text-slate-400 text-sm font-medium">Capture your academic goals and deadlines.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Assignment Title</label>
          <input 
            type="text" 
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
            placeholder="e.g. Quantum Physics Lab Report"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setError('');
            }}
          />
          {error && (
            <motion.p 
              initial={{ x: -10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              className="text-rose-400 text-xs font-bold flex items-center gap-2 pl-1"
            >
              <AlertCircle size={14} /> {error}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Context / Details</label>
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium min-h-[120px] resize-none placeholder:text-slate-600"
            placeholder="Add some notes or sub-tasks..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Deadline</label>
            <input 
              type="datetime-local" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold [color-scheme:dark]"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Priority</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold appearance-none"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            >
              <option value="Low" className="bg-slate-900">Low</option>
              <option value="Medium" className="bg-slate-900">Medium</option>
              <option value="High" className="bg-slate-900">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-4 py-4 bg-white/5 text-slate-400 rounded-2xl font-black hover:bg-white/10 transition-colors border border-white/5"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="flex-1 px-4 py-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
