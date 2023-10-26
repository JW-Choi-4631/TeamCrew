import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import useMarkerClustering from '../../util/useMarkerClustering';

import FindCrewView from './FindCrewView';
import { navermap } from '../../api';
import type { Spot } from '../../assets/interfaces';
import Loading from '../../components/common/Loading';

function FindCrew(): JSX.Element {
  // 위치 정보 로딩 여부
  const [isGetMyLocation, setIsGetMyLocation] = useState<boolean>(false);

  // 내 위치 가져오기
  const [myLatLng] = useState<{ lat: number; lng: number }>(() => {
    // 1. 내 위치 가져오기
    const latlng = { lat: 0, lng: 0 };
    navigator.geolocation.getCurrentPosition(position => {
      latlng.lat = position.coords.latitude;
      latlng.lng = position.coords.longitude;
      // 2. loading 완료
      setIsGetMyLocation(true);
    });
    return latlng;
  });

  // 크루 리스트
  const [list, setList] = useState<Spot[]>([]);

  // 카테고리 모달 표시 여부
  const [categoryOpen, setCategoryOpen] = useState<boolean>(false);

  // 선택된 카테고리 캐싱
  const [category, setCategory] = useState<string>('관심사');

  // 맵 객체
  const [map, setMap] = useState<naver.maps.Map | null>(null);

  // 맵이 표시될 HTMLElement
  const mapDiv = useRef(null);

  // 마커클러스터링 객체
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newCluster = useRef<any>(null);

  // 이벤트 제거를 위한 listener
  const listener = useRef<any>(null);

  const {
    data: crewList,
    isError,
    isLoading,
    refetch,
  } = useQuery('getMapCrewList', navermap.findcrew, {
    onSuccess: res => {
      console.log('맵 전체 크루 리스트 = ', res);
    },
    refetchOnWindowFocus: false,
  });

  // 카테고리 선택 모달 열기
  const categorySelectOpen = (): void => {
    setCategoryOpen(true);
  };

  // 카테고리 선택 모달 닫기
  const categorySelectClose = (): void => {
    setCategoryOpen(false);
  };

  // 카테고리 선택
  const selectCategory = (input: string): void => {
    let selectedCategory = input;
    if (input.includes('%2F')) {
      selectedCategory = input.replace('%2F', '/');
    }
    setCategory(selectedCategory);
    setList(crewList!.filter(spot => spot.crew_category === selectedCategory));
    setCategoryOpen(false);
  };

  // 3. loading 완료 -> 네이버 맵 설정
  useEffect(() => {
    if (isGetMyLocation) {
      // console.log('loading complete');
      // type Guard
      if (mapDiv.current === null) return;
      setMap(
        new window.naver.maps.Map(mapDiv.current, {
          center: new window.naver.maps.LatLng(myLatLng.lat, myLatLng.lng),
          zoom: 14,
          maxZoom: 14,
          scaleControl: false,
        }),
      );
    }
  }, [isGetMyLocation]);

  /* 4. 맵 설정 -> 네이버 맵에 이벤트 등록
              -> 클러스터 생성        */
  useEffect(() => {
    // console.log(spots.current, map, category);
    // category 설정에 따른 data 값 변경
    if (!isLoading && !isError) {
      const data = category === '관심사' ? crewList! : crewList!.filter(spot => spot.crew_category === category);

      if (map !== null) {
        let currentBound = map.getBounds();
        setList(
          data.filter(spot => currentBound.hasPoint(new naver.maps.LatLng(spot.crew_latitude, spot.crew_longtitude))),
        );

        // 네이버 이벤트 1 : 드래그 완료 시
        listener.current = naver.maps.Event.addListener(map, 'dragend', async () => {
          currentBound = map.getBounds();
          // console.log('dragend');
          const { data: newData } = await refetch();
          if (newData !== undefined) {
            setList(
              newData.filter(spot =>
                currentBound.hasPoint(new naver.maps.LatLng(spot.crew_latitude, spot.crew_longtitude)),
              ),
            );
          }
        });

        // 네이버 이벤트 2 : 줌 레벨 변경 시
        naver.maps.Event.addListener(map, 'zoom_changed', () => {
          currentBound = map.getBounds();
          // console.log('zoomchanged');
          setList(
            data.filter(spot => currentBound.hasPoint(new naver.maps.LatLng(spot.crew_latitude, spot.crew_longtitude))),
          );
        });

        // 클러스터 설정
        if (newCluster.current === null) {
          // console.log('create cluster', data);
          newCluster.current = useMarkerClustering(data, map);
        } else {
          // console.log('change cluster', data);
          newCluster.current.setMap(null);
          newCluster.current = useMarkerClustering(data, map);
        }
      }
    }
    // 카테고리 변경 시 현재 이벤트 제거 후 새로 등록을 위한 clean up
    return () => {
      if (map !== null) {
        if (naver.maps.Event.hasListener(map, 'dragend')) {
          naver.maps.Event.removeListener(listener.current);
        }
        if (naver.maps.Event.hasListener(map, 'zoom_changed')) {
          naver.maps.Event.clearListeners(map, 'zoom_changed');
        }
      }
    };
  }, [map, category]);

  if (isLoading || !isGetMyLocation) {
    return <Loading />;
  }

  return (
    <FindCrewView
      loading={isGetMyLocation}
      categoryOpen={categoryOpen}
      category={category}
      categorySelectClose={categorySelectClose}
      categorySelectOpen={categorySelectOpen}
      selectCategory={selectCategory}
      mapDiv={mapDiv}
      list={list}
    />
  );
}

export default FindCrew;
