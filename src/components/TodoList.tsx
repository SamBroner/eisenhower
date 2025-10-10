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

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="todo-list" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="panel-header">
        <h2>To-Do List</h2>
        <span className="panel-count">{sortedTasks.length}</span>
      </div>
      <div className="panel-content">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">No tasks yet</div>
        ) : (
          sortedTasks.map(task => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
