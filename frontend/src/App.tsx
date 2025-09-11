import { Outlet } from "react-router-dom";
// import { UpdatePrompt } from "./components/UpdatePrompt";

function App() {
  return (
    <div className="flex min-h-screen h-dvh bg-neutral-dark-01 px-4 py-4">
      {/* <UpdatePrompt /> */}
      <Outlet />
    </div>
  );
}

export default App;
