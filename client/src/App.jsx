import axios from "axios"
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
  // 'https://chat-app-backend-5cfi.onrender.com'
  axios.defaults.baseURL = 'https://chat-app-backend-5cfi.onrender.com';
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
     <Routes/>
    </UserContextProvider>
  )
}

export default App
