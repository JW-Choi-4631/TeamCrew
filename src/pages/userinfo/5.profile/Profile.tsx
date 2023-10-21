import React, { useState, useRef } from 'react';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';
import ProgressBar from '../../../components/common/ProgressBar';
import icons from '../../../assets/icons';
import BodySmallMedium from '../../../styledComponent/heading/BodySmallMedium';
import colors from '../../../assets/styles/color';
import defaultImage from '../../../assets/images/profile.jpg';
import TitleLargeBold from '../../../styledComponent/heading/TitleLargeBold';
import GoPageBtn from '../components/GoPageBtn';

import useResizeImage from '../../../util/useResizeImage';

const StyledP = styled.p`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: -0.4px;
  color: ${colors.gray400};
  cursor: pointer;
`;

const ImageDiv = styled.div`
  width: 51%;
  aspect-ratio: 1;
  margin-top: 15.45%;
  border-radius: 50%;
`;

function Profile(): JSX.Element {
  const [profileURL, setProfileURL] = useState<string>(defaultImage);
  const [isProfileSet, setIsProfileSet] = useState<boolean>(false);

  const sendImageForServer = useRef<Blob | null>(null);

  // file에서 부터 url 추출
  const readURL = (file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log(reader.result);
      if (reader.result === null) return;
      if (typeof reader.result === 'string') {
        setProfileURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 이미지 변환 시 작동하는 함수
  const changeProfile = (): void => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    fileInput.addEventListener('change', async () => {
      if (fileInput.files === null) return;
      const file = await useResizeImage(fileInput.files[0]);
      readURL(file);
      console.log('Blob파일 = ', file);
      sendImageForServer.current = file;
      setIsProfileSet(true);
    });
    fileInput.click();
  };

  const saveProfile = (): void => {
    sessionStorage.setItem('profile', profileURL);
  };

  return (
    <>
      <header>
        <ProgressBar step={4} totalSteps={7} />
      </header>
      <main id="userinfo-main">
        <section style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: 'fit-content' }}>
          <Link to="/login/gender">
            <icons.chevronLeft style={{ cursor: 'pointer' }} />
          </Link>
          {!isProfileSet && (
            <Link onClick={saveProfile} to="/login/introduction" style={{ textDecoration: 'none' }}>
              <StyledP>건너뛰기</StyledP>
            </Link>
          )}
        </section>
        <section>
          <TitleLargeBold>{!isProfileSet ? '프로필 사진' : '프로필 미리보기'}</TitleLargeBold>
          <BodySmallMedium style={{ color: `${colors.gray700}` }}>
            {!isProfileSet
              ? '나만의 개성과 취향이 잘 드러나는 사진을 등록해주세요'
              : '다른 친구들이 내 프로필을 클릭했을 때 보게될 프로필입니다'}
          </BodySmallMedium>
        </section>
        <section
          style={{ display: 'flex', width: '100%', height: '27.09%', justifyContent: 'center', marginTop: '4.93%' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              aspectRatio: '1',
              backgroundColor: `${colors.primary100}`,
              borderRadius: '12px',
            }}
          >
            <ImageDiv onClick={changeProfile}>
              <img src={profileURL} alt="profile" width="100%" height="100%" style={{ borderRadius: '50%' }} />
            </ImageDiv>
            <div style={{ marginTop: '11.36%' }}>
              <TitleLargeBold>김크루</TitleLargeBold>
            </div>
          </div>
        </section>
        <GoPageBtn
          judge={isProfileSet}
          path="/login/introduction"
          prevTitle="라이브러리에서 선택"
          prevColor=""
          prevFontColor=""
          prevAction={changeProfile}
          action={saveProfile}
        />
      </main>
    </>
  );
}

export default Profile;
