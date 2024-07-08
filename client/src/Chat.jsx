import { useEffect, useRef, useState } from "react"
import Avatar from "./Avatar";
import Logo from './Logo'
import { useContext } from "react";
import { UserContext } from "./UserContext";
import {uniqBy} from 'lodash'
import axios from "axios";

function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState([]);
    const [selectedId, setSelectedId] = useState(null)
    const {id} = useContext(UserContext)
    const [newMessageText, setNewMessageText] = useState('');
    const [messages,setMessages] = useState([])
    const [messagesWithoutDupes, setMessagesWithoutDupes] = useState([]);

    const messagesBoxRef = useRef(null)
    useEffect(() => {
        const wsT =new WebSocket('ws://localhost:4000')
        wsT.addEventListener('message', handleMessage)
        setWs(wsT)
    }, [])

    useEffect(() => {
        if(selectedId){
            axios.get('/messages/'+selectedId)
        }
    }, [selectedId])

    useEffect(() => {
        setMessagesWithoutDupes(uniqBy(messages,'id'))
    },[messages])

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
        else{
            setMessages(prev => [...prev, {...messageData}])
        }
    }

    function sendMessage(e){
        e.preventDefault();
        console.log('sending message');
        ws.send(JSON.stringify({
                sender:id,
                recipient: selectedId,
                text: newMessageText
        }))
        setMessages(prev => [...prev, {
            text: newMessageText, 
            sender: id,
            recipient: selectedId,
            id: Date.now()
        }])
        setNewMessageText('')
    }
    const onlinePeopleExcludingOurUser = {...onlinePeople}
    delete onlinePeopleExcludingOurUser[id]

    // const messagesWithoutDupes = uniqBy(messages,'id')
    

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
            <div className="flex-grow overflow-y-auto">
                {!selectedId && <div  className="flex h-full flex-grow items-center justify-center"> 
                    <div className="text-gray-500"> &larr; Please Select A Person</div> 
                </div>}
                {!!selectedId && 
                (<div className="relative h-full"> 
                    <div ref={messagesBoxRef} className="overflow-y-scroll absolute inset-0 ">
                    {messagesWithoutDupes.map(message => (<div key={message.id} className={"p-2 m-2 rounded-sm"+(message.sender === id?' bg-blue-900 text-white':' bg-red-300 text-black')}>
                        {"sender: "+message.sender}<br/>
                        {"recipient: "+message.recipient}<br/>
                        {message.text}</div>))}
                    </div>
                </div>)}
            </div>
            {!!selectedId && (<form className="flex gap-2" onSubmit={sendMessage}>
                <input value={newMessageText} onChange={e => setNewMessageText(e.target.value)} type="text" placeholder="Enter your message here" className="bg-white border p-2 flex-grow"/>
                <button type = 'submit' className="bg-blue-500 text-white p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
                </button>
            </form>)}
            
        </div>
    </div>
  )
}

export default Chat