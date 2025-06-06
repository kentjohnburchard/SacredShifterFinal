import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, isCompleted: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  
  const handleToggle = () => {
    onToggle(task.id, !task.is_completed);
  };
  
  return (
    <div 
      className={`bg-white p-4 rounded-md shadow-sm border ${
        task.is_completed ? 'border-gray-200' : 'border-indigo-100'
      } transition duration-200 hover:shadow-md relative`}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={handleToggle}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
        />
        
        <div className="ml-3 flex-1">
          <h4 className={`text-base font-medium ${
            task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {task.title}
          </h4>
          
          {task.description && (
            <p className={`text-sm mt-1 ${
              task.is_completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
            <span>{new Date(task.date).toLocaleDateString()}</span>
            {task.time && <span>{task.time}</span>}
            {task.is_recurring && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Recurring</span>}
          </div>
        </div>
        
        <div className="relative">
          <button 
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                onClick={() => {
                  setShowActions(false);
                  onEdit(task);
                }}
              >
                <Edit2 size={14} className="mr-2" />
                Edit
              </button>
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setShowActions(false);
                  onDelete(task.id);
                }}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;