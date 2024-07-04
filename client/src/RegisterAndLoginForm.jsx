import { useState } from "react"
import axios from "axios"
import { useContext } from "react"
import { UserContext } from "./UserContext"
function RegisterAndLoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register')
    const {setUsername: setLoggedInUsername, setId} = useContext(UserContext)
    async function handleSubmit(e){
        e.preventDefault()
        const url = isLoginOrRegister === 'Register'?'register':'login';
        const {data} = await axios.post(url , {username, password});
        setLoggedInUsername(username)
        setId(data.id)
    }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
        <form className="w-64 mx-auto mb-12" onSubmit={e => handleSubmit(e)}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}   placeholder="username" className="block w-full rounded-sm p-2 mb-2 border"/>
            <input type="text" value = {password} onChange={e => setPassword(e.target.value)}   placeholder="password" className="block w-full rounded-sm p-2 mb-2 border"/>
            <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
               {isLoginOrRegister === 'Register'?"Register":'Login'}
            </button>
        <div className="mt-4 text-center">
            {isLoginOrRegister === 'Register' && (<div style={{fontSize: '0.8rem'}}>
            Already A Member? <button onClick={() => setIsLoginOrRegister('Login')}>Login Here</button>
            </div>)}
            {isLoginOrRegister === 'Login' && (<div style={{fontSize: '0.8rem'}}>
                Dont have an account? <button onClick={() => setIsLoginOrRegister('Register')}>Create one HERE</button> 
            </div>)}
        </div>
        </form>

    </div>
  )
}

export default RegisterAndLoginForm