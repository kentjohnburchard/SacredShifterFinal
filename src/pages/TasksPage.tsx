import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { supabase } from '../lib/supabase';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { useXP } from '../context/XPProvider';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { addXP } = useXP();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  useEffect(() => {
    fetchTasks();
  }, [user]);
  
  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('is_completed', { ascending: true });
        
      if (error) throw error;
      
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'user_id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks([...tasks, data as Task]);
      setIsAddingTask(false);
      
      // Award XP for creating a task
      await addXP(5);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };
  
  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'user_id'>) => {
    if (!user || !editingTask) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? (data as Task) : task
      ));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? (data as Task) : task
      ));
      
      // Award XP for completing a task
      if (isCompleted) {
        await addXP(10);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sacred Tasks & Rituals</h1>
        <div className="flex space-x-3">
          <button 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendar View
          </button>
          <button 
            onClick={() => {
              setEditingTask(null);
              setIsAddingTask(true);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Task
          </button>
        </div>
      </div>
      
      {isAddingTask && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
          <TaskForm 
            onSubmit={handleAddTask} 
            onCancel={() => setIsAddingTask(false)}
          />
        </div>
      )}
      
      {editingTask && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
          <TaskForm 
            initialTask={editingTask}
            onSubmit={handleUpdateTask} 
            onCancel={() => setEditingTask(null)}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <TaskList 
            tasks={tasks} 
            onTaskToggle={handleToggleTask}
            onTaskDelete={handleDeleteTask}
            onTaskEdit={setEditingTask}
          />
        </div>
      )}
    </div>
  );
};

export default TasksPage;