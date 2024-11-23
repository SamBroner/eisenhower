import React, { useState, useEffect } from 'react';
import './App.css';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import TodoList from './components/TodoList';
import TaskInput from './components/TaskInput';
import RemovedTasks from './components/DeletedTasks';

export interface Task {
  id: string;
  text: string;
  quadrant: 'todoList' | 'urgentImportant' | 'importantNotUrgent' | 'urgentNotImportant' | 'notUrgentNotImportant' | 'deleted';
  order: number;
  originalQuadrant?: Task['quadrant'];
  completed?: boolean;
  delegatedTo?: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTasks = (texts: string[]) => {
    setTasks(prevTasks => {
      const newTasks = texts.map((text, index) => ({
        id: (Date.now() + index).toString(),
        text,
        quadrant: 'todoList' as const,
        order: prevTasks.length + index,
      }));
      return [...prevTasks, ...newTasks];
    });
  };

  const updateTaskOrder = (taskId: string, targetTaskId?: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId)!;
      const updatedTasks = prevTasks.filter(t => t.id !== taskId);
      
      if (targetTaskId) {
        const targetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);
        updatedTasks.splice(targetIndex, 0, taskToMove);
      } else {
        updatedTasks.push(taskToMove);
      }

      return updatedTasks.map((task, index) => ({ ...task, order: index }));
    });
  };

  const updateTaskQuadrant = (taskId: string, newQuadrant: Task['quadrant'], targetTaskId?: string, dropPosition?: 'above' | 'below') => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId)!;
      const updatedTasks = prevTasks.filter(t => t.id !== taskId);
      
      if (targetTaskId) {
        // When dropping onto another task
        const targetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);
        const targetTask = updatedTasks[targetIndex];
        
        // If same quadrant, respect the original order
        if (taskToMove.quadrant === targetTask.quadrant) {
          const originalIndex = prevTasks.findIndex(t => t.id === taskId);
          const targetOriginalIndex = prevTasks.findIndex(t => t.id === targetTaskId);
          const shouldGoBelow = originalIndex < targetOriginalIndex;
          updatedTasks.splice(targetIndex + (shouldGoBelow ? 1 : 0), 0, taskToMove);
        } else {
          // For different quadrants, always insert above target
          updatedTasks.splice(targetIndex, 0, { ...taskToMove, quadrant: newQuadrant });
        }
      } else {
        // When dropping directly into a quadrant
        const tasksInQuadrant = updatedTasks.filter(t => t.quadrant === newQuadrant);
        if (tasksInQuadrant.length === 0) {
          // If quadrant is empty, just add the task
          updatedTasks.push({ ...taskToMove, quadrant: newQuadrant });
        } else {
          // Insert at the specified position (default to end if not specified)
          const insertIndex = dropPosition === 'above' ? 
            updatedTasks.findIndex(t => t.quadrant === newQuadrant) :
            updatedTasks.findIndex(t => t.id === tasksInQuadrant[tasksInQuadrant.length - 1].id) + 1;
          
          updatedTasks.splice(insertIndex, 0, { ...taskToMove, quadrant: newQuadrant });
        }
      }

      return updatedTasks.map((task, index) => ({ ...task, order: index }));
    });
  };

  const clearTasks = () => {
    setTasks([]);
    localStorage.removeItem('tasks');
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId 
        ? { ...task, quadrant: 'deleted', originalQuadrant: task.quadrant } 
        : task
    ));
  };

  const restoreTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId && task.originalQuadrant
        ? { ...task, quadrant: task.originalQuadrant, originalQuadrant: undefined }
        : task
    ));
  };

  const handleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleTaskDelegation = (taskId: string, delegateTo: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId 
        ? { ...task, delegatedTo: delegateTo }
        : task
    ));
  };

  const exportTasks = () => {
    const quadrantNames = {
      urgentImportant: 'Do',
      importantNotUrgent: 'Schedule',
      urgentNotImportant: 'Delegate',
      notUrgentNotImportant: 'Delete',
      todoList: 'Uncategorized'
    };

    const formattedTasks = Object.entries(quadrantNames)
      .map(([quadrant, title]) => {
        const quadrantTasks = tasks
          .filter(task => task.quadrant === quadrant)
          .sort((a, b) => a.order - b.order);

        if (quadrantTasks.length === 0) return '';

        const taskList = quadrantTasks
          .map(task => {
            const isCompleted = quadrant === 'urgentImportant' && task.completed;
            return `- [${isCompleted ? 'x' : ' '}] ${task.text}`;
          })
          .join('\n');

        return `**${title}**\n${taskList}\n`;
      })
      .filter(section => section !== '')
      .join('\n');

    navigator.clipboard.writeText(formattedTasks).then(() => {
      const exportButton = document.getElementById('export-button');
      if (exportButton) {
        exportButton.textContent = 'Copied!';
        setTimeout(() => {
          exportButton.textContent = 'Export';
        }, 2000);
      }
    });
  };

  return (
    <div className="App">
      <div className="title-container">
        <h1>Eisenhower Matrix</h1>
        <div className="tooltip-container">
          <span className="info-icon">ⓘ</span>
          <div className="tooltip-content">
            <h3>What is an Eisenhower Matrix?</h3>
            <p>The <a href="https://www.eisenhower.me/eisenhower-matrix/">Eisenhower Matrix</a> is a productivity tool that helps you organize tasks based on their urgency and importance. Tasks are categorized into four quadrants:</p>
            <ul>
              <li><strong>Do:</strong> Urgent & Important</li>
              <li><strong>Schedule:</strong> Important but Not Urgent</li>
              <li><strong>Delegate:</strong> Urgent but Not Important</li>
              <li><strong>Delete:</strong> Neither Urgent nor Important</li>
            </ul>

            <h3>How to Use This Tool</h3>
            <ul>
              <li>Enter tasks in the input box</li>
              <li>Supports lists with bullet points (-, *), checkboxes ([x]), and numbers (1., 2.)</li>
              <li>Drag tasks between quadrants to organize</li>
              <li>Tasks are automatically saved to your browser</li>
              <li>Export to clipboard in markdown format</li>
            </ul>

            <h3>Built by Sam Broner</h3>
            <p>Blog post <a href="https://sambroner.com/posts/the-agency-gap">here</a> and github <a href="https://github.com/SamBroner/eisenhower">here</a></p>
          </div>
        </div>
      </div>
      <TaskInput 
        onAddTasks={addTasks} 
      />
      <div className="button-container">
        <button onClick={clearTasks}>Clear Tasks</button>
        <button id="export-button" onClick={exportTasks}>Export</button>
      </div>
      <div className="main-container">
        <TodoList 
          tasks={tasks.filter(task => task.quadrant === 'todoList')} 
          onUpdateTask={updateTaskOrder}
          onDeleteTask={deleteTask}
        />
        <EisenhowerMatrix 
          tasks={tasks.filter(task => task.quadrant !== 'todoList' && task.quadrant !== 'deleted')} 
          onUpdateTask={updateTaskQuadrant} 
          onDeleteTask={deleteTask}
          onTaskCompletion={handleTaskCompletion}
          onTaskDelegation={handleTaskDelegation}
        />
        <RemovedTasks
          tasks={tasks.filter(task => task.quadrant === 'deleted')}
          onRestoreTask={restoreTask}
          onUpdateTask={updateTaskQuadrant}
        />
      </div>
    </div>
  );
}

export default App;
