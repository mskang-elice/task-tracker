import styled from "styled-components";

import Stage from "./Stage";
import useStore, { SortType } from "./useStore";
import { initLocalStorage, resetLocalStorage } from "./initLocalStorage"; // DEBUG
import { useState } from "react";

function App() {
  const stageIds = [0, 1, 2, 3, 4]
  const store = useStore();
  const [movedTaskId, setMovedTaskId] = useState<number | undefined>(undefined);

  const sortOptions = stageIds.map(() => {
    const [sortType, setSortType] = useState(SortType.createdAt);
    const [isAscending, setIsAscending] = useState(false);
    return { sortType, setSortType, isAscending, setIsAscending };
  });

  return (
    <Container>
      <ToolBarContainer>
        <UndoButton disabled={!store.undoable} onClick={store.undo}>undo</UndoButton>
        <RedoButton disabled={!store.redoable} onClick={store.redo}>redo</RedoButton>
        <button onClick={() => initLocalStorage()}>DEBUG: set init data</button>
        <button onClick={() => resetLocalStorage()}>DEBUG: reset data</button>
      </ToolBarContainer>
      <StageContainer>
        {stageIds.map((stageId) => (
          <Stage
          key={stageId}
          stageId={stageId}
          sortType={sortOptions[stageId].sortType}
          isAscending={sortOptions[stageId].isAscending}
          setSortType={sortOptions[stageId].setSortType}
          setIsAscending={sortOptions[stageId].setIsAscending}
          movedTaskId={movedTaskId}
          setMovedTaskId={setMovedTaskId}
          tasks={store.data.tasks.filter((task) => task.status === stageId)}
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
  justify-content: flex-end;
  gap: 10px;
`;

const UndoButton = styled.button`
  width: 100px;
  height: 100%;
`;

const RedoButton = styled.button`
  width: 100px;
  height: 100%;
`;

const StageContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  /* grid-template-columns: 20vw 20vw 20vw 20vw 20vw; */
  grid-template-rows: 100%;
  gap: 10px;
`;

export default App