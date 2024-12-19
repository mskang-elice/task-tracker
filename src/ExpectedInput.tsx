import styled from "styled-components";

interface Props {
  value: Date | undefined;
  setValue: (date: Date | undefined) => void;
}

function ExpectedInput({ value, setValue }: Props) {
  return (
    <DateInput
      type="date"
      value={value?.toISOString().slice(0, 10)}
      onChange={(e) => setValue(new Date(e.target.value))}
    />
  );
}

const DateInput = styled.input`
  width: 20px;
  height: 20px;
`;

export default ExpectedInput;

// import { useState } from "react";
// import styled from "styled-components";

// interface Props {
//   value: Date | undefined;
//   setValue: (date: Date | undefined) => void;
// }

// function ExpectedInput({ value, setValue }: Props) {
//   // 예상 일자 입력
//   const [displayText, setDisplayText] = useState<string>(date2text(value));

//   const applyDateToText = (date: Date | undefined) => {
//     setDisplayText(date2text(date));
//   };

//   const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDisplayText(e.target.value);
//     const date = new Date(e.target.value);
//     if (isNaN(date.getTime())) {
//       return;
//     }

//     if (date.getFullYear() !== new Date('1/1').getFullYear()) {
//       return;
//     }

//     date.setFullYear(new Date().getFullYear());
//     // 무조건 미래 시점으로 설정
//     if (date.getTime() < new Date().getTime()) {
//       date.setFullYear(new Date().getFullYear() + 1);
//     }
//     setValue(date);
//   };


//   const onTextBlur = () => {
//     applyDateToText(value);
//   };

//   const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const date = new Date(e.target.value);
//     setValue(date);
//     applyDateToText(date);
//   };

//   return (
//     <Container>
//       <TextInput type="text" value={displayText} onChange={onTextChange} onBlur={onTextBlur} />
//       <DateInput type="date" value={value?.toISOString().slice(0, 10)} onChange={onDateChange} />
//     </Container>
//   );
// }

// const date2text = (date: Date | undefined) => {
//   return date ? `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}` : '';
// };

// const Container = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
// `;

// const TextInput = styled.input`
//   width: 60px;
//   height: 20px;
// `;

// const DateInput = styled.input`
//   width: 20px;
//   height: 20px;
// `;

// export default ExpectedInput;