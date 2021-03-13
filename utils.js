'use strict';

// bouncing-string의 utils.js에서 사용했던 함수들이 비슷하게 활용될 것임.
// 해당 파일에서 정리해놓은 부분들 참고할 것.

// 두 점 (x1, y1)과 (x2, y2) 사이의 거리값을 리턴해주는 함수
export function distance(x1, y1, x2, y2) {
  const x = x2 - x1;
  const y = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

// 두 점 (px, py)와 (cx, cy) 사이의 거리값이 
// r보다 같거나 작으면 true를, r보다 크면 false를 리턴해주는 함수.
export function pointCircle(px, py, cx, cy, r) {
  if (distance(px, py, cx, cy) <= r) {
    return true;
  } else {
    return false;
  }
}

// 이거는 처음 보는 함수인 것 같은데? 어디에 쓰이는걸까?
export function linePoint(x1, y1, x2, y2, px, py) {
  const dist1 = distance(px, py, x1, y1); // 수선점에서 string 시작점 까지의 거리
  const dist2 = distance(px, py, x2, y2); // 수선점에서 string 끝점 까지의 거리
  const dist = dist1 + dist2;
  const lineLength = distance(x1, y1, x2, y2); // string의 길이
  const buffer = 0.1;

  // dist1, dist2가 분절되서 'lineLength - 0.1 <= dist <= lineLength + 0.1'을 벗어나면 false,
  // 분절이 발생해도 일정 범위 이내에 존재하면 true
  if (dist >= lineLength - buffer && dist <= lineLength + buffer) {
    return true;
  } else {
    return false;
  }

  // (x1, y1), (x2, y2), (px, py)가 각각 어떤 점인지 알면 dist와 lineLength가 어떻게 다른지
  // 대충 알 수 있을텐데 아직은 각각의 좌표가 어느 지점을 의미하는지 알 수 없으니
  // 코딩을 좀 더 진행하고 나서 정리해봐야 할 듯.
}

// bouncing-string의 utils.js에서 사용된 벡터의 내적을 이용해서 정사영 벡터를 구하고, 
// 그 값으로 px, py좌표값을 구하는 함수와 거의 유사함. 자세한 정리는 해당 파일 참고
// BounceString의 animate 메소드에서 이 함수를 호출할 때
// x1, y1에는 수직 string의 시작점
// x2, y2에는 수직 string의 끝점
// cx, cy에는 마우스가 현재 움직인 좌표값
// r에는 BounceString의 생성자에서 지정된 this.detect(= 10)값을 전달함.
export function lineCircle(x1, y1, x2, y2, cx, cy, r) {
  const lineLength = distance(x1, y1, x2, y2); // 각 string의 길이를 구하고

  // (cx, cy)와 (x1, y1)을 연결한 벡터와 string 벡터를 내적함으로써,
  // string 벡터에 곱해서 정사영 벡터 성분을 얻기 위한 상수값 point를 계산한 것. 자세한 내용은 필기 참고
  const point = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(lineLength, 2);

  // string 벡터 상의 정사영 벡터의 성분값 x1, y1에 각각 더함으로써,
  // (cx, cy)에서 string에 수선으로 내렸을 때 교차하는 지점의 좌표값 (px, py)를 구함
  const px = x1 + (point * (x2 - x1));
  const py = y1 + (point * (y2 - y1));

  // 여기가 약간 이전과 다른 부분인데, string의 시작점, 끝점, 수선점을 parameter로 전달하는데, 이 때
  // 수선점을 기준으로 string이 분절되면 false를 할당받아서 false를 리턴해주고 함수를 벗어남.
  // 분절이 안되거나 거의 일정 범위 이내에 존재하면 다음 if block으로 넘어감
  // 참고로 false를 리턴하면 string의 가운데점이 원래 위치로 돌아가고,
  // true를 리턴하면 string의 가운데점이 마우스 움직임을 약간 물러선 상태에서 따라감
  const onSegment = linePoint(x1, y1, x2, y2, px, py);
  if (!onSegment) return false;

  // 마우스가 움직인 지점에서 초기의 수선점까지의 거리가 this.detect보다 작으면 true, 크면 false를 리턴함.
  if (distance(px, py, cx, cy) < r) {
    return true;
  } else {
    return false;
  }
}