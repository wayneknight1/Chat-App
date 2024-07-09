import Avatar from "./Avatar";
function Contact({id, onClick, selectedId, username, selected, online}) {
  return (
     <div key={id} onClick = {() => {console.log('hit the onclick'); onClick(id)}} className={"border-b border-gray-100  flex items-center gap-2 cursor-pointer " + (selected? 'bg-blue-200':'')}>
                    {selected && <div className="w-1 bg-blue-500 h-12"></div>}
        <div className="flex gap-2 py-2 pl-4 items-center">
                        <Avatar online= {online} username = {username} userId= {id}/>
                        <span>{username}</span>
        </div>
        </div>
  )
}

export default Contact