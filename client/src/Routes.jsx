import RegisterAndLoginForm from "./RegisterAndLoginForm"
import { useContext } from "react"
import { UserContext } from "./UserContext"
import Chat from "./Chat"
function Routes() {
    const {username} =useContext(UserContext)
    if(username){
        return <Chat/>
    }
  return (
    <div>
        <RegisterAndLoginForm/>
    </div>
  )
}

export default Routes