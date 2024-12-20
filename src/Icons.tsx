import addIcon from './assets/add.svg';
import menuIcon from './assets/menu.svg';
import moreIcon from './assets/more.svg';
import removeIcon from './assets/remove.svg';
import stepIcon from './assets/step.svg';
import trashIcon from './assets/trash.svg';

export const AddIcon = () => {
  return (
    <img src={addIcon} alt="add" />
  );
}

export const MenuIcon = () => {
  return (
    <img src={menuIcon} alt="menu" />
  );
}

export const RemoveIcon = () => {
  return (
    <img src={removeIcon} alt="remove" />
  );
}

export const MoreIcon = () => {
  return (
    <img src={moreIcon} alt="more" />
  );
}

export const StepIcon = () => {
  return (
    <img src={stepIcon} alt="step" />
  );
}

export const TrashIcon = () => {
  return (
    <img src={trashIcon} alt="trash" />
  );
}
