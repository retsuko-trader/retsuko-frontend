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
  comments: string[];
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

  const updateTask = (id: number, task: Partial<Task>) => {
    setTasks(allTasks.map(t => t.id === id ? { ...t, ...task } : t));
  }

  return (
    <div className='flex flex-col md:flex-row gap-4 items-start'>
      {
        tasksTabs.map(({ title, state, tasks }) => (
          <div key={title} className='w-[24rem] max-w-full'>
            <div className='text-center bg-h-tone/5 pt-2 pb-1 select-none'>
              {title}
            </div>

            <div className='px-2 flex flex-col bg-h-tone/5 pt-2 pb-3'>
              {tasks.map(task => (
                <div key={task.id} className={classNames('relative py-1 cursor-pointer hover:bg-h-tone/10', {
                })}>
                  <div className='flex flex-row items-stretch'>
                    <div className={classNames('w-1 pr-1 mr-1', {
                      'bg-h-red/80 hover:bg-h-red/100': task.priority === 1,
                      'bg-h-yellow/80 hover:bg-h-yellow/100': task.priority === 2,
                      'bg-h-green/80 hover:bg-h-green/100': task.priority === 3,
                      'bg-h-blue/80 hover:bg-h-blue/100': task.priority === 4,
                    })}>
                    </div>
                    <div className='w-full'>

                      <EditableText text={task.title} setText={(title) => {
                        updateTask(task.id, { title });
                      }}
                        className={classNames('w-fit text-h-text min-h-6')}
                        editClassName='min-w-full'
                        placeHolder={<span className='text-h-text/40'>TITLE</span>}
                      />

                      <EditableText text={task.description} setText={(description) => {
                        updateTask(task.id, { description });
                      }}
                        className='text-h-text/60 w-fit leading-5 min-h-5'
                        editClassName='min-w-full h-5'
                        placeHolder={<span className='text-h-text/40'>DESCRIPTION</span>} />

                      <div className='flex flex-col'>
                        {
                          task.subTasks.map(subTask => (
                            <div key={subTask.id} className={classNames('pl-1 cursor-pointer first:mt-1', {
                            })}>
                              <label className='text-h-text/60 cursor-pointer'>
                                <input type='checkbox' className='mr-1' defaultChecked={subTask.state === 'complete'} />

                                <span className={classNames('select-none', {
                                  'text-h-text/40 line-through': subTask.state === 'complete',
                                })}>
                                  {subTask.title}
                                </span>
                              </label>
                            </div>
                          ))
                        }
                      </div>

                      <div className='flex flex-row'>
                      {
                        task.due && (
                            <div className='text-h-text/60 mt-2 text-xs'>
                              📅 {task.due}
                            </div>
                        )
                      }

                        <div className='flex-1' />

                        {
                          task.comments.length > 0 && (
                            <div className='text-h-text/60 mt-2 text-xs'>
                              💬 {task.comments.length}
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className='block w-full py-1 text-center hover:bg-h-tone/5' onClick={() => {
              setTasks([...allTasks, {
                id: allTasks.length + 1,
                priority: 1,
                title: '',
                description: '',
                state,
                subTasks: [],
                comments: [],
              }]);
            }}>
              +
            </button>
          </div>
        ))
      }
    </div>
  );
}
