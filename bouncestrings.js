'use strict';

// bouncing-string의 bouncestring.js와 구조가 거의 유사함.
// 해당 파일에서 정리한 내용 참고할 것.
// 필기는 일단 코딩을 어느 정도 해놓고, 어떤 좌표값을 어떻게 가져와서 실행할 지 모르니까
// 내일 한번에 정리해버리자. 지난번에 했던거랑 거의 똑같에서 복붙하고 약간 수정만 해주면 될 듯.

import {
  lineCircle
} from './utils.js';

const BOUNCE = 0.92; // 감쇠진동 공식에서 사용할 마찰력값

export class BounceString {
  constructor(pos) {
    // 각 수직 string들의 시작점과 끝점 정가운데의 좌표값을 계산함
    const middleX = (pos.x2 - pos.x1) / 2 + pos.x1;
    const middleY = (pos.y2 - pos.y1) / 2 + pos.y1;

    this.points = [{
        x: pos.x1,
        y: pos.y1,
        ox: pos.x1,
        oy: pos.y1,
        vx: 0,
        vy: 0,
      },
      {
        x: middleX,
        y: middleY,
        ox: middleX,
        oy: middleY,
        vx: 0,
        vy: 0,
      },
      {
        x: pos.x2,
        y: pos.y2,
        ox: pos.x2,
        oy: pos.y2,
        vx: 0,
        vy: 0,
      }
    ];
    /**
     * 여기서 기억해야 할 부분
     * 
     * visual.js에서 pos객체로 넘겨받은 값들을 this.points 배열안의 객체들에 할당해주고, 
     * middleX,Y에서 계산해준 결과값에 따르면,
     * 
     * 각 수직 string의 시작점(파란색): (this.points[0].x, this.points[0].y)
     * 각 수직 string의 끝점(빨간색): (this.point[2].x, this.points[2].y)
     * 각 수직 string의 시작점과 끝점의 가운데점: (middleX, middleY)
     */

    this.detect = 10;

    this.savedRgb = 0x000000; // string의 초기 색상값 black
    this.rgb = 0x000000; // 매 프레임마다 바뀔 수 있는 string의 현재 색상값
  }

  animate(ctx, moveX, moveY) {
    /*
    얘내들은 각 string의 시작점, 끝점, 마우스 지점을 표시하려고 임시로 작성해둔 것
    나중에 다 제거해줄거임.
    
    // 마우스가 움직인 지점을 초록색으로 렌더함
    ctx.beginPath();
    ctx.fillStyle = '#00ff00';
    ctx.arc(moveX, moveY, 6, 0, Math.PI * 2);
    ctx.fill();

    // 각 수직 string의 시작점을 파란색으로 렌더함
    ctx.beginPath();
    ctx.fillStyle = '#0000ff';
    ctx.arc(this.points[0].x, this.points[0].y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 각 수직 string의 끝점을 빨간색으로 렌더함
    ctx.beginPath();
    ctx.fillStyle = '#ff0000';
    ctx.arc(this.points[2].x, this.points[2].y, 6, 0, Math.PI * 2);
    ctx.fill();
    */

    // 감속운동 알고리즘을 사용함.
    // this.rgb가 어떤 이벤트가 발생함으로써 다른 색상값이 할당되면
    // 그 색상값에서 초기 색상값으로 서서히 돌아오게 될거임.
    // 현재값 += (목표값 - 현재값) * 속도값
    this.rgb += (this.savedRgb - this.rgb) * 0.12;

    /**
     * 비트 연산자를 이용한 '16진수 색상값 -> 10진수 rgb()값' 변환 공식
     * (typo3의 particle.js에서 한번 사용했음)
     * 
     * 현재 프레임의 this.rgb값인 16진수 색상값을 이진 연산을 해줘서
     * r, g, b에 해당하는 값을 0 ~ 255 사이의 10진수로 결과값을 할당받음.
     * 참고로 0xFF는 10진수로 표현하면 255에 해당함. (각 rgb값들의 가장 큰 값에 해당하지?)
     * 255를 2진수로 표현하면 11111111에 해당함.
     */
    const red = (this.rgb >> 16) & 0xFF | 0;
    const green = (this.rgb >> 8) & 0xFF | 0;
    const blue = (this.rgb & 0xFF) | 0;
    const color = `rgb(${red}, ${green}, ${blue})`;
    ctx.strokeStyle = color; // 앞으로 그리게 될 quadratic curve의 컬러값으로 지정해 줌

    // 여기서부터 quadratic curve을 그려주기 시작하는거임
    ctx.beginPath();

    // lineCircle의 parameter에 수직 string의 시작점과 끝점, 마우스가 움직인 좌표값, detect값을 넣고 호출해서
    // return받은 값이 true면 if block을 수행하고 아니면 else block을 수행함.
    if (lineCircle(
        this.points[0].x,
        this.points[0].y,
        this.points[2].x,
        this.points[2].y,
        moveX,
        moveY,
        this.detect
      )) {
      // if block은 마우스가 움직인 지점과 수선점 사이의 거리가 100보다 작을 때까지, 
      // 즉 string을 x축 방향으로 100만큼 당길때까지 수행됨. 
      // 왜냐? 당기기 시작한 순간에는 10(this.detect)보다 거리가 작을테니 
      // 바로 if block 수행되서 this.detect가 100으로 override되고, 
      // 이후부터는 100이 될때까지는 계속 if block을 수행할 수 있게 되겠지
      // 아래의 내용들이 string을 x축 방향으로 100만큼 당길때까지 수행하는 작업들임
      this.rgb = 0xf3316e; // 당기는 순간 string 색깔이 이거로 바뀌고, 당긴걸 놓기 전까지는 계속 이 색상값이 override 되서 유지될거임
      this.detect = 100; // 마찬가지로 this.detect는 당길때까지는 계속 100이고
      let tx = moveX; // string 가운데점이 따라가야 할 target지점의 x좌표값에 마우스 x좌표값을 할당
      let ty = (this.points[1].oy + moveY) / 2; // 여기도 target지점의 y좌표값. 마우스의 y좌표값보단 살짝 물러서서 따라감
      this.points[1].vx = tx - this.points[1].x;
      this.points[1].vy = ty - this.points[1].y;
      // '변화량 += (목표값 - 현재값)'으로 가운데점에 더해줄 변화량을 구함.
      // 목표값은 마우스 지점에서 살짝 물러난 지점, 현재값은 가운데점의 현재 지점.
    } else {
      // else block은 마우스가 움직인 지점과 수선점 사이의 거리가 100을 넘어선 순간,
      // lineCircle이 false를 리턴함으로써 수행됨.
      // 전체적으로 string의 가운데 지점이 원래 자리로 돌아가는 움직임이 계산됨
      // 참고로 else block에서는 this.rgb가 더이상 0xf3316e로 override되지 않고 있으니
      // 위의 this.rgb += (this.savedRgb - this.rgb) * 0.12; 공식에 따라 초기의 this.rgb값인 0x000000으로 서서히 돌아가겠지?
      this.detect = 10; // 10으로 초기화해서 이후에 언제든 if block을 다시 수행할 수 있게 해줌
      let tx = this.points[1].ox;
      let ty = this.points[1].oy; // 목표 좌표값을 가운데점의 초기값으로 할당함
      this.points[1].vx += tx - this.points[1].x;
      this.points[1].vx *= BOUNCE;
      this.points[1].vy += ty - this.points[1].y;
      this.points[1].vy *= BOUNCE;
      // 감쇠 진동 공식 상에서 '변화량 += (목표값 - 현재값) * 속도값', '변화량 *= 마찰력'에 해당하지?
      // 목표값은 가운데점의 초기좌표값, 현재값은 가운데점의 현재 지점, 속도값은 1, 마찰력은 BOUNCE
      // if block에서 마우스 따라갈때는 그냥 움직이지만, 초기 지점으로 돌아올때는 감쇠 진동 운동을 하겠군.
    }

    // 감쇠 진동 공식 상에서 '현재값 += 변화량'에 해당함.
    // vx, vy값이 if block에서 온거면 마우스 지점을 따라 string의 가운데점이 움직일테고,
    // else block에서 온거면 string의 가운데점이 감쇠진동을 하며 초기의 가운데점으로 돌아갈거임
    // 그래서 마우스를 따라갈때는 그냥 매 프레임마다 변화량만큼 움직이지만
    // 초기의 자리로 돌아올때는 가운데점이 고무줄처럼 왔다갔다 하다가 제자리로 돌아옴 -> 이게 감쇠진동 운동!
    this.points[1].x += this.points[1].vx;
    this.points[1].y += this.points[1].vy;

    // 위에서 매 프레임마다 계산해준 현재 string의 가운데점 좌표값을 가져와서 
    // 매 프레임마다 새로운 quadratic curve를 그려줄거임.

    // 먼저 첫번째 이전좌표값을 string의 시작점으로 할당함.
    let prevX = this.points[0].x;
    let prevY = this.points[0].y;

    // quadratic curve의 start point를 string의 시작점으로 지정함.
    ctx.moveTo(prevX, prevY);

    // 이미 start point는 string의 시작점으로 할당해놨기 때문에 let i = 1로 시작함. 
    // this.points.length = 3이므로 for loop는 2번 돌면서 string의 가운데점과 끝점을 현재좌표값 삼아 계산하겠지
    for (let i = 1; i < this.points.length; i++) {
      // 항상 quadratic curve를 그릴려면 이전좌표값과 현재좌표값의 중간좌표값을 구해놔야 함
      const cx = (prevX + this.points[i].x) / 2;
      const cy = (prevY + this.points[i].y) / 2;

      // quadraticCurveTo에는 항상 이전 좌표값과 중간 좌표값을 전달해줘야 곡선이 그려짐
      // quadraticCurveTo에 관해서는 여러번 정리했으므로 이전에 공부한 내용들 참고할 것.
      ctx.quadraticCurveTo(prevX, prevY, cx, cy);

      // 이전좌표값은 항상 현재좌표값으로 override 해줘야 하고..
      prevX = this.points[i].x;
      prevY = this.points[i].y;
    }

    // for loop를 다 돌고 나서 두번째 quadratic curve의 end point(string 가운데점과 끝점의 정가운데 지점)를
    // string 끝점까지 이어줌.
    ctx.lineTo(prevX, prevY);
    ctx.stroke(); // quadratic curve를 색칠함
  }
}