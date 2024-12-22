import styled from "styled-components";

const Input = styled.input`
  width: auto;
  height: 18px;

  border-radius: 9px;
  padding-left: 5px;

  margin: 6px;

  border: none;
  background-color: #F8FAFB;

  box-shadow: inset 0 0 2px #989899;

  &:hover {
    background-color: #ffffff;
  }

  &:focus {
    /* border: solid 2px #535353; */
    background-color: #ffffff;
  }
`;

export default Input;