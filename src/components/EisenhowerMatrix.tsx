import React, { useState } from 'react';
import { Task } from '../App';

interface Props {
  tasks: Task[];
  onUpdateTask: (taskId: string, newQuadrant: Task['quadrant'], targetTaskId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskCompletion: (taskId: string) => void;
  onTaskDelegation: (taskId: string, delegateTo: string) => void;
}

const EisenhowerMatrix: React.FC<Props> = ({ tasks, onUpdateTask, onDeleteTask, onTaskCompletion, onTaskDelegation }) => {
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
    
    const targetTask = targetElement.closest('.task');
    const targetQuadrant = targetElement.closest('.quadrant');
    
    if (targetTask && targetTask.id !== taskId) {
      onUpdateTask(taskId, quadrant, targetTask.id);
    } else if (targetQuadrant) {
      const dropY = e.clientY;
      
      const taskElements = Array.from(targetQuadrant.querySelectorAll('.task'));
      
      if (taskElements.length === 0) {
        onUpdateTask(taskId, quadrant);
        return;
      }
      
      for (let i = 0; i < taskElements.length; i++) {
        const taskRect = taskElements[i].getBoundingClientRect();
        const taskMiddle = taskRect.top + taskRect.height / 2;
        
        if (dropY < taskMiddle) {
          onUpdateTask(taskId, quadrant, taskElements[i].id);
          return;
        }
      }
      
      onUpdateTask(taskId, quadrant);
    }
  };

  const handleDelegationChange = (taskId: string, delegateTo: string) => {
    onTaskDelegation(taskId, delegateTo);
  };

  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
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
                    className={`task ${task.completed || quadrant.id === 'notUrgentNotImportant' ? 'completed' : ''}`}
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
                          checked={task.completed || false}
                          onChange={() => onTaskCompletion(task.id)}
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
                          value={task.delegatedTo || ''}
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