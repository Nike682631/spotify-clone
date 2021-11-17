import "bootstrap/dist/css/bootstrap.min.css"
import Login from "./Login"
import UserDashboard from "./UserDashboard"

const code = new URLSearchParams(window.location.search).get("code")

function App() {
  return code ? <UserDashboard code={code} /> : <Login />
}

export default App
