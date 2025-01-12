'use client';

import React from 'react';
import { Task } from './Dashboard';
import { TaskView } from './TaskView';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

type Props = React.ComponentProps<'div'> & {
  title: string;
  state: 'todo' | 'ing' | 'complete';
  tasks: Task[];

  updateTask: (id: number, task: Partial<Omit<Task, 'id'>>) => void;
  createTask: (task: Omit<Task, 'id'>) => void;
}

export function TaskColumn(props: Props) {
  const {
    title,
    state,
    tasks,
    updateTask,
    createTask,
    ...restProps
  } = props;

  const { setNodeRef } = useDroppable({ id: state });

  return (
    <SortableContext id={state} items={tasks} strategy={verticalListSortingStrategy}>
      <div className='w-[24rem] max-w-full' ref={setNodeRef} {...restProps}>
        <div className='text-center bg-h-tone/5 pt-2 pb-1 select-none'>
          {title}
        </div>

        <div className='px-2 flex flex-col bg-h-tone/5 pt-2 pb-3'>
          {tasks.map(task => (
            <TaskView key={task.id} task={task} updateTask={updateTask}
              draggable
            />
          ))}
        </div>

        <button className='block w-full py-1 text-center hover:bg-h-tone/5' onClick={() => {
          createTask({
            priority: 1,
            title: '',
            description: '',
            state,
            subTasks: [],
            comments: [],
          });
        }}>
          +
        </button>
      </div>
    </SortableContext>
  )
}