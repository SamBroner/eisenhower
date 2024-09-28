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
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [testDataCounter, setTestDataCounter] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const savedCounter = localStorage.getItem('testDataCounter');
    if (savedCounter) {
      setTestDataCounter(parseInt(savedCounter, 10));
    }
  }, []);

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      quadrant: 'todoList',
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
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

  const updateTaskQuadrant = (taskId: string, newQuadrant: Task['quadrant'], targetTaskId?: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId)!;
      const updatedTasks = prevTasks.filter(t => t.id !== taskId);
      
      if (targetTaskId) {
        const targetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);
        updatedTasks.splice(targetIndex, 0, { ...taskToMove, quadrant: newQuadrant });
      } else {
        const lastIndexInQuadrant = updatedTasks.filter(t => t.quadrant === newQuadrant).length;
        updatedTasks.splice(lastIndexInQuadrant, 0, { ...taskToMove, quadrant: newQuadrant });
      }

      return updatedTasks.map((task, index) => ({ ...task, order: index }));
    });
  };

  const addTestData = () => {
    const newSetNumber = testDataCounter + 1;
    const testTasks: Task[] = [
      { id: `test-${Date.now()}-1`, text: `Urgent and Important Task #${newSetNumber}`, quadrant: 'urgentImportant', order: 0 },
      { id: `test-${Date.now()}-2`, text: `Important but Not Urgent Task #${newSetNumber}`, quadrant: 'importantNotUrgent', order: 1 },
      { id: `test-${Date.now()}-3`, text: `Urgent but Not Important Task #${newSetNumber}`, quadrant: 'urgentNotImportant', order: 2 },
      { id: `test-${Date.now()}-4`, text: `Neither Urgent nor Important Task #${newSetNumber}`, quadrant: 'notUrgentNotImportant', order: 3 },
      { id: `test-${Date.now()}-5`, text: `Todo List Task #${newSetNumber}`, quadrant: 'todoList', order: 4 },
    ];
    setTasks(prevTasks => [...prevTasks, ...testTasks]);
    setTestDataCounter(newSetNumber);
    localStorage.setItem('testDataCounter', newSetNumber.toString());
  };

  const clearTasks = () => {
    setTasks([]);
    setTestDataCounter(0);
    localStorage.removeItem('tasks');
    localStorage.removeItem('testDataCounter');
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

  return (
    <div className="App">
      <h1>Eisenhower Matrix</h1>
      <TaskInput onAddTask={addTask} />
      <div className="button-container">
        <button onClick={addTestData}>Add Test Data</button>
        <button onClick={clearTasks}>Clear Tasks</button>
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
