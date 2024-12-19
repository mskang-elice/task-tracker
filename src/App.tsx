import GlobalStyle from "./GlobalStyle";
import { StoreProvider } from "./useStore";
import TaskTracker from "./TaskTracker";

function App() {
  return (
    <StoreProvider>
      <GlobalStyle />
      <TaskTracker />
    </StoreProvider>
  )
}

export default App;