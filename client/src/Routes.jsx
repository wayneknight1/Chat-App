import RegisterAndLoginForm from "./RegisterAndLoginForm"
import { useContext } from "react"
import { UserContext } from "./UserContext"
function Routes() {
    const {username} =useContext(UserContext)
    if(username){
        return 'logged in! '+username
    }
  return (
    <div>
        <RegisterAndLoginForm/>
    </div>
  )
}

export default Routes