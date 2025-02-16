# 커버리지 리포트 읽기

### 목차

- [커버리지 리포트 개요](#커버리지-리포트-개요)
- [커버리지 리포트 읽기](#커버리지-리포트-읽기)
- [함수의 테스트 커버리지](#함수의-테스트-커버리지)
- [UI 컴포넌트의 테스트 커버리지](#UI-컴포넌트의-테스트-커버리지)
- [커스텀 리포터](#커스텀-리포터)

<br />

## 커버리지 리포트 개요

> 커버리지 리포트란?

테스트 프레임워크에서 구현 코드가 얼마나 테스트됐는지 측정해 리포트를 작성하는 기능

> 커버리지 리포트 출력하기

다음과 같이 `--coverage` 옵션을 추가해 테스트를 실행하면 커버리지 리포트를 확인할 수 있다.

```bash
$ npx jest --coverage
```

`Articles.tsx`, `greetByTime.ts` 두 개의 테스트 파일이 존재했을 때 실행 결과는 커맨드 라인에 출력된 커버리지 리포트는 다음과 같다.

```bash
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   69.23 |    33.33 |     100 |   69.23 |
 Articles.tsx   |   83.33 |    33.33 |     100 |   83.33 | 7
 greetByTime.ts |   57.14 |    33.33 |     100 |   57.14 | 5-8
----------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       4 skipped, 2 passed, 6 total
Snapshots:   0 total
Time:        0.953 s, estimated 1 s
```

> 커버리지 리포트 구성

| File   | Lines         | Stmts         | Branch        | Funcs         | Uncovered Line     |
| ------ | ------------- | ------------- | ------------- | ------------- | ------------------ |
| 파일명 | 구문 커버리지 | 분기 커버리지 | 함수 커버리지 | 라인 커버리지 | 커버되지 않은 라인 |

- Stmts(구문 커버리지): 구현 파일에 있는 모든 구문이 적어도 한 번은 실행됐는지 나타낸다.
- Branch(분기 커버리지): 구현 파일에 있는 모든 조건 분기(`if`, `case`, 삼항연산자)가 적어도 한 번은 실행됐는지 나타낸다. 커버리지를 정량 지표로 사용할 때 중점적으로 활용하는 핵심 지표다.
- Funcs(함수 커버리지): 구현 파일에 있는 모든 함수가 적어도 한 번은 호출됐는지 나타낸다. 프로젝트에서 실제로 사용하지 않지만 `export`된 함수를 찾는다.
- Lines(라인 커버리지): 구현 파일에 포함된 모든 라인이 적어도 한 번은 통과됐는지 나타낸다.

## 커버리지 리포트 읽기

> HTML로 리포트 생성하기

`jest.config.ts`에 아래와 같은 설정을 추가하면 커버리지 옵션을 넣지 않아도 리포트가 생성된다.(`coverageDirector`에 리포트를 생성할 임의의 디렉터리명을 입력한다.)

```ts
export default {
  // 생략
  collectCoverage: true,
  coverageDirectory: "coverage",
};
```

## 함수의 테스트 커버리지

`test`는 맨 앞에 `x`를 붗여서 `xtest`로 만들면 실행을 생략할 수 있다.

- 예제 코드: [src/06/greetByTime.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/06/greetByTime.ts)
- 테스트 파일: [src/06/greetByTime.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/06/greetByTime.test.ts)

> 테스트 생략 시 커버리지 내역

```ts
import { greetByTime } from "./greetByTime";

describe("greetByTime(", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  // (1) '좋은 아침입니다'를 반환하는 함수
  test("아침에는 '좋은 아침입니다'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 8, 0, 0));
    expect(greetByTime()).toBe("좋은 아침입니다");
  });
  // (2) '식사는 하셨나요'를 반환하는 함수
  xtest("점심에는 '식사는 하셨나요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 14, 0, 0));
    expect(greetByTime()).toBe("식사는 하셨나요");
  });
  // (3) '좋은 밤되세요'를 반환하는 함수
  xtest("저녁에는 '좋은 밤 되세요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 21, 0, 0));
    expect(greetByTime()).toBe("좋은 밤 되세요");
  });
});
```

다음은 각 테스트를 생략한 결과를 비교하여 표로 나타낸 것이다. 결과를 보면 커버되지 않은 라인이 빨간색으로 칠해진 것을 확인할 수 있다.

| 결과              | 커버리지 내역                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| A: (1)(2)(3) 생략 | Smtms: 14.28 <br /> Branch: 0 <br /> Funcs: 0 <br /> Lines: 14.28 <br /> Uncovered Line: 2-8       |
| B: (2)(3) 생략    | Smtms: 57.14 <br /> Branch: 33.33 <br /> Funcs: 100 <br /> Lines: 57.14 <br /> Uncovered Line: 5-8 |
| C: (3) 생략       | Smtms: 85.71 <br /> Branch: 100 <br /> Funcs: 100 <br /> Lines: 85.71 <br /> Uncovered Line: 8     |
| D: 생략하지 않음  | Smtms: 100 <br /> Branch: 100 <br /> Funcs: 100 <br /> Lines: 100 <br /> Uncovered Line: -         |

- '결과 A'의 `Func`는 0%이다. 이는 테스트 대상 파일에 한 개의 `greetByTime` 함수가 정의돼 있으며, 한 번도 `greetByTime` 함수가 실행되지 않았음을 의미한다.
- '결과 B'의 Branch는 33.33%로, 분기 커버리지가 충분하지 않은 것을 알 수 있다. 그리고 Uncovered Line을 보면 5-8 라인이 테스트되지 않았다.
- '결과 C'의 `Smtms`는 85.71%로 호출되지 않은 구문이 있다.
- '결과 D'의 첫 번째 라인 번호 옆의 숫자를 보면 '6x'라는 문자가 적혀 있는데, 이는 해당 라인이 테스트에서 통과된 횟수를 나타내는 것으로 다른 라인과 비교했을 때 더 많이 실행됐다는 의미다.

이처럼 구현된 함수의 내부를 한 라인씩 검사하면서 테스트에서의 실행 여부를 확인할 수 있다.

> 커버리지를 더 높이고 싶다면

함수 커버리지와 분기 커버리지에 중점을 두자. 이렇게 생성된 커버리지 리포트는 구현 코드의 내부 구조를 파악하여 논리적으로 문서를 작성하는 테스트 방법인 화이트박스 테스트에 필수다.

## UI 컴포넌트의 테스트 커버리지

`JSX`도 하나의 함수이므로 구분 커버리지와 분기 커버리지를 측정할 수 있다.

- 예제 코드: [src/06/Articles.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/06/Articles.tsx)
- 테스트 파일: [src/06/Articles.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/06/Articles.test.tsx)

커버리지 리포트를 보면 실행되지 않은 분기의 라인이 강조된다. 강조된 라인을 통해 테스트가 부족한 지 알 수 있다.

커버리지는 객관적인 측정이 가능한 정량 지표다. 프로젝트에 따라서 필수로 충족시켜야 하는 품질 기준으로 사용되지도 한다. 예를 들어 '분기 커버리지가 80% 이상이 아니면 CI를 통과하지 못한다' 같은 파이프라인을 만드는 데 활용할 수 있다.

하지만 커버리지 수치가 높다고 반드시 품질이 높은 것은 아니다. 커버리지 충족은 작성된 테스트를 통과했다는 의미이지 버그가 없다는 것을 보장해주지 않다. 다만 커버리지가 낮다는 것은 테스트가 부족하다는 신호일 수 있다.

## 커스텀 리포터

테스트 실행 결과는 여러 리포트를 통해 확인할 수 있다. `jest.config.ts`에 선호하는 리포터를 추가해서 테스트 환경을 견고하게 해보자.

```ts
export default {
  // 생략
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "__reports__",
        filename: "jest.html",
      },
    ],
  ],
};
```

> jest-html-reporters

jest-html-reporters는 테스트 실행 결과를 그래프 형태로 보여준다. 시간이 많이 걸리는 테스트를 찾거나 정렬 기능이 있어 편리하다.
