import { useEffect, useState } from 'react'
import './App.css'
import Dexie from 'dexie'

const db = new Dexie('DoTask')

db.version(1).stores({
  tasks: '++id, name, latest, history'
})

const addTask = async (task) => {
  try {
    await db.tasks.add(task)
  } catch (error) {
    console.log(error)
  }
}

const getTasks = async () => {
  try {
    const tasks = await db.tasks.toArray()
    return tasks
  } catch (error) {
    console.log(error)
  }
}

const doneTask = async (id, now) => {
  try {
    const task = await db.tasks.get(id)
    await db.tasks.update(id, { latest: now, history: [...task.history, now] })
  } catch (error) {
    console.log(error)
  }
}

const deleteTask = async (id) => {
  try {
    await db.tasks.delete(id)
  } catch (error) {
    console.log(error)
  }
}

function App() {
  const [taskName, setTaskName] = useState("")
  const [tasks, setTasks] = useState([])

  const updateTasks = async () => {
    const tasks = await getTasks()
    setTasks(tasks)
  }

  const dateFormat = (date) => {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, "0")
    const d = date.getDate().toString().padStart(2, "0")
    const h = date.getHours().toString().padStart(2, "0")
    const min = date.getMinutes().toString().padStart(2, "0")
    return `${y}/${m}/${d} ${h}:${min}`
  }

  // マウント時
  useEffect(() => {
    (async () => {
      await updateTasks()
    })()
  }, []);

  async function handleTaskAdd() {
    const now = new Date()
    await addTask({name: taskName, latest: now, history: [now]})
    await updateTasks()
    setTaskName("")
  }

  /** タスク完了時間更新 */
  async function handleDone(id) {
    await doneTask(id, new Date())
    await updateTasks()
  }

  /** タスク削除 */
  async function handleDelete(id) {
    await deleteTask(id)
    await updateTasks()
  }

  return (
    <>
      <div className="w-full h-screen bg-gray-100 pt-8">
        <div className="bg-white p-3 max-w-5xl mx-auto">
            <div className="text-center">
                <div className="mt-4 flex">
                    <input
                        className="w-80 border-b-2 border-gray-500 text-black pl-2"
                        type="text" placeholder="タスク名を入力"
                        value={taskName}
                        onChange={(event) => setTaskName(event.target.value)}
                    />
                    <button
                        className="ml-2 border-2 border-green-500 p-2 text-green-500 hover:text-white hover:bg-green-500 rounded-lg flex"
                        onClick={handleTaskAdd}
                    >   
                        <svg className="h-6 w-6"  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="12" r="9" />  <line x1="9" y1="12" x2="15" y2="12" />  <line x1="12" y1="9" x2="12" y2="15" /></svg>
                        <span> Add</span>
                    </button>
                </div>        
            </div>
            <div className="mt-8">
                <ul>
                  { tasks.map((task) => (
                    <li className="p-2 rounded-lg" key={task.id}>
                        <div className="flex align-middle flex-row justify-between">
                            <div className='flex'>
                              <button
                                  className="flex text-red-500 border-2 border-red-500 p-2 rounded-lg"
                                  onClick={() => handleDelete(task.id)}
                              >
                                  <span>🗑️</span>
                              </button>
                              <div className="p-2 pl-8">
                                  <p className="text-lg text-black font-semibold">{task.name}</p>
                              </div>
                            </div>
                            <div className='flex'>
                              <div className="p-2 pr-8">
                                <p className="text-lg text-black font-bold">前回: {dateFormat(task.latest)}</p>
                              </div>
                              <button
                                  className="flex text-green-500 border-2 border-green-500 p-2 rounded-lg"
                                  onClick={() => handleDone(task.id)}
                              >
                                  <span>✅ DONE!</span>
                              </button>
                            </div>

                        </div>
                        <hr className="mt-2"/>
                    </li>
                  ))}
                </ul>
            </div>
        </div>    
    </div>
    </>
  )
}

export default App