# 목 객체

## 목 객체를 사용하는 이유

- 실제 실행 환경과 재현성이 높이다 보면 실행 시간이 많이 걸리거나 환경 구축이 어려워질 때
- 대표적으로 웹 API에서 취득한 데이터를 다뤄야 할 때
- 웹 API를 사용하면 '성공하는 경우'뿐만 아니라 '실패하는 경우'도 테스트해야 한다.
- 실패하는 경우를 웹 API 서버에 테스트하는 코드를 추가하는 것은 옳지 않다.

> 스텁을 사용하는 이유

스텁은 주로 대역으로 사용한다.

- 의존 중인 컴포넌트의 대역
- 정해진 값을 반환하는 용도
- 테스트 대상에 할당하는 입력값

테스트 대상이 의존 중인 컴포넌트에 테스트하기 어려운 부분이 있을 때 사용하는 예.

'웹 API에서 이런 값을 반환받았을 때는 이렇게 작동해야 한다'와 같은 테스트에 스텁을 사용한다. 테스트 대상이 스텁에 접근하면 스텁은 정해진 값을 반환한다.

> 스파이를 사용하는 이유

스파이는 주로 기록하는 용도다.

- 함수나 메서드의 호출 기록
- 호출된 횟수나 실행 시 사용한 인수 기록
- 테스트 대상의 출력 확인

스파이는 테스트 대상 외부의 출력을 검증할 때 사용한다.

대표적인 경우가 인수로 받은 콜백 함수를 검증하는 것이다. 콜백 함수가 실행된 횟수, 실행 시 사용한 인수 등을 기록하기 때문에 의도대로 콜백이 호출됐는지 검증할 수 있다.

## 목 모듈을 활용한 스텁

구현이 완성되어 있지 않거나 수정이 필요한 모듈에 의존 중인 경우가 있다. 이때 해당 모듈로 대체하면 테스트할 수 없었던 대상을 테스트할 수 있게 된다.

- 테스트할 함수: [src/04/02/greet.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/02/greet.ts)
- 테스트 파일: [src/03/02/greet2.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/02/greet2.test.ts)

테스트할 함수에서는 `sayGoodBye`는 아직 구현되지 않기 때문에 테스트가 어렵다. 테스트를 위해서 `sayGoodBye` 함수를 대체해보자.

> 일반적인 테스트

```ts
import { greet } from "./greet";

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});
```

- 테스트 이전에 `jest.mock` 함수를 호출한다.
- 해당 함수를 호출하면 위 예제에서는 잘 작동하던 `greet` 함수가 `undefined`를 반환하게 된다.
- `jest.mock`이 테스트 전에 호출되면서 테스트할 모듈들을 대체했기 때문이다.

```ts
import { greet } from "./greet";

jest.mock("./greet");

test("인사말을 반환하지 않는다(원래 구현과 다르게)", () => {
  expect(greet("Taro")).toBe(undefined);
});
```

> 모듈을 스텁으로 대체하기

- 원래 `sayGoodBye`는 `Error`를 반환하도록 구현돼 있었지만 다른 것으로 대체해 테스트가 성공하도록 변경했다.
- 이처럼 모듈의 일부를 테스트에서 대체하면 의존 중인 모듈의 테스트가 어렵더라도 테스트가 가능하게 만들 수 있다.
- 대체한 구현부에 `greet` 함수는 구현하지 않았다. 따라서 제대로 구현됐던 `greet` 함수가 `undefined`를 반환한다.
  - 모든 모듈을 대체하지 않고 `greet`처럼 일부는 원래 구현대로 사용하고 싶다면 다음을 참고하기

```ts
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test("인사말이 구현되어 있지 않다(원래 구현과 다르게)", () => {
  expect(greet).toBe(undefined);
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

> 모듈 일부를 스텁으로 대체하기

- `jest.requireActual` 함수를 사용하면 원래 모듈의 구현을 `import` 할 수 있다. 이 함수로 `sayGoodbye`만 대체할 수 있게 된다.

```ts
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"),
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

## 라이브러리 대체하기

- 실무에서는 라이브러리를 대체할 때 목 모듈을 가장 많이 사용한다.
- 아래 코드는 `next/router`라는 의존 모듈 대신 `next-router-mock`이라는 라이브러리를 적용한다.

```ts
jest.mock("next/router", () => require("next-router-mock"));
```

## 웹 API 목 객체 기초

웹 애플리케이션에서 웹 API 서버와 통신하여 데이터를 취득하고 갱신하는 작업은 필수다. 테스트를 할 때는 웹 API 관련 코드를 웹 API 클라이언트의 대역인 스텁으로 대체하여 테스트를 작성한다. 스텁이 실제 응답은 아니지만 응답 전후의 관련 코드를 검증할 때 유용하게 사용할 수 있다.

- 테스트할 함수: [src/04/03/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/03/index.ts)
- 테스트 파일: [src/04/03/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/03/index.test.ts)

> 웹 API 클라이언트 스텁 구현

- 우선 테스트할 모듈을 불러온 뒤 `jest.mock` 함수를 호출하여 불러온 모듈들을 대체한다.
- 이어서 `jest.spyOn`으로 테스트할 객체를 대체한다.

```ts
import { getGreet } from ".";
import * as Fetchers from "../fetchers";
import { httpError } from "../fetchers/fixtures";

jest.mock("../fetchers");

jest.spyOn(테스트할 객체, 테스트할 함수 이름);
jest.spyOn(Fetchers, "getMyProfile");
```

> 데이터 취득 성공을 재현한 테스트

- 데이터 취득이 성공했을 때(resolve) 응답으로 기대하는 객체를 `mockResolvedValueOnce`에 지정한다.

```ts
describe("getGreet", () => {
  test("데이터 취득 성공 시 : 사용자 이름이 없는 경우", async () => {
    // getMyProfile이 resolve됐을 때의 값을 재현
    jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
      id: "xxxxxxx-123456",
      email: "taroyamada@myapi.testing.com",
    });
    await expect(getGreet()).resolves.toBe("Hello, anonymous user!");
  });
  test("데이터 취득 성공 시: 사용자 이름이 있는 경우", async () => {
    jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
      id: "xxxxxxx-123456",
      email: "taroyamada@myapi.testing.com",
      name: "taroyamada",
    });
    await expect(getGreet()).resolves.toBe("Hello, taroyamada!");
  });
  test("데이터 취득 실패 시", async () => {
    // getMyProfile이 reject됐을 때의 값을 재현
    jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
    await expect(getGreet()).rejects.toMatchObject({
      err: { message: "internal server error" },
    });
  });
  test("데이터 취득 실패 시 에러가 발생한 데이터와 함께 예외가 throw된다", async () => {
    expect.assertions(1);
    jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
    try {
      await getGreet();
    } catch (err) {
      expect(err).toMatchObject(httpError);
    }
  });
});
```

## 웹 API 목 객체 생성 함수

응답 데이터를 대체하는 목 객체 생성 함수의 사용 방법을 살펴보자.

- 테스트할 함수: [src/04/04/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/04/index.ts)
- 테스트 파일: [src/04/04/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/04/04/index.test.ts)

> 응답을 교체하는 목 객체 생성 함수

- 테스트할 함수는 웹 API 클라이언트(`getMyArticles` 함수)를 사용한다.
- 우선 `getMyArticles` 함수 응답을 재현할 픽스처를 만든다. 픽스처란 응답을 재현하기 위한 테스트용 데이터를 의미한다.

```ts
import { getMyArticleLinksByCategory } from ".";
import * as Fetchers from "../fetchers";
import { getMyArticlesData, httpError } from "../fetchers/fixtures";

jest.mock("../fetchers");

function mockGetMyArticles(status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "getMyArticles")
      .mockRejectedValueOnce(httpError);
  }
  return jest
    .spyOn(Fetchers, "getMyArticles")
    .mockResolvedValueOnce(getMyArticlesData);
}

test("지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("playwright");
  expect(data).toBeNull();
});

test("지정한 태그를 포함한 기사가 한 건 이상 있으면 링크 목록을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("testing");
  expect(data).toMatchObject([
    {
      link: "/articles/howto-testing-with-typescript",
      title: "타입스크립트를 사용한 테스트 작성법",
    },
    {
      link: "/articles/react-component-testing-with-jest",
      title: "제스트로 시작하는 리액트 컴포넌트 테스트",
    },
  ]);
});

test("데이터 취득에 실패하면 reject된다", async () => {
  mockGetMyArticles(500);
  await getMyArticleLinksByCategory("testing").catch((err) => {
    expect(err).toMatchObject({
      err: { message: "internal server error" },
    });
  });
});
```

## 목 함수를 사용하는 스파이

제스트의 목 함수로 스파이를 구현하는 방법을 살펴보자. 스파이는 테스트 대상에 발생한 입출력을 기록하는 객체다. 스파이에 기록된 값을 검증하면 의도항 대로 기능이 작동하는지 확인할 수 있다.

> 실행 관련 검증

```ts
import { greet } from "./greet";

test("목 함수가 실행됐다", () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toBeCalled();
});

test("목 함수가 실행되지 않았다", () => {
  const mockFn = jest.fn();
  expect(mockFn).not.toBeCalled();
});

test("목 함수는 실행 횟수를 기록한다", () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(2);
});

test("목 함수는 함수 안에서도 실행할 수 있다", () => {
  const mockFn = jest.fn();
  function greet() {
    mockFn();
  }
  greet();
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test("목 함수는 실행 시 인수를 기록한다", () => {
  const mockFn = jest.fn();
  function greet(message: string) {
    mockFn(message); // 인수를 받아 실행된다.
  }
  greet("hello"); // "hello"를 인수로 실행된 것이 mockFn에 기록된다.
  expect(mockFn).toHaveBeenCalledWith("hello");
});

test("목 함수를 테스트 대상의 인수로 사용할 수 있다", () => {
  const mockFn = jest.fn();
  greet("Jiro", mockFn);
  expect(mockFn).toHaveBeenCalledWith("Hello! Jiro");
});
```

> 실행 시 인수가 객체일 때의 검증

```ts
import { checkConfig } from "./checkConfig";

test("목 함수는 실행 시 인수가 객체일 때에도 검증할 수 있다", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith({
    mock: true,
    feature: { spy: true },
  });
});

test("expect.objectContaining를 사용한 부분 검증", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      feature: { spy: true },
    })
  );
});
```

## 웹 API 목 객체의 세부 사항

이번에는 입력값을 검증한 후 응답 데이터를 교체하는 목 객체의 구현 방법을 알아보자.

```ts
import { checkLength } from ".";
import * as Fetchers from "../fetchers";
import { postMyArticle } from "../fetchers";
import { httpError, postMyArticleData } from "../fetchers/fixtures";
import { ArticleInput } from "../fetchers/type";

jest.mock("../fetchers");

function mockPostMyArticle(input: ArticleInput, status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
  try {
    checkLength(input.title);
    checkLength(input.body);
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockResolvedValue({ ...postMyArticleData, ...input });
  } catch (err) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
}

function inputFactory(input?: Partial<ArticleInput>) {
  return {
    tags: ["testing"],
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
    ...input,
  };
}

test("유효성 검사에 성공하면 성공 응답을 반환한다", async () => {
  // 유효성 검사에 통과하는 입력을 준비한다.
  const input = inputFactory();
  // 입력값을 포함한 성공 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input);
  // input을 인수로 테스트할 함수를 실행한다.
  const data = await postMyArticle(input);
  // 취득한 데이터에 입력 내용이 포함됐는지 검증한다.
  expect(data).toMatchObject(expect.objectContaining(input));
  // 목 함수가 호출됐는지 검증한다.
  expect(mock).toHaveBeenCalled();
});

test("유효성 검사에 실패하면 reject된다", async () => {
  expect.assertions(2);
  // 유효성 검사에 통과하지 못하는 입력을 준비한다.
  const input = inputFactory({ title: "", body: "" });
  // 입력값을 포함한 성공 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input);
  // 유효성 검사에 통과하지 못하고 reject됐는지 검증한다.
  await postMyArticle(input).catch((err) => {
    // 에러 객체가 reject됐는지 검증한다.
    expect(err).toMatchObject({ err: { message: expect.anything() } });
    // 목 함수가 호출됐는지 검증한다.
    expect(mock).toHaveBeenCalled();
  });
});

test("데이터 취득에 실패하면 reject된다", async () => {
  expect.assertions(2);
  // 유효성 검사에 통과하는 입력값을 준비한다.
  const input = inputFactory();
  // 실패 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input, 500);
  // reject됐는지 검증한다.
  await postMyArticle(input).catch((err) => {
    // 에러 객체가 reject됐는지 검증한다.
    expect(err).toMatchObject({ err: { message: expect.anything() } });
    // 목 함수가 호출됐는지 검증한다.
    expect(mock).toHaveBeenCalled();
  });
});
```

## 현재 시각에 의존하는 테스트

```ts
import { greetByTime } from ".";

describe("greetByTime(", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("아침에는 '좋은 아침입니다'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 8, 0, 0));
    expect(greetByTime()).toBe("좋은 아침입니다");
  });

  test("점심에는 '식사는 하셨나요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 14, 0, 0));
    expect(greetByTime()).toBe("식사는 하셨나요");
  });

  test("저녁에는 '좋은 밤 되세요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 21, 0, 0));
    expect(greetByTime()).toBe("좋은 밤 되세요");
  });
});
```

## 설정과 파기

- 테스트를 실행하기 전에 공통으로 설정해야 할 작업이 있거나 테스트 종료 후에 공통으로 파기하고 싶은 작업이 있는 경우 있다.
- 이때 설정 작업은 `beforeAll`과 `beforeEach`를, 파기 작업은 `afterAll`과 `afterEach`를 사용할 수 있다.

```ts
beforeAll(() => console.log("1 - beforeAll"));
afterAll(() => console.log("1 - afterAll"));
beforeEach(() => console.log("1 - beforeEach"));
afterEach(() => console.log("1 - afterEach"));

test("", () => console.log("1 - test"));

describe("Scoped / Nested block", () => {
  beforeAll(() => console.log("2 - beforeAll"));
  afterAll(() => console.log("2 - afterAll"));
  beforeEach(() => console.log("2 - beforeEach"));
  afterEach(() => console.log("2 - afterEach"));

  test("", () => console.log("2 - test"));
});

// 1 - beforeAll
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll
```
