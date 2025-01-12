'use client';

import { GetSubMenu } from '@/lib/menu';
import { Task, TrackDashboard } from './Dashboard';
import React, { useCallback } from 'react';
import { TaskSideView } from './TaskSideView';

export const getSubMenus: GetSubMenu = () => {
  return [
    {
      title: 'Task',
    },
    {
      title: 'Calendar',
    },
  ];
};

export default function TaskHome() {
  const [showSideView, setShowSideView] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskUpdatedCallback, setTaskUpdatedCallback] = React.useState<(task: Task) => void>(() => () => { });

  const selectTaskAndShowSideView = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowSideView(true);
  }, [setSelectedTask, setShowSideView]);

  const tasksMock: Task[] = [
    {
      id: 1,
      priority: 1,
      title: '트래커 개발',
      description: 'yuno - track 그럴싸한 ui 까지 mock 개발해보기',
      state: 'ing',
      subTasks: [
        {
          id: 1,
          title: 'UI 개발',
          state: 'complete',
        },
        {
          id: 2,
          title: 'API 개발',
          state: 'todo',
        },
      ],
      due: '3 PM',
      comments: [
        '우효',
        '커멘트라고',
      ],
    },
    {
      id: 2,
      priority: 2,
      title: '멋지게 똥싸기',
      description: '똥을 싸는 것은 어떤 의미일까요?',
      state: 'todo',
      subTasks: [
      ],
      due: '12 AM',
      comments: [
      ],
    },
    {
      id: 3,
      priority: 3,
      title: '또 뭐 할지 생각하기',
      description: '또 뭐 할지 생각하는 것은 어떤 의미일까요?',
      state: 'complete',
      subTasks: [
      ],
      due: 'TOMORROW',
      comments: [
      ],
    },
    {
      id: 4,
      priority: 4,
      title: '생각 안하기',
      description: '생각을 안하는 것은 어떤 의미일까요?',
      state: 'todo',
      subTasks: [
      ],
      due: '12/25',
      comments: [
        '우효',
        '커멘트라고',
        '커멘트라고',
        '커멘트라고',
      ],
    },
    {
      id: 5,
      priority: 4,
      title: '숨쉬기',
      description: '숨숴 숨',
      state: 'ing',
      subTasks: [
      ],
      comments: [
        '우효',
        '커멘트라고',
        '커멘트라고',
        '커멘트라고',
      ],
    }
  ];

  return (
    <div className='w-full h-full relative'>
      <div className='pt-5'>

        <TrackDashboard
          tasks={tasksMock}
          setSelectedTask={selectTaskAndShowSideView}
          taskUpdated={setTaskUpdatedCallback}
        />
      </div>

      {
        showSideView && (
          <div className='fixed top-0 bottom-0 right-0 w-[40rem] bg-h-background'>
            <div className='w-full h-full bg-h-red'>
              <TaskSideView
                task={selectedTask!}
                taskUpdatedCallback={taskUpdatedCallback}
              />
            </div>
          </div>
        )
      }

    </div>
  );
}
