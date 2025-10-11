import React from 'react';
import { Task } from '../App';

interface Props {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const RemovedTasks: React.FC<Props> = ({ tasks, onRestoreTask, isCollapsed, onToggleCollapse }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={`removed-tasks ${isCollapsed ? 'collapsed' : ''}`}
      onDragOver={handleDragOver}
    >
      <div className="panel-header">
        <h2>Removed Tasks</h2>
        <div className="panel-header__actions">
          <span className="panel-count">{tasks.length}</span>
          <button
            type="button"
            className="panel-toggle"
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="panel-content">
          {tasks.length === 0 ? (
            <div className="empty-state">No removed tasks</div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                id={task.id}
                className="task deleted-task"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <span className="task-text">{task.text}</span>
                <button onClick={() => onRestoreTask(task.id)} className="restore-button" title="Restore">
                  ↺
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RemovedTasks;
