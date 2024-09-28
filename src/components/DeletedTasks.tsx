import React from 'react';
import { Task } from '../App';

interface Props {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newQuadrant: Task['quadrant'], targetTaskId?: string) => void;
}

const RemovedTasks: React.FC<Props> = ({ tasks, onRestoreTask, onUpdateTask }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="removed-tasks" onDragOver={handleDragOver}>
      <h2>Removed Tasks</h2>
      {tasks.map(task => (
        <div
          key={task.id}
          id={task.id}
          className="task deleted-task" // Make sure both classes are applied
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
        >
          <span className="task-text">{task.text}</span>
          <button onClick={() => onRestoreTask(task.id)} className="restore-button" title="Restore">
            ↺
          </button>
        </div>
      ))}
    </div>
  );
};

export default RemovedTasks;