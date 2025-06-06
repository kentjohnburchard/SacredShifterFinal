import React from 'react';
import { Task } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onTaskToggle, 
  onTaskDelete,
  onTaskEdit
}) => {
  const incompleteTasks = tasks.filter(task => !task.is_completed);
  const completedTasks = tasks.filter(task => task.is_completed);
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mb-4 text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg\" className="h-16 w-16 mx-auto\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
            <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth="2\" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-500">No tasks available</h3>
        <p className="mt-2 text-gray-400">Create a new sacred task to begin your spiritual journey</p>
      </div>
    );
  }
  
  return (
    <div>
      {incompleteTasks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Active Rituals ({incompleteTasks.length})
          </h3>
          <div className="space-y-3">
            {incompleteTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onTaskToggle} 
                onDelete={onTaskDelete}
                onEdit={onTaskEdit}
              />
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
            <span>Completed ({completedTasks.length})</span>
          </h3>
          <div className="space-y-3 opacity-70">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onTaskToggle} 
                onDelete={onTaskDelete}
                onEdit={onTaskEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;