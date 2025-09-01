import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="flex min-h-screen h-dvh bg-neutral-dark-01">
      <Outlet />
    </div>
  );
}

export default App;
