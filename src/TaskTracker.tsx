import styled from "styled-components";

import Stage from "./Stage";
import useStore from "./useStore";
// import { initLocalStorage, resetLocalStorage } from "./initLocalStorage"; // DEBUG
import { useState } from "react";
import { RedoIcon, UndoIcon } from "./Icons";

function App() {
  const stageIds = [0, 1, 2, 3, 4]
  const store = useStore();
  const [movedTaskId, setMovedTaskId] = useState<number | undefined>(undefined);

  return (
    <Container>
      <ToolBarContainer>
        <div style={{display: 'flex', flexDirection: 'row', gap: '8px'}}>
          <Button disabled={!store.undoable} onClick={store.undo}><UndoIcon /></Button>
          <Button disabled={!store.redoable} onClick={store.redo}><RedoIcon /></Button>
        </div>
        {/* <div>
          <button onClick={() => initLocalStorage()}>DEBUG: set init data</button>
          <button onClick={() => resetLocalStorage()}>DEBUG: reset data</button>
        </div> */}
      </ToolBarContainer>
      <StageContainer>
        {stageIds.map((stageId) => (
          <Stage
            key={stageId}
            stageId={stageId}
            movedTaskId={movedTaskId}
            setMovedTaskId={setMovedTaskId}
          />
        ))}
      </StageContainer>
    </Container>
  )
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;

  padding: 8px;
`;

const ToolBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-bottom: 8px;

  /* background-color: blue; */
`;

const Button = styled.button`
  width: 22px;
  height: 22px;

  border: none;
  border-radius: 30%;

  box-shadow: 0 0 2px #9e9e9e;

  display: flex;

  align-items: center;
  justify-content: center;

  background-color: #F7F7F9;

  &:disabled {
    background-color: #DBDBDD;
  }

  &:not([disabled]):hover {
    background-color: #eeeeee;
  }
`;

const StageContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 100%;
  gap: 10px;
`;

export default App