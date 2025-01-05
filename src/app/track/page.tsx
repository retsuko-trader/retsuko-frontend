import { GetSubMenu } from '@/lib/menu';
import classNames from 'classnames';

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
  const tasksMock = [
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
    },
    {
      id: 5,
      priority: 4,
      title: '숨쉬기',
      description: '숨숴 숨',
      state: 'ing',
      subTasks: [
      ],
    }
  ];

  const tasksIng = tasksMock.filter(task => task.state === 'ing');
  const tasksTodo = tasksMock.filter(task => task.state === 'todo');
  const tasksComplete = tasksMock.filter(task => task.state === 'complete');

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

  return (
    <div>
      <div>
        <div className='mb-5'>

        </div>

        <div className='flex flex-row gap-x-4 items-start'>
          {
            tasksTabs.map(({ title, tasks }) => (
              <div key={title} className='w-[24rem]'>
                <div className='text-center bg-h-tone/5 pt-2 pb-1'>
                  {title}
                </div>

                <div className='px-2 flex flex-col bg-h-tone/5 pt-2 pb-3'>
                  {tasks.map(task => (
                    <div key={task.id} className={classNames('py-1 cursor-pointer hover:bg-h-tone/10', {
                    })}>
                      <div className={classNames('pl-2 border-l-4 py-', {
                        'border-l-h-red/80': task.priority === 1,
                        'border-l-h-yellow/80': task.priority === 2,
                        'border-l-h-green/80': task.priority === 3,
                        'border-l-h-blue/80': task.priority === 4,
                      })}>

                        <div className={classNames('w-fit text-h-text', {
                        })}>
                          {task.title}
                        </div>

                        <div className='text-h-text/60 leading-5'>
                          {task.description}
                        </div>

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
      </div>

    </div>
  );
}