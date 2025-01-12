'use client';

import React from 'react';
import { TaskView } from './TaskView';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useDnd } from './useDnd';
import { TaskColumn } from './TaskColumn';

export interface Task {
  id: number;
  priority: number;
  title: string;
  description: string;
  state: 'todo' | 'ing' | 'complete';
  subTasks: Array<{
    id: number,
    title: string;
    state: 'todo' | 'ing' | 'complete';
  }>;
  due?: string;
  comments: string[];
}

interface TrackDashboardProps {
  tasks: Task[];
  setSelectedTask: (task: Task) => void;
  taskUpdated: (callback: (task: Task) => void) => void;
}

export function TrackDashboard({
  tasks: tasksPreload,
}: TrackDashboardProps) {
  const [allTasks, setTasks] = React.useState(tasksPreload);
  const [dragState, setDragState] = React.useState<Task['state'] | null>(null);

  const dnd = useDnd();

  const tasksIng = allTasks.filter(task => task.state === 'ing');
  const tasksTodo = allTasks.filter(task => task.state === 'todo');
  const tasksComplete = allTasks.filter(task => task.state === 'complete');

  const tasksTabs = [
    {
      title: '진행중',
      state: 'ing',
      tasks: tasksIng,
    },
    {
      title: '할 일',
      state: 'todo',
      tasks: tasksTodo,
    },
    {
      title: '완료',
      state: 'complete',
      tasks: tasksComplete,
    },
  ] as const;

  const createTask = (task: Omit<Task, 'id'>) => {
    setTasks([...allTasks, {
      ...task,
      id: allTasks.length + 1,
    }]);
  };

  const updateTask = (id: number, task: Partial<Task>) => {
    setTasks(tasks => tasks.map(t => t.id === id ? { ...t, ...task } : t));
  }

  const findState = (id: string | number) => {
    if (id === 'ing') return 'ing';
    if (id === 'todo') return 'todo';
    if (id === 'complete') return 'complete';

    return allTasks.find(x => x.id === Number(id))?.state;
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const task = allTasks.find(x => x.id === active.id);
    if (!task || !over) {
      return;
    }

    updateTask(task.id, {
      state: findState(over.id)
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const task = allTasks.find(x => x.id === active.id);
    if (!task || !over) {
      return;
    }

    updateTask(task.id, {
      state: findState(over.id)
    });
  };

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className='flex flex-col md:flex-row gap-4 items-start'>
        {
          tasksTabs.map(({ title, state: state0, tasks }) => {
            const state = state0;

            return (
              <TaskColumn
                key={title}
                title={title}
                state={state}
                tasks={tasks}
                updateTask={updateTask}
                createTask={createTask}
              />
            )
          })
        }
    </div>
    </DndContext>
  );
}
