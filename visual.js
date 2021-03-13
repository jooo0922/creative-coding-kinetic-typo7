'use strict';

// 이전에 했던 것들처럼 visual.js에서 Text, BounceString 인스턴스를 생성해줄거임.
// 다만 이전에는 Particle 인스턴스를 생성해줬다면 여기서는 BounceString으로 대체된 것.
import {
  Text
} from './text.js';

import {
  BounceString
} from './bouncestrings.js';

export class Visual {
  constructor() {
    this.text = new Text(); // Text 인스턴스를 생성해 임시 캔버스를 만듦

    this.strings = []; // 색상값이 존재하는 픽셀의 좌표값들을 이용해서 만든 BounceString 인스턴스를 담아놓을 빈 배열?

    // 마우스가 움직인 좌표값과 마우스 주변을 둘러싼 반경(영역)의 반지름값을 저장함
    this.mouse = {
      x: 0,
      y: 0,
      radius: 100,
    };

    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  show(stageWidth, stageHeight) {
    // 리사이징 이벤트가 발생할 때마다 리사이즈된 브라우저 사이즈를 가져온 뒤
    // 해당 사이즈에 맞게 텍스트 위치를 조정하여 임시 캔버스에 렌더해주고,
    // 색상값이 존재하는 픽셀들의 좌표값 배열,
    // 알파벳 전체의 minX, maxX, minY, maxY값,
    // 각각의 tx값과 그에 해당하는 minY(파란색), maxY(빨간색)값이 묶여서 저장된 outline 좌표값들을 구하여 return해줌.
    this.pos = this.text.setText('M', 5, stageWidth, stageHeight);

    this.strings = []; // for loop에서 생성한 BounceString 인스턴스를 저장해두는 배열

    // 넘겨받은 outline좌표값들의 개수만큼 for loop를 돌리면서 BounceString 인스턴스를 생성해 줌
    for (let i = 0; i < this.pos.outline.length; i++) {
      // (x1, y1)은 각 outline 좌표값의 (tx, minY)가 할당됨. 각 string의 시작점(파란색)
      // (x2, y2)은 각 outline 좌표값의 (tx, maxY)가 할당됨. 각 string의 끝점(빨간색)
      this.strings[i] = new BounceString({
        x1: this.pos.outline[i].x,
        y1: this.pos.outline[i].minY,
        x2: this.pos.outline[i].x,
        y2: this.pos.outline[i].maxY,
      });
    }
  }

  // this.strings에 담긴 모든 BounceString 인스턴스에 존재하는 animate 메소드를 
  // 현재 마우스가 움직인 좌표값을 전달하면서 호출시킴.
  animate(ctx) {
    for (let i = 0; i < this.strings.length; i++) {
      this.strings[i].animate(ctx, this.mouse.x, this.mouse.y);
    }
  }

  // 마우스가 움직일 때마다 좌표값을 this.mouse.x,y에 각각 override해줌.
  onMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}