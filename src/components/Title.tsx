import React from 'react';
import TitleParagraph from '../styledComponent/styledP/TitleParagraph';

function Title({
  step,
  margin,
}: {
  step: number;
  margin: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}): JSX.Element {
  const contextList = [
    '위치를 통해 내 주변의 모임을 찾아봐요!',
    '팀원들이 되는 최적 시간에 함께 만나요!',
    '소통을 통해 진짜 크루가 되어봐요!',
  ];
  return (
    <TitleParagraph
      style={{
        marginTop: `${margin.top}px`,
        marginBottom: `${margin.bottom}px`,
        marginLeft: `${margin.left}px`,
        marginRight: `${margin.right}px`,
      }}
    >
      {contextList[step - 1]}
    </TitleParagraph>
  );
}

export default Title;
