'use strict';

// getOutline 메소드에서 사용하려고 가져온 util 함수
import {
  pointCircle
} from './utils.js';

export class Text {
  constructor() {
    // 임시 캔버스를 만들어 줌.
    this.canvas = document.createElement('canvas');
    // this.canvas.style.position = 'absolute';
    // this.canvas.style.left = '0';
    // this.canvas.style.top = '0';
    // document.body.appendChild(this.canvas);
    // 텍스트가 어느 위치에 어떻게 렌더되는지 보여주려고 임시로 DOM에 추가해서 보여줌.
    // 나중에 실제 캔버스에 렌더할때는 그냥 지워줄 예정.

    this.ctx = this.canvas.getContext('2d');
  }

  // 리사이징될 때마다 변경된 사이즈를 가져와서 임시 캔버스에 텍스트를 새롭게 렌더해주고
  // 색상값이 존재하는 픽셀들의 좌표값 배열을 return 해주는 메소드
  setText(str, density, stageWidth, stageHeight) {
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    // 폰트 크기, 렌더해 줄 텍스트를 지정하고, Web Font Loader에서 가져온 폰트 굵기 및 폰트를 지정함.
    const myText = str;
    const fontWidth = 700;
    const fontSize = 800; // 폰트 크기를 800px로 지정. 실제 폰트 높이와는 다름.(폰트 크기가 더 큼)
    const fontName = 'Hind';

    // 리사이징 이전에 임시 캔버스에 남아있는 텍스트 싹 한번 지워주고 다시 새로운 위치에 렌더하려는 것
    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    this.ctx.font = `${fontWidth} ${fontSize}px ${fontName}`; // 렌더할 텍스트 스타일 지정. css font 프로퍼티와 동일 구문
    this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`; // 투명도 0.3 black으로 텍스트 렌더
    this.ctx.textBaseline = `middle`; // textBaseline은 고정. 텍스트 높낮이만 이동

    // 위에서 지정한대로 myText 안의 텍스트를 임시캔버스에 렌더한다고 가정했을 때, 이에 관한 데이터가 담긴 TextMetrics 객체 리턴.
    const fontPos = this.ctx.measureText(myText);

    // TextMetrics 객체안의 값들을 이용해서 텍스트 x, y 좌표값 잡아줌
    this.ctx.fillText(
      myText,
      (stageWidth - fontPos.width) / 2, // 렌더할 텍스트의 x좌표값
      fontPos.actualBoundingBoxAscent +
      fontPos.actualBoundingBoxDescent +
      ((stageHeight - fontSize) / 2) // 렌더할 텍스트의 y좌표값
    );

    // 현재 텍스트가 렌더된 임시 캔버스에서 색상값을 가지는 픽셀들의 좌표값 배열을 리턴받는 메소드를 호출함.
    return this.dotPos(density, stageWidth, stageHeight);
  }

  dotPos(density, stageWidth, stageHeight) {
    // 임시 캔버스에 존재하는 모든 픽셀들의 색상데이터 배열을 가져와서 복사함
    const imageData = this.ctx.getImageData(
      0, 0,
      stageWidth, stageHeight
    ).data;

    const particles = []; // 색상값이 존재하는 픽셀들의 좌표값 객체를 담아놓을 곳.
    let i = 0;
    let width = 0;
    let pixel;

    // 모든 픽셀을 다 돌기 어려우니까 density 단위로 돌게 해줌.
    for (let height = 0; height < stageHeight; height += density) {
      ++i;
      const slide = (i % 2) == 0;
      width = 0;
      if (slide == 1) {
        width += 6;
      }
      // i가 홀수면 width는 0, i가 짝수면 width는 6으로 안쪽 for loop를 시작함.
      // 그래서 width값이 0과 6으로 번갈아가면서 for loop를 돌려줌.
      // 사실 width를 항상 0으로 시작해도 결과가 별 차이없이 잘 작동함.
      // 아무래도 성능이나 최적화 이슈 때문에 해준 것 같음.
      // 크게 신경쓸 건 없고, 여기서는 안쪽 for loop에서 정리한 comment의 내용만 잘 기억해두면 됨.  

      for (width; width < stageWidth; width += density) {
        // height - 1 번째 row까지의 픽셀 수를 전부 계산한 게 height * stageWidth
        // 여기에 height 번째 row상에서 width번째 까지의 픽셀 수를 더해준 게 (width + (height * stageWidth))
        // 여기에 4를 곱하면 (width + (height * stageWidth)) + 1 번째 픽셀의 r값에 해당하는 index
        // 여기에 -1을 빼주면 (width + (height * stageWidth)) 번째 픽셀의 alpha값(투명도)에 해당하는 index
        pixel = imageData[((width + (height * stageWidth)) * 4) - 1];

        // alpha값이 0이 아닌, 즉 색상값이 존재하고,
        // 현재 브라우저 사이즈 내에 위치하는 픽셀들의 좌표값을 particles 배열에 차곡차곡 push해줌.
        if (pixel != 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight) {
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    return this.getOutline(particles, density);
  }

  // visual.js의 show 메소드에서 사용됬었던 this.pos.outline 에서의 outline 객체를 만들어주는 메소드겠지?
  // 일단 색상값이 존재하는 픽셀 좌표값 배결인 particles와 density를 전달받음
  getOutline(particles, density) {
    // 맨 처음에는 0번째 픽셀(반투명 알파벳에서 가장 왼쪽 위) 좌표값이 할당됨.
    let minX = particles[0].x;
    let maxX = particles[0].x;
    let minY = particles[0].y;
    let maxY = particles[0].y;

    // particles에 담긴 0번째 픽셀 좌표값을 제외한 나머지 모든 좌표값에 차례대로 for loop를 돌려서 실행해줌 
    for (let i = 1; i < particles.length; i++) {
      // item에는 0번째 픽셀 이후의 픽셀 좌표값들이 할당되는데,
      // 그 순서는 왼쪽에서 오른쪽 순으로, 위에서 아래로 순으로 픽셀 좌표값들이 할당될거임. 
      const item = particles[i];

      /**
       * for loop를 다 돌면서 모든 픽셀들의 좌표값의 대소를 일일이 비교하고 나면
       * 
       * minX에는 반투명 알파벳을 이루는 픽셀들의 x좌표값을 통틀어 가장 작은 x좌표값이 할당될거임.
       * 즉, 가장 왼쪽에 있는 픽셀의 x좌표값이 될거임.
       * 
       * maxX에는 반투명 알파벳을 이루는 픽셀들의 x좌표값을 통틀어 가장 큰 x좌표값이 할당될거임.
       * 즉, 가장 오른쪽에 있는 픽셀의 x좌표값이 될거임.
       * 
       * minY에는 반투명 알파벳을 이루는 픽셀들의 y좌표값을 통틀어 가장 작은 y좌표값이 할당될거임.
       * 즉, 가장 위쪽에 있는 픽셀의 y좌표값이 될거임.
       * 
       * maxY에는 반투명 알파벳을 이루는 픽셀들의 y좌표값을 통틀어 가장 큰 y좌표값이 할당될거임.
       * 즉, 가장 아래쪽에 있는 픽셀의 y좌표값이 될거임.
       */
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y);
    }

    // 애초에 반투명 알파벳의 픽셀들은 density 단위로 for loop를 돌면서 구해졌으니, density는 픽셀들의 간격과 같음.
    // gap은 픽셀들의 간격의 2배로 할당해 줌.
    const gap = density * 2;
    const distX = maxX - minX; // 가장 왼쪽 픽셀의 x좌표값 - 가장 오른쪽 픽셀 x좌표값 = 반투명 알파벳의 실제 width
    const xTotal = distX / gap | 0; // 반투명 알파벳 width를 gap으로 나눈 값을 정수로 변환함 = 너비에 gap이 들어가는 개수
    const distY = maxY - minY; // 가장 왼쪽 픽셀의 y좌표값 - 가장 오른쪽 픽셀 y좌표값 = 반투명 알파벳의 실제 height
    const yTotal = distY / gap | 0; // 반투명 알파벳 height를 gap으로 나눈 값을 정수로 변환함 = 높이에 gap이 들어가는 개수

    const outline = []; // 알파벳에 생성될 수직방향 string들 각각의 시작점과 끝점의 좌표값을 넣어줄 배열.  
    const xArray = [];
    // 3중 for loop로 결국 xArray를 채우려는 것.
    // xArray의 각 배열에는 하나의 tx가 속한 column 안에 포함되는 particles 좌표값들이 모두 저장됨.
    for (let i = 0; i < xTotal; i++) { // 첫번째 for loop는 알파벳 width에 들어가는 gap의 개수만큼 돌림
      const tx = i * gap + minX; // tx에는 mixX부터 시작해서 width를 gap 단위로 나누는 '분기점'의 x좌표값들이 순차적으로 들어갈거임.
      xArray[i] = []; // xTotal 만큼의 빈 배열들이 xArray 배열에 순차적으로 들어갈거임.

      for (let j = 0; j < yTotal; j++) { // 두번째 for loop는 알파벳 height에 들어가는 gap의 개수만큼 돌림
        const ty = j * gap + minY; // ty에는 minY부터 시작해서 height를 gap 단위로 나누는 '분기점'의 y좌표값들이 순차적으로 들어갈거임.
        // (tx, ty)는 결국 알파벳 전체가 gap단위로 나눠지는 바둑판 배열 상의 교차점들, 
        // 즉 분기점들의 좌표값들이 순차적으로 할당이 되는 것. 

        for (let k = 0; k < particles.length; k++) { // 세번째 for loop는 색상값이 존재하는 픽셀들 개수만큼 돌림
          const item = particles[k]; // item에는 왼쪽 -> 오른쪽, 위쪽 -> 아래쪽 순서로 각 픽셀들을 할당해서 돌려줌.
          if (pointCircle(item.x, item.y, tx, ty, gap)) {
            // 각 픽셀들 중에서 현재 (tx, ty)을 중심으로 반지름이 gap에 해당하는 원 안에 존재하는 픽셀들에 대해서만
            // 해당 픽셀들의 좌표값(item)과 현재 tx값을 같이 묶어서 xArray의 i번째 빈 배열에 push해줌.
            // 하나의 xArray[i]번째의 빈 배열안에 들어가는 값들에 대해서는 그림 참고
            xArray[i].push({
              x: tx,
              item,
            });
          }
        }
      }
    }
    // 결론적으로 xArray의 각 배열에는 하나의 tx가 속한 column 안에 포함되는 particles 좌표값들이 모두 저장됨.

    let check = 0; // 몇 번째 if block을 수행할 지 결정해주는 변수
    let prevY; // 이전 particles의 y좌표값이 계속해서 override될거임.
    for (let i = 0; i < xArray.length; i++) { // 첫번째 for loop는 xArray의 개수, 즉 tx의 개수만큼 돌림
      check = 0;
      // 첫번째 for loop 시작하면서 0이 할당됨. 
      // 따라서 각각의 tx에 대해 항상 첫번째 if block부터 수행하겠지

      for (let j = 0; j < xArray[i].length; j++) { // 각 tx에 같이 묶인 모든 particles 개수만큼 for loop를 돌림
        const pos = xArray[i][j]; // 각 tx에 묶인 particles 좌표값들을 차례대로 pos에 할당해 줌

        if (check == 0) {
          prevY = pos.item.y;
          outline.push({
            x: pos.x,
            minY: pos.item.y,
            maxY: pos.item.y,
          }); // 현재 tx와 첫번째 particles의 y좌표값을 prevY, minY, maxY에 모두 할당해서
          // 현재 tx에 해당하는 초기 outline좌표값(?)을 하나 생성해 줌.

          check = 1; // 두번째 particles 좌표값을 처리해줄 때는 두번째 if block으로 가겠지
        } else if (check == 1) {
          // 현재 tx의 두 번째 particles 좌표값이 pos에 할당된 상태에서 두번째 if block으로 넘어옴 
          // 같은 tx상에서 현재 particles의 y좌표값과 이전 particles의 y좌표값의 거리가 gap보다 가까운지 체크함
          // 가까우면 outline의 마지막(현재) 인덱스에 존재하는 minY, maxY와 현재 particles의 Y좌표값을 비교하면서
          // minY에는 더 작은 값을, maxY에는 더 큰 값을 계속 할당해 줌.
          // prevY를 현재 particles의 y좌표값으로 계속 override하면서 이걸 반복해 줌
          // 그러다보면 결국 cur.minY, maxY에는 현재 tx상에서 가장 작은, 또 가장 큰 y좌표값이 최종적으로 할당됨.
          if (pointCircle(pos.x, pos.item.y, pos.x, prevY, gap)) {
            const cur = outline[outline.length - 1];
            cur.minY = Math.min(cur.minY, pos.item.y);
            cur.maxY = Math.max(cur.maxY, pos.item.y);
            check = 1;
            prevY = pos.item.y;
          } else {
            // 위에서 저렇게 반복해주다가 현재 tx의 particles 좌표값들의 비교를 모두 끝내고 다음 tx로 넘어간다면
            // 알파벳 위쪽으로 올라가서 다시 시작해야 되니까 현재 particles좌표값과 이전 particles 좌표값이 gap보다 벌어지겠지? 
            // 즉, 다음 tx로 넘어가서 해당 tx에 맞는 minY, maxY를 구해야하는 상황이 되면 세번째 if block으로 보내는 것.
            check = 2;
          }
        } else if (check == 2) {
          // 첫번째 if block과 마찬가지로 prevY를 초기화해주고, 초기화한 particles의 y좌표값으로 
          // 변경된 tx에 해당하는 초기 outline 좌표값(?)을 또 하나 생성해줘서 push해줌.
          // 그리고나서 두번째 if block으로 넘어가서 현재 outline좌표값의 minY, maxY를 계속 비교하면서 override해주는 걸 반복함.
          prevY = pos.item.y;
          outline.push({
            x: pos.x,
            minY: pos.item.y,
            maxY: pos.item.y,
          });
          check = 1;
        }
      }
    }
    /** 
     * 첫번째 if block에서는 첫번째 tx의 초기 outline 좌표값을 생성해주는 거고
     * 
     * 두번째 if block은 현재 tx의 outline 좌표값과 현재 particles 좌표값을 반복적으로 비교하면서, 
     * 현재 tx상에서 가장 큰 y좌표값을 maxY에, 가장 작은 Y좌표값을 minY에 최종적으로 할당해 줌.
     * 
     * 세번째 if block은 현재 tx의 마지막 particles 좌표값에서 다음 tx의 첫번째 particles 좌표값으로 넘어갈 때 실행됨.
     * 한마디로 tx가 바뀌는 상황인 것. 따라서 첫번째 if block에서와 마찬가지로 
     * 바뀐 tx의 초기 outline 좌표값을 생성해주고 나서 다음 particles부터는 다시 두번째 if block으로 넘겨줘서
     * 바뀐 tx에 해당하는 minY, maxY를 구해줄 수 있도록 함.
     * 
     * 정리를 해보자면, 이중 for loop를 돌고 나면 결국 outline에는 각 tx에 해당하는 minY, maxY가 최종적으로 할당됨.
     * 따라서 xArray.length = outline.length 가 똑같겠지?
     */

    // 최종적으로 다음 값들을 리턴해줌.
    return {
      particles, // 알파벳 상에서 색상값이 존재하는 픽셀 좌표값 배열
      minX,
      maxX,
      minY,
      maxY, // 알파벳 전체의 minX, maxX, minY, maxY값
      outline, // 각각의 tx값과 그에 해당하는 minY(파란색), maxY(빨간색)값이 묶여서 저장된 outline 좌표값들
    };
  }
}