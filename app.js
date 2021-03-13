'use strict';

// 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
// 나중에 실제 캔버스에 렌더할 때는 지워줄거임.
/*
import {
  Text
} from './text.js';
*/

import {
  Visual
} from './visual.js';

class App {
  constructor() {
    // 여기에는 BounceString들을 실제로 렌더해서 화면에 보여줄거임
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // 현재 모니터가 레티나를 지원할 정도가 되면 2, 아니면 1을 리턴해줌
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    // 윈도우가 로드되면 Web Font Loader Library에서 원하는 폰트를 로드해옴
    WebFont.load({
      google: {
        families: ['Hind:700']
      },
      fontactive: () => { // 폰트가 로드되서 렌더될 때 각각의 폰트에 대해 콜백을 수행하는 이벤트
        // 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
        // 실제 캔버스에 렌더할 때는 지워줄거임.
        /*
        this.text = new Text();
        this.pos = this.text.setText(
          'A',
          2,
          document.body.clientWidth,
          document.body.clientHeight,
        );
        */

        // Web Font를 로드 받아서 렌더하면 Visual 인스턴스를 생성한 뒤
        this.visual = new Visual();

        // 브라우저에 리사이징 이벤트를 걸고, this.resize 메소드를 호출하고,
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        // this.animate()를 requestAnimationFrame으로 호출해 줌.
        requestAnimationFrame(this.animate.bind(this));
      }
    });
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;

    /**
     * 이거는 한마디로 canvas의 css 사이즈를 this.stageWidth,Height로,
     * 즉, body element의 clientWidth,Height로 할당하는 것임.
     * 
     * 이렇게 해도 되고, style.css에서 
     * canvas {
     *   width: 100%;
     *   height: 100%;
     * }
     * 이렇게 해도 사실상 똑같은거임. 얘도 어쨋거나 body의 width, height의 100%로 잡아주는 거니까.
     * 
     * 사실 엄밀하게 말하면 조금 틀리긴 함.
     * css width, height값은 
     * box-sizing값이 css표준이 정의하는 초기 기본값이라면 
     * 박스모델 상에서 content 영역의 width, height값만 정의해주고,
     * 
     * element.clientWidth,Height값은 
     * 박스모델 상에서 content영역과 padding영역을 포함한 width, height값을 정의해주기 때문.
     * 
     * 그러나 kinetic typo 만들때는 항상 전체 요소의 padding을 0으로 초기화해주기 때문에
     * css width,height으로 지정해준 값이나, clientWidth,Height으로 지정해준 값이나 사실상 같다고 한 것.
     */
    this.canvas.style.width = this.stageWidth + 'px';
    this.canvas.style.height = this.stageHeight + 'px';
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // 실제 string들이 렌더될 canvas에 그려지는 모든 line들의 스타일을 resize 메소드에서 지정해줌.
    this.ctx.lineCap = 'round'; // line들의 끝 모양을 지정해 줌.
    this.ctx.lineWidth = 4; // line들의 선 굵기를 지정해 줌.

    // 리사이징 이벤트가 발생할 때마다 변경된 브라우저 사이즈값을 전달하면서
    // this.visual.show()메소드를 호출하여 변경된 브라우저 사이즈에 맞게 위치를 재조정하여
    // 임시 캔버스에 커다란 텍스트를 렌더해 줌.
    this.visual.show(this.stageWidth, this.stageHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); // 내부에서 스스로를 호출해서 반복할 수 있도록 해줌

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 매 프레임마다 실제 캔버스를 한번씩 지워주고 다시 그려줌

    this.visual.animate(this.ctx);
  }
}

window.onload = () => {
  new App();
};