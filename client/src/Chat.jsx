import { useEffect, useState } from "react"
import Avatar from "./Avatar";
import Logo from './Logo'
import { useContext } from "react";
import { UserContext } from "./UserContext";
function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState([]);
    const [selectedId, setSelectedId] = useState(null)
    const {id} = useContext(UserContext)
    useEffect(() => {
        const wsT =new WebSocket('ws://localhost:4000')
        wsT.addEventListener('message', handleMessage)
        setWs(wsT)
    }, [])

    function showOnlinePeople(peopleArray){
        const people = {}
        peopleArray.forEach(person => {
            people[person.userId] = person.username
        })
        console.log(people)
        setOnlinePeople(people)
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data)
        console.log(messageData);
        if('online' in messageData){
            showOnlinePeople(messageData.online)
        }
    }

    const onlinePeopleExcludingOurUser = {...onlinePeople}
    delete onlinePeopleExcludingOurUser[id]

  return (
    <div className="flex h-screen">
        <div className="bg-blue-100 w-1/3 ">
            <div className="text-blue-600 font-bold flex gap-2 mb-2 p-4">
            <Logo/>
Find Friends</div>
            {Object.keys(onlinePeopleExcludingOurUser).map(uId => {
                return <div key={uId} onClick = {() => {console.log('hit the onclick');setSelectedId(uId)}} className={"border-b border-gray-100  flex items-center gap-2 cursor-pointer " + (uId ===selectedId? 'bg-blue-200':'')}>
                    {uId === selectedId && <div className="w-1 bg-blue-500 h-12"></div>}
                    <div className="flex gap-2 py-2 pl-4 items-center">
                        <Avatar username = {onlinePeople[uId]} userId= {uId}/>
                        <span>{onlinePeople[uId]}</span>
                    </div>
                    </div>
            })}
        </div>
        <div className="flex flex-col bg-blue-300 w-2/3 p-2">
            <div className="flex-grow">
                {!selectedId && <div  className="flex h-full flex-grow items-center justify-center"> 
                    <div className="text-gray-500"> &larr; Please Select A Person</div> 
                </div>}
            </div>
            <div className="flex gap-2">
                <input type="text" placeholder="Enter your message here" className="bg-white border p-2 flex-grow"/>
                <button className="bg-blue-500 text-white p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
                </button>
            </div>
        </div>
    </div>
  )
}

export default Chat