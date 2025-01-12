'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { Task } from './Dashboard';
import { EditableText } from '@/components/EditableText';

type Props = React.ComponentProps<'div'> & {
  task: Task;
  updateTask: (id: number, task: Partial<Omit<Task, 'id'>>) => void;
}

export function TaskView(props: Props) {
  const { task, updateTask, ...restProps } = props;

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: task.id,
  });

  return (
    <div
      className={classNames('relative py-1 cursor-pointer hover:bg-h-tone/10')}
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
      {...restProps}
    >
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
                    <input type='checkbox' className='mr-1' defaultChecked={subTask.state === 'complete'}
                      onChange={e => {
                        updateTask(task.id, {
                          subTasks: task.subTasks.map(st => st.id === subTask.id ? {
                            ...st,
                            state: e.currentTarget.checked ? 'complete' : 'todo',
                          } : st)
                        });
                      }}
                    />

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
            <div className='text-h-text/60 mt-2 text-xs hover:text-h-text'>
              📅 {task.due ?? '---'}
            </div>

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
  )
}