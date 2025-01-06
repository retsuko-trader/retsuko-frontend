'use client';

import { EditableText } from '@/components/EditableText';
import classNames from 'classnames';
import React from 'react';

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
}

interface TrackDashboardProps {
  tasks: Task[];
}

export function TrackDashboard({ tasks: tasksPreload }: TrackDashboardProps) {
  const [allTasks, setTasks] = React.useState(tasksPreload);

  const tasksIng = allTasks.filter(task => task.state === 'ing');
  const tasksTodo = allTasks.filter(task => task.state === 'todo');
  const tasksComplete = allTasks.filter(task => task.state === 'complete');

  const tasksTabs = [
    {
      title: '진행중',
      tasks: tasksIng,
    },
    {
      title: '할 일',
      tasks: tasksTodo,
    },
    {
      title: '완료',
      tasks: tasksComplete,
    },
  ];

  const updateTask = (id: number, task: Partial<Task>) => {
    setTasks(allTasks.map(t => t.id === id ? { ...t, ...task } : t));
  }

  return (
    <div className='flex flex-col md:flex-row gap-4 items-start'>
      {
        tasksTabs.map(({ title, tasks }) => (
          <div key={title} className='w-[24rem] max-w-full'>
            <div className='text-center bg-h-tone/5 pt-2 pb-1'>
              {title}
            </div>

            <div className='px-2 flex flex-col bg-h-tone/5 pt-2 pb-3'>
              {tasks.map(task => (
                <div key={task.id} className={classNames('relative py-1 cursor-pointer hover:bg-h-tone/10', {
                })}>
                  <div className={classNames('pl-2 border-l-4', {
                    'border-l-h-red/80': task.priority === 1,
                    'border-l-h-yellow/80': task.priority === 2,
                    'border-l-h-green/80': task.priority === 3,
                    'border-l-h-blue/80': task.priority === 4,
                  })}>

                    <EditableText text={task.title} setText={(title) => {
                      updateTask(task.id, { title });
                    }} className={classNames('w-fit text-h-text min-w-full', {
                    })} />

                    <EditableText text={task.description} setText={(description) => {
                      updateTask(task.id, { description });
                    }} className='text-h-text/60 leading-5 min-w-full' />

                    <div className='flex flex-col'>
                      {
                        task.subTasks.map(subTask => (
                          <div key={subTask.id} className={classNames('pl-1 cursor-pointer first:mt-1', {
                          })}>
                            <label className='text-h-text/60'>
                              <input type='checkbox' className='mr-1' />

                              <span className={classNames({
                                'text-h-text/40 line-through': subTask.state === 'complete',
                              })}>
                                {subTask.title}
                              </span>
                            </label>
                          </div>
                        ))
                      }
                    </div>

                    {
                      task.due && (
                        <div className='text-h-text/60 mt-2 text-xs'>
                          📅 {task.due}
                        </div>
                      )
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
}