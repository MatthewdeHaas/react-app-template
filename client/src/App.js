import Userlist from './userlist'
import Adduser from './adduser'

function App() {
  return (
    <div className="App">
      My React + Express App
      <Userlist />
      <Adduser />
      <div className="flex flex-row justify-center text-2xl">Test Tailwind</div>
    </div>
  );
} 

export default App;
