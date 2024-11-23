import React, { useState } from 'react';

interface Props {
  onAddTasks: (tasks: string[]) => void;
}

const TaskInput: React.FC<Props> = ({ onAddTasks }) => {
  const [taskText, setTaskText] = useState('');

  const parseTaskInput = (input: string): string[] => {

    // Normalize line endings and remove any checkbox markers
    input = input
      .replace(/\r\n/g, '\n') // Convert Windows line endings
      .replace(/\r/g, '\n')   // Convert old Mac line endings
      .replace(/- \[(x| )?\]/g, '-');

    // Split the input into lines and process each line
    const lines = input.split('\n');

    return lines
      .map(line => {
        // Remove numbers (1., 2., etc) or bullet points (-, *) from the start
        return line.replace(/^\s*(?:\d+\.|[-*])\s*/, '').trim();
      })
      .filter(line => line.length > 0); // Remove empty lines
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      const tasks = parseTaskInput(taskText.trim());
      onAddTasks(tasks);
      setTaskText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-input">
      <textarea
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter tasks"
        rows={3}
        className="task-input__textarea"
      />
      <button type="submit">Add Task(s)</button>
    </form>
  );
};

export default TaskInput;