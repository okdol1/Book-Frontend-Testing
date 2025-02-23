# 웹 애플리케이션 통합 테스트

### 목차

- [React Context와 통합 테스트](#React-Context와-통합-테스트)
- [Next.js 라우터와 렌더링 통합 테스트](#Next.js-라우터와-렌더링-통합-테스트)
- [동일한 테스트를 매개변수만 변경해 반복하기](#동일한-테스트를-매개변수만-변경해-반복하기)
- [Next.js 라우터와 입력 통합 테스트](#Next.js-라우터와-입력-통합-테스트)
- [React Hook Form으로 폼 쉽게 다루기](#React-Hook-Form으로-폼-쉽게-다루기)
- [폼 유효성 검사 테스트](#폼-유효성-검사-테스트)
- [일정 시간 동안 재시도하는 `waitFor`](#일정-시간-동안-재시도하는-`waitFor`)
- [웹 API 응답을 목 객체화하는 MSW](#웹-API-응답을-목-객체화하는-MSW)
- [웹 API 통합 테스트](#웹-API-통합-테스트)
- [이미지 업로드 통합 테스트](#이미지-업로드-통합-테스트)

<br />

7장부터 Next.js로 만든 애플리케이션 예제를 사용한다.

- https://github.com/frontend-testing-book-kr/nextjs

## React Context와 통합 테스트

> Context API

Context API를 사용하면 `Props`에 명시적으로 값을 전달할 필요가 없어 하위 컴포넌트에서 최상위 컴포넌트가 소유한 값과 갱신 함수에 직접 접근할 수 있다.

- [src/components/providers/ToastProvider/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/providers/ToastProvider/index.test.tsx)

> `Context` 테스트 방법 1: 테스트용 컴포넌트를 만들어 인터랙션 실행하기

- 테스트용으로만 사용할 컴포넌트를 만들어 실제와 비슷한 상황 재현하기
- `showToast`를 실행할 수만 있으면 되기 때문에 버튼을 클릭하면 `showToast`가 실행되도록 구현한다.

```ts
const user = userEvent.setup();

const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction(); // <Toast>를 표시하기 위한 훅
  return <button onClick={() => showToast({ message })}>show</button>;
};
```

1. 테스트에서 사용하는 `render` 함수로 최상위 컴포넌트인 `<ToastProvider>`와 하위 컴포넌트인 `<TestComponent>`를 렌더링한다.
2. `await user.click`으로 버튼을 클릭하면 렌더링되지 않았던 `alert` 역할인 `<Toast>` 컴포넌트가 메시지와 함께 렌더링된 것을 확인할 수 있다.

```ts
test("showToast를 호출하면 Toast컴포넌트가 표시된다", async () => {
  const message = "test";
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );
  // 처음에는 렌더링되지 않는다.
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button"));
  // 렌더링됐는지 확인한다.
  expect(screen.getByRole("alert")).toHaveTextContent(message);
});
```

> `Context` 테스트 방법 2: 초깃값을 주입해서 렌더링된 내용 확인하기

- 단순히 렌더링 여부를 확인하고 싶다면 `defaultState`에 초깃값을 주입해 검증하면 된다.

```ts
test("Succeed", () => {
  const state: ToastState = {
    isShown: true,
    message: "성공했습니다",
    style: "succeed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});

test("Failed", () => {
  const state: ToastState = {
    isShown: true,
    message: "실패했습니다",
    style: "failed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});
```

## Next.js 라우터와 렌더링 통합 테스트

Next.js의 라우터(페이지 이동과 URL을 관리하는 기능)와 연관된 UI 컴포넌트의 통합 테스트 방법을 살펴보자.

- [src/components/layouts/BasicLayout/Header/Nav/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/layouts/BasicLayout/Header/Nav/index.tsx)
- 위 코드에서는 `<Link>` 컴포넌트와 `useRouter` 훅은 내부에서 라우터를 사용해 현재 화면의 URL 정보를 가져오거나 화면 이동 리벤트를 발생시킬 수 있다.

> next-router-mock 설치

- Next.js에서 라우터 부분을 테스트하려면 목 객체를 사용해야 한다.
- 커뮤니티에서 개발한 `next-router-mock`은 제스트에서 Next.js의 라우터를 테스트할 수 있도록 목 객체를 제공하는 라이브러리다.

```bash
$ npm install --save-dev next-router-mock
```

> 테스트 환경에 URL 설정하기

- [src/components/layouts/BasicLayout/Header/Nav/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/layouts/BasicLayout/Header/Nav/index.test.tsx)
- `mockRouter.setCurrentUrl`을 호출하면 테스트 환경에 URL을 설정할 수 있다.

```ts
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl("/my/posts"); // 현재 URL이 "/my/posts"라고 가정한다.
});
```

1. 테스트 대상인 `<Nav>` 컴포넌트를 렌더링한다.
2. 설정한 URL대로 현재 위치가 적용됐는지 `aria-current` 속성을 검증해 테스트한다.

```ts
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl("/my/posts");
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name: "My Posts" });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

## 동일한 테스트를 매개변수만 변경해 반복하기

- 동일한 테스트를 매개변수만 변경해 반복하고 싶다면 `test.each`를 사용하는 것이 편리하다.

```ts
test.each([
  { url: "/my/posts", name: "My Posts" },
  { url: "/my/posts/123", name: "My Posts" },
  { url: "/my/posts/create", name: "Create Post" },
])("$url의 현재 위치는 $name이다", ({ url, name }) => {
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

## Next.js 라우터와 입력 통합 테스트

사용자 입력으로 발생한 영향을 테스트해보자.

- [src/components/templates/MyPosts/Posts/Header/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPosts/Posts/Header/index.tsx)
- [src/components/templates/MyPosts/Posts/Header/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPosts/Posts/Header/index.test.tsx)

> 초기 화면 테스트

- UI 컴포넌트의 통합 테스트는 설정 함수를 구현해 사용하는 것이 편리하다.
- 헤더 컴포넌트는 라우터를 사용하며, 테스트 렌더링 및 요소 취득뿐만 아니라 URL 재현까지 해야 한다.
- 이때 설정 함수를 만들면 모든 테스트에서 필요한 설정을 한 곳에서 간편하게 처리할 수 있다.

```ts
import { render, screen } from "@testing-library/react";
import mockRouter from "next-router-mock";
import { Header } from "./";

const user = userEvent.setup();

function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  return { combobox };
}
```

- 해당 설정 함수를 활용하면 아래와 같이 테스트를 작성할 수 있다.

```ts
test("기본값으로 '모두'가 선택되어 있다", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue("모두");
});

test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=public");
  expect(combobox).toHaveDisplayValue("공개");
});

test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=private");
  expect(combobox).toHaveDisplayValue("비공개");
});
```

> 인터랙션 테스트

- 인터랙션 테스트를 위해 설정 함수에 인터랙션 함수를 추가하자.
- `selectOption` 함수는 `user.selectOptions`으로 셀렉트 박스(`combobox`)에서 임의의 항목을 선택하는 기능을 한다.
- 테스트는 페이지 번호인 `?page`가 보존된 상태로 `?status`가 변경되는지도 함께 검증한다.

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";

const user = userEvent.setup();

function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label); // 셀렉트 박스에서 요소를 선택하는 인터랙션
  }
  return { combobox, selectOption };
}

test("공개 여부를 변경하면 status가 변한다", async () => {
  const { selectOption } = setup();
  expect(mockRouter).toMatchObject({ query: { page: "1" } });
  // '공개'를 선택하면 ?status=public이 된다.
  await selectOption("공개");
  // 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "public" },
  });
  // '비공개'를 선택하면 ?status=private이 된다.
  await selectOption("비공개");
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "private" },
  });
});
```

## React Hook Form으로 폼 쉽게 다루기

폼을 쉽게 다룰 수 있는 편리한 오픈소스가 많으며, 여기서는 React Hook Form을 사용한다.

폼은 전송하기 전에 입력된 내용을 참조하기 때문에 폼을 구현할 때 먼저 '어디에서 입력 내용을 참조할 것인지'를 정해야 한다. 리액트에서 입력 내용을 참조하는 방법은 제어 컴포넌트일 때와 비제어 컴포넌트일 때로 나뉜다.

> 제어 컴포넌트

- `useState` 등을 사용해 컴포넌트 단위로 상태를 관리하는 컴포넌트가 제어 컴포넌트다.
- 제어 컴포넌트로 구현된 폼은 관리 중인 상태를 필요한 타이밍에 웹 API로 보낸다.
- 입력 요소에 저장할 상태를 만들어, `<input>`에 인터랙티브하게 반영한다.
- 상태에 저장된 값은 항상 최신 입력 내용이기 때문에 `<form>` 요소의 `onSubmit`는 최신 입력 내용을 가져올 때 상태를 참조한다.

> 비제어 컴포넌트

- 폼을 전송할 때 `<input>` 등의 입력 요소에 브라우저 고유 기능을 사용해 값을 참조하도록 구현한다.
- 전송 시 직접 값을 참조하기 때문에 제어 컴포넌트처럼 `useState` 등의 방법으로 상태를 관리하지 않아도 되며, `ref`를 통해 DOM의 값을 참조한다.
- 이와 같은 비제어 컴포넌트 특성 때문에 `value`와 `onChange`를 지정하지 않는다.
- 제어 컴포넌트에서 `useState`로 지정했던 초깃값은 `defaultValue`라는 `Props`로 대체한다.

> React Hook Form과 비제어 컴포넌트

React Hook Form은 비제어 컴포넌트로 고성능 폼을 쉽게 작성할 수 있도록 도와주는 라이브러리다. 입력 요소를 참조하는 `ref`나 이벤트 핸들러를 자동으로 생성하고 설정해준다.

## 폼 유효성 검사 테스트

React Hook Form에는 `resolver`라는 하위 패키지가 있다. 여기에 입력 내용을 검증할 유효성 검사 스키마 객체를 할당할 수 있다.

유효성 검사 스키마에 부합하지 않은 내용이 포함됐으면 해당 입력 요소에 알맞은 오류 메시지를 자동으로 errors에 저장한다.

- [src/components/templates/MyPostsCreate/PostForm/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/PostForm/index.tsx)
- [src/components/templates/MyPostsCreate/PostForm/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/PostForm/index.test.tsx)

> `handleSubmit` 함수 `Props`에서 취득한 이벤트 핸들러 지정하기

- React Hook Form의 `handleSubmit` 함수의 인수는 함수를 직접 인라인으로 작성하지 않고, 다음과 같이 `Props`에서 취득한 이벤트 핸들러를 지정할 수도 있다.
- 두 번째 인수인 `props.onInvalid`에는 유효성 검사 오류가 발생했을 때 사용할 이벤트 핸들러를 지정하는 것이 가능하다.

```ts
<form
  aria-label={props.title}
  className={styles.module}
  onSubmit={handleSubmit(props.onValid, props.onInvalid)}
>
```

이와 같은 방식으로 구현하고자 `Props` 타입을 아래와 같이 정의한다. 유효성 검사를 통과한 폼의 입력 내용를 다루는 책임을 상위 컴포넌트에 위임한 것이다.

```ts
type Props<T extends FieldValues = PostInput> = {
  title: string;
  children?: React.ReactNode;
  onClickSave: (isPublish: boolean) => void;
  onValid: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
};
```

해당 UI 컴포넌트의 책임

- 입력폼 제공
- 입력 내용 검증(유효성 검사)
- 유효성 검사 오류가 있으면 오류 표시
- 유효한 내용이 전송되면 `onValid` 실행
- 유효하지 않은 내용이 전송되면 `onInvalid` 싱행

> 인터랙션 테스트 설정

- 테스트를 편하게 작성하기 위한 설정 함수 구현하기
- 설정 함수에는 `Props`의 이벤트 핸들러가 호출됐는지 검증한 목 함수(스파이)도 만든다.

```ts
function setup() {
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <PostForm
      title="신규 기사"
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInvalid}
    />
  );
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
  }
  async function saveAsDraft() {
    await user.click(
      screen.getByRole("button", { name: "비공개 상태로 저장" })
    );
  }
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    onClickSave,
    onValid,
    onInvalid,
  };
}
```

## 일정 시간 동안 재시도하는 `waitFor`

1. 아래 테스트에서는 설정 함수를 실행하면 바로 저장 버튼이 클릭된다.
2. 제목이 공란이므로 "한 글자 이상의 문자를 입력해주세요"라는 유효성 검사 오류가 나타난다.
3. `waitFor`라는 비동기 함수는 재시도를 위해 사용했다. 유효성 검사 오류가 나타나는 데 시간이 걸리므로 일정 시간 동안 `waitFor`로 단언문을 계속 재시도한다.

```ts
import { screen, waitFor } from "@testing-library/react";

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();
  await saveAsDraft();
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "제목" })).toHaveErrorMessage(
      "한 글자 이상의 문자를 입력해주세요"
    )
  );
});
```

설정 함수에서 만든 스파이로 이벤트 핸들러가 실행됐는지 검증하자. `onValid`는 실행되지 않고 `onInvalid`가 실행된다.

```ts
test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});
```

## 웹 API 응답을 목 객체화하는 MSW

웹 애플리케이션에서 웹 API는 필수다. 따라서 웹 API 테스트를 제대로 작성하는 일은 매루 중요하다.

MSW라는 목 서버 라이브러리를 사용해 웹 API를 목 객체화한다.

> 네트워크 계층의 목 객체를 만드는 MSW

- MSW(mock service worker)는 네트워크 계층의 목 객체를 만드는 라이브러리다.
- MSW를 사용하면 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체할 수 있다.
- 그리고 웹 API 서버를 실행하지 않아도 응답이 오는 상황을 재현할 수 있기 때문에 통합 테스트를 할 때 목 서버로 사용할 수 있다.

> MSW로 웹 API 요청 가로채기

1. 웹 API 요청을 가로채려면 요청 핸들러를 만들어야 한다. 아래 코드에서 `rest.post` 함수에 작성한 것이 요청 핸들러다.
2. 해당 요청 핸들러는 로컬 호스트의 `/login` 경로에 대한 POST 요청을 가로챈다.
3. `POST` 요청은 `body`에 포함된 `username`을 참조해 `{ username, firstName: "Eunbin" }`이라는 `JSON` 응답을 반환한다.

```ts
import { setupWorker, rest } from "msw";
const worker = setupWorker(
  rest.post("/login", (req, res, ctx) => {
    const { username } = await req.json(); // body에 있는 값을 취득
    return res(
      ctx.json({
        username,
        firstName: "Eunbin",
      })
    );
  })
);
worker.start();
```

> 제스트에서 사용하기

1. 우선 `msw/node`에서 제공하는 `setupServer` 함수로 제스트용 설정 함수를 만들자.
2. 요청 핸들러를 `setupServer` 함수에 가변 인수로 넘기면 요청을 가로챌 수 있다.
3. `setupServer` 함수는 테스트마다 서버를 초기화하기 때문에 한 테스트에서 가로챈 요청이 다른 테스트에 영향을 미치지 않는다.

```ts
import type { RequestHandler } from "msw";
import { setupServer } from "msw/node";

export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
}
```

- [src/tests/jest.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/tests/jest.ts)

> Fetch API의 폴리필

```ts
import "whatwg-fetch";
```

## 웹 API 통합 테스트

복잡한 인터랙션 분기를 가진 컴포넌트 테스트 방법을 살펴보자

- [src/components/templates/MyPostsCreate/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/index.tsx)
- [src/components/templates/MyPostsCreate/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/index.test.tsx)

> 인터랙션 테스트 설정

인터랙션 테스트를 위해 설정 함수에 인터랙션 함수(`clickButton`)를 추가한다.

```tsx
async function setup() {
  const { container } = render(<Default />);
  // 기사의 메인 이미지를 선택하는 함수
  const { selectImage } = selectImageFile();

  // 제목을 입력하는 함수
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }

  // 공개 상태로 저장하는 함수
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
    await screen.findByRole("alertdialog");
  }

  // 비공개 상태로 저장하는 함수
  async function saveAsDraft() {
    await user.click(
      screen.getByRole("button", { name: "비공개 상태로 저장" })
    );
  }

  // `AlertDialog`의 [네] 혹은 [아니오]를 선택하는 함수
  async function clickButton(name: "네" | "아니오") {
    await user.click(screen.getByRole("button", { name }));
  }

  return {
    container,
    typeTitle,
    saveAsPublished,
    saveAsDraft,
    clickButton,
    selectImage,
  };
}
```

> AlertDialog 렌더링 테스트

`AlertDialog`는 공개 직전에만 렌더링되는 UI 컴포넌트다. 공개를 시도하면 `기사를 공개합니다. 진행하시겠습니까?`라는 문구가 `AlertDialog`에 나타나는지 검증해야 한다.

```ts
describe("AlertDialog", () => {
  test("공개를 시도하면 AlertDialog가 표시된다", async () => {
    const { typeTitle, saveAsPublished, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished(); // 기사 공개하기
    expect(
      screen.getByText("기사를 공개합니다. 진행하시겠습니까?")
    ).toBeInTheDocument();
  });

  test("[아니오] 버튼을 누르면 AlertDialog가 사라진다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("아니오");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다", async () => {
    const { saveAsPublished, clickButton, selectImage } = await setup();
    // await typeTitle("201");　제목을 입력하지 않은 상태
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    // 제목 입력란이 invalid 상태가 된다.
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "제목" })).toBeInvalid()
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
```

## 이미지 업로드 통합 테스트

이미지 업로드 기능을 가진 UI 컴포넌트의 테스트 방법을 살펴보자.

- [src/components/templates/MyProfileEdit/Avatar/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyProfileEdit/Avatar/index.tsx)
- [src/components/templates/MyProfileEdit/Avatar/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyProfileEdit/Avatar/index.test.tsx)

> 테스트할 UI 컴포넌트

1. 컴퓨터에 저장된 이미지를 선택하여 업로드를 시도한다.
2. 이미지 업로드에 성공하면 프로필 이미지로 적용한다.
3. 이미지 업로드에 실패하면 실패했음을 알린다.

`<input type="file">` 요소를 클릭하면 컴퓨터에 저장된 이미지를 선택할 수 있다. `accept: "image/png, image/jpeg"`는 PNG와 JPEG 형식의 이미지만 선택할 수 있도록 범위를 한정한 것이다.

이 UI 컴포넌트에서는 (2)와 (3)이 호출된 상황을 중심적으로 테스트한다.

> 이미지 업로드 처리 흐름

- [src/components/hooks/useUploadImage.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/hooks/useUploadImage.ts)

이미지가 선택되면 이 컴포넌트에서는 두 가지 작업을 처리한다.

- 브라우저 API인 `FileReader` 객체를 사용해서 컴퓨터에 저장된 이미지 파일의 내용을 비동기로 취득한다.
- 취득이 끝나면 이미지 업로드 API를 호출한다.

```ts
// handleChangeFile 함수는 FileReader 객체를 사용해서 이미지 파일을 취득한다.
const onChangeImage = handleChangeFile((_, file) => {
  // 취득한 이미지의 내용을 file에 저장한다.
  // uploadImage 함수는 API Route로 구현된 이미지 업로드 API를 호출한다.
  uploadImage({ file })
    .then((data) => {
      const imgPath = `${data.url}/${data.filename}` as PathValue<T, Path<T>>;
      // API 응답에 포함된 이미지 URL을 경로로 지정한다.
      setImageUrl(imgPath);
      setValue(name, imgPath);
      onResolved?.(data);
    })
    .catch(onRejected);
});
```

- 이미지 업로드 API(`uploadImage` 함수에서 호출 중인 API)는 Next.js의 API Routes에 구현된 것이다.
- 내부는 AWS SDK로 AWS S3레 이미지를 저장하도록 구현됐다. 개발 환경에서는 AWS S3와 호환되는 MiniIO라는 개발용 서버에 저장한다.
- 이미지 업로드가 완료되면 업로드된 이미지의 URL을 취득할 수 있으며, 이미지 URL을 `imageUrl`로 설정하여 프로필 이미지의 `src`로 사용한다.

> 통합 테스트용 목 객체 만들기

해당 컴포넌트를 테스트할 때 문제되는 것이 테스트 환경에서 '이미지 선택하기(브라우저 API)'와 '이미지 업로드 API 호출하기(Next.js)'를 사용할 수 있어야 한다는 점이다.

하지만 `jsdom`은 브라우저 API를 제공하지 않고, 이미지 업로드 API도 Next.js 서버 없이 사용할 수 있어야 한다. 문제를 해결하고 (2), (3)도 검증하려면 목 함수를 사용한다.

> 1. 이미지를 선택하는 목 함수

- [src/tests/jest.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/tests/jest.ts)

```ts
import userEvent from "@testing-library/user-event";

export function selectImageFile(
  inputTestId = "file",
  fileName = "hello.png",
  content = "hello"
) {
  // userEvent를 초기화한다.
  const user = userEvent.setup();
  // 더미 이미지 파일을 작성한다.
  const filePath = [`C:\\fakepath\\${fileName}`];
  const file = new File([content], fileName, { type: "image/png" });
  // render한 컴포넌트에서 data-testid="file"인 input을 취득한다.
  const fileInput = screen.getByTestId(inputTestId);
  // 이 함수를 실행하면 이미지 선택이 재현된다.
  const selectImage = () => user.upload(fileInput, file);
  return { fileInput, filePath, selectImage };
}
```

> 2. 이미지 업로드 API를 호출하는 목 함수

- [src/services/client/UploadImage/**mock**/jest.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/services/client/UploadImage/__mock__/jest.ts)

```ts
import { ErrorStatus, HttpError } from "@/lib/error";
import * as UploadImage from "../fetcher";
import { uploadImageData } from "./fixture";

jest.mock("../fetcher");

export function mockUploadImage(status?: ErrorStatus) {
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, "uploadImage")
      .mockRejectedValueOnce(new HttpError(status).serialize());
  }
  return jest
    .spyOn(UploadImage, "uploadImage")
    .mockResolvedValueOnce(uploadImageData);
}
```

> 업로드 성공 테스트

업로드가 성공하는 상황을 테스트할 때는 맨 윗줄에 `mockUploadImage` 함수를 그대로 호출하여 업로드가 성공하도록 설정한다.

초기 화면에서는 `img` 요소의 `src` 속성이 비어야 하기 때문에 이 부분에 대한 단언문도 작성한다.

```ts
test("이미지 업로드에 성공하면 이미지의 src 속성이 변경된다", async () => {
  // 이미지 업로드가 성공하도록 설정한다.
  mockUploadImage();
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지의 src 속성이 비었는지 확인한다.
  expect(screen.getByRole("img").getAttribute("src")).toBeFalsy();
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 이미지의 src 속성이 채워졌는지 확인한다.
  await waitFor(() =>
    expect(screen.getByRole("img").getAttribute("src")).toBeTruthy()
  );
});
```

> 업로드 실패 테스트

테스트 함수의 가장 윗줄에 `mockUploadImage(500)`를 호출하여 업로드가 실패하도록 설정하자.

```ts
test("이미지 업로드에 실패하면 경고창이 표시된다", async () => {
  // 이미지 업로드가 실패하도록 설정한다.
  mockUploadImage(500);
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 지정한 문자열이 포함된 Toast가 나타나는지 검증한다.
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "이미지 업로드에 실패했습니다"
    )
  );
});
```
