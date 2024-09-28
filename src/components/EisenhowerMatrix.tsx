import React, { useState } from 'react';
import { Task } from '../App';

interface Props {
  tasks: Task[];
  onUpdateTask: (taskId: string, newQuadrant: Task['quadrant'], targetTaskId?: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const EisenhowerMatrix: React.FC<Props> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [delegations, setDelegations] = useState<{[key: string]: string}>({});
  const [completedTasks, setCompletedTasks] = useState<{[key: string]: boolean}>({});

  const quadrants: Array<{
    id: Task['quadrant'],
    action: string
  }> = [
    { id: 'urgentImportant', action: 'Do' },
    { id: 'importantNotUrgent', action: 'Schedule' },
    { id: 'urgentNotImportant', action: 'Delegate' },
    { id: 'notUrgentNotImportant', action: 'Delete' }
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, quadrant: Task['quadrant']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const targetElement = e.target as HTMLElement;
    const targetTask = targetElement.closest('.task') as HTMLElement;
    
    if (targetTask && targetTask.id !== taskId) {
      onUpdateTask(taskId, quadrant, targetTask.id);
    } else {
      onUpdateTask(taskId, quadrant);
    }
  };

  const handleCheckboxChange = (taskId: string) => {
    setCompletedTasks(prev => ({...prev, [taskId]: !prev[taskId]}));
  };

  const handleDelegationChange = (taskId: string, delegateTo: string) => {
    setDelegations({...delegations, [taskId]: delegateTo});
  };

  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (completedTasks[a.id] && !completedTasks[b.id]) return 1;
      if (!completedTasks[a.id] && completedTasks[b.id]) return -1;
      return a.order - b.order;
    });
  };

  return (
    <div className="eisenhower-matrix-container">
      <div className="matrix-label urgent">Urgent</div>
      <div className="matrix-label not-urgent">Not Urgent</div>
      <div className="matrix-label important">Important</div>
      <div className="matrix-label not-important">Not Important</div>
      <div className="eisenhower-matrix">
        {quadrants.map(quadrant => (
          <div
            key={quadrant.id}
            className={`quadrant ${quadrant.id}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, quadrant.id)}
          >
            <div className="action-background">{quadrant.action}</div>
            <div className="tasks-container">
              {sortTasks(tasks.filter(task => task.quadrant === quadrant.id))
                .map(task => (
                  <div
                    key={task.id}
                    id={task.id}
                    className={`task ${completedTasks[task.id] || quadrant.id === 'notUrgentNotImportant' ? 'completed' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <button onClick={() => onDeleteTask(task.id)} className="delete-button">
                      &times;
                    </button>
                    {quadrant.id === 'urgentImportant' && (
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={completedTasks[task.id] || false}
                          onChange={() => handleCheckboxChange(task.id)}
                          className="task-checkbox"
                        />
                      </div>
                    )}
                    <div className="task-content">
                      <div className="task-text">{task.text}</div>
                      {quadrant.id === 'urgentNotImportant' && (
                        <input
                          type="text"
                          placeholder="Delegate to"
                          value={delegations[task.id] || ''}
                          onChange={(e) => handleDelegationChange(task.id, e.target.value)}
                          className="task-delegation"
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EisenhowerMatrix;