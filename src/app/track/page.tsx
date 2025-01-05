import { GetSubMenu } from '@/lib/menu';

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
      title: '멋지게 밥먹기',
    },
    {
      id: 2,
      title: '멋지게 똥싸기',
    },
    {
      id: 3,
      title: '또 뭐 할지 생각하기',
    },
  ]

  return (
    <div>
      <div>
        <div className='mb-5'>

        </div>

        <div className='max-w-[30rem]'>
          <div className='text-h-blue border-b border-h-blue pb-1 mb-1'>
            Todos
          </div>

          <div>
            {tasksMock.map(task => (
              <div key={task.id} className='py-0.5'>
                <label className='cursor-pointer'>
                  <input type='checkbox' className='' />

                  <div className='inline-block pl-2'>
                    {task.title}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}