'use client';

import { useEffect, useState } from 'react';
import { Task } from './Dashboard';

interface Props {
  task: Task;
  taskUpdatedCallback: (task: Task) => void;
}

export function TaskSideView({
  task: task0,
  taskUpdatedCallback,
}: Props) {
  const [task, setTask] = useState(task0);

  useEffect(() => {
    // taskUpdatedCallback(task);
  }, [taskUpdatedCallback, task]);

  useEffect(() => {
    setTask(task0);
  }, [task0]);

  return (
    <div>
      {task.title}
    </div>
  )
}
