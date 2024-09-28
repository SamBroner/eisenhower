import React from 'react';
import { Task } from '../App';

interface Props {
  tasks: Task[];
  onUpdateTask: (taskId: string, targetTaskId?: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TodoList: React.FC<Props> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const targetElement = e.target as HTMLElement;
    const targetTask = targetElement.closest('.task') as HTMLElement;
    
    if (targetTask && targetTask.id !== taskId) {
      onUpdateTask(taskId, targetTask.id);
    } else {
      onUpdateTask(taskId);
    }
  };

  return (
    <div className="todo-list" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h2>To-Do List</h2>
      {tasks
        .sort((a, b) => a.order - b.order)
        .map(task => (
          <div
            key={task.id}
            id={task.id}
            className="task"
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
          >
            <span className="task-text">{task.text}</span>
            <button onClick={() => onDeleteTask(task.id)} className="delete-button">
              &times;
            </button>
          </div>
        ))}
    </div>
  );
};

export default TodoList;