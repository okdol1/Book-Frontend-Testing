# UI 컴포넌트 테스트

### 목차

- [MPA와 SPA의 차이점](#MPA와-SPA의-차이점)
- [웹 접근성 테스트](#웹-접근성-테스트)
- [라이브러리 설치](#라이브러리-설치)
- [처음 시작하는 UI 컴포넌트 테스트](#처음-시작하는-UI-컴포넌트-테스트)
- [아이템 목록 UI 컴포넌트 테스트](#아이템-목록-UI-컴포넌트-테스트)
- [쿼리(요소 퀴득 API)의 우선순위](#쿼리요소-퀴득-API의-우선순위)
- [인터랙티브 UI 컴포넌트 테스트](#인터랙티브-UI-컴포넌트-테스트)
- [유틸리티 함수를 활용한 테스트](#유틸리티-함수를-활용한-테스트)
- [비동기 처리가 포함된 UI 컴포넌트 테스트](#비동기-처리가-포함된-UI-컴포넌트-테스트)
- [UI 컴포넌트 스냅숏 테스트](#UI-컴포넌트-스냅숏-테스트)
- [암묵적 역할과 접근 가능한 이름](#암묵적-역할과-접근-가능한-이름)
- [암묵적 역할 목록](#암묵적-역할-목록)

<br />

## MPA와 SPA의 차이점

> MPA

- Multi-page application, MPA: 여러 HTML 페이지와 HTTP 요청으로 만들어진 웹 애플리케이션

> SPA

- Single-page application, SPA: 한 개의 HTML 페이지에서 개발하는 웹 애플리케이션
  - 웹 서버가 응답으로 보낸 최초의 HTML 페이지를 사용자 입력에 따라 부분적으로 HTML을 변경한다. 부분적으로 변경할 때 주요 대상이 되는 단위가 UI 컴포넌트다.
  - SPA는 사용자 입력에 따라 필요한 최소한의 데이터만 취득해 화면을 갱신한다. 필요한 만큼만 데이터를 받기 때문에 응답이 빠르고, 데이터 취득에 사용되는 리소스 부담도 줄일 수 있어 백엔드에도 간접적인 영향을 미친다.

## 웹 접근성 테스트

> 접근성

- 신체적, 정신적 특성에 따른 차이 없이 정보에 접근할 수 있는 정도를 웹 접근성이라고 한다. 웹 접근성은 화면에 보이는 문제가 아니기 때문에 의식적으로 신경 써야만 알 수 있다.
- 웹 접근성을 신경 쓰지 않으면 사용자 특성에 따라 접근조차 하지 못하는 기능이 생기고 만다.
  - 대표적인 사례가 체크 박스다. 외관에만 치중한 나머지 `input` 요소를 CSS로 제거하는 경우가 있다. 보고 기기를 쓰는 사용자는 체크 박스의 존재조차 알아차릴 수 없게 된다.
- 서비스 제공자는 이와 같은 바람직하지 않은 상황이 일어나지 않도록 반드시 충족시켜야 할 품질 기준에 모든 사용자가 사용할 수 있어야 한다는 점을 포함시켜야 한다.

웹 접근성을 향상시키기에는 UI 컴포넌트 테스트가 안성 맞춤이다.

## 라이브러리 설치

- `jest-enviroment-jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/uesr-event`

> UI 컴포넌트 테스트 환경 구축

UI 컴포넌트 테스트 진행 방식:

- 렌더링된 UI를 조적하고
- 조작 때문에 발생한 결과를 검증

UI를 렌더링하고 조작하려면 DOM API가 필요하지만 제스트가 테스트를 실행하는 환경인 Node.js는 공식적으로 DOM API를 지원하지 않는다. 이 문제를 해결하려면 jsdom이 필요하다.

기본적인 테스트 환경은 jest.config.js의 `testEnviroment`에 지정한다.

```ts
module.exports = {
  testEnviroment: "jest-enviroment-jsdom",
};
```

Next.js 애플리케이션처럼 서버와 클라이언트 코드가 공존하는 경우에는 테스트 파일 첫 줄에 다음과 같은 주석을 작성해 파일별로 다른 테스트 환경을 사용하도록 설정할 수 있다.

```ts
/**
 * @jest-enviroment jest-enviroment-jsdom
 * /
```

> 테스팅 라이브러리

테스팅 라이브러리는 UI 컴포넌트를 테스트하는 라이브러리다. 크게 세 가지 역할을 담당한다.

- UI 컴포넌트를 렌더링한다.
- 렌더링된 요소에서 임의의 자식 요소를 취득한다.
- 렌더링된 요소에 인터랙션을 일으킨다.

UI 컴포넌트를 리액트로 만들고 있다면 리액트용 테스트 라이브러리인 `@testing-library/react`를 사용해야 한다.

> UI 컴포넌트 테스트용 매처 확장

`@testing-library/jest-dom` 라이브러리는 커스텀 매처라는 제스트의 확장 기능을 제공한다.

이 라이브러리를 추가하면 UI 컴포넌트를 쉽게 테스트할 수 있는 여러 매처를 사용할 수 있다.

> 사용자 입력 시뮬레이션 라이브러리

fireEvent API는 DOM 이벤트를 발생시킬 뿐이기 때문에 실제 사용자라면 불가능한 입력 패턴을 만들기도 한다.

따라서 실제 사용자의 입력에 가깝게 시뮬레이션이 가능한 `@testing-library/uesr-event`를 추가로 사용하는 것이 좋다.

## 처음 시작하는 UI 컴포넌트 테스트

- 예제 코드: [src/05/03/Form.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/03/Form.tsx)
- 테스트 파일: [src/05/03/Form.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/03/Form.test.tsx)

> UI 컴포넌트 렌더링

테스팅 라이브러리의 `render` 함수를 사용해 테스트할 UI 컴포넌트를 렌더링하면 매개변수 `name`에 할당한 값이 그대로 화면에 표시된다.

```tsx
import { render, screen } from "@testing-library/react";
import { Form } from "./Form";

test("이름을 표시한다", () => {
  render(<Form name="taro" />);
});
```

> 특정 DOM 요소 취득하기

렌더링된 요소 중 특정 DOM 요소를 취득하려면 `screen.getByText`를 사용한다. `screen.getByText` 함수는 일치하는 문자열을 가진 한 개의 텍스트 요소를 찾는 API로, 요소를 발견하면 해당 요소의 참조를 취득하고, 요소를 찾지 못하면 오류가 발생하고 테스트는 실패한다.

```ts
import { render, screen } from "@testing-library/react";
import { Form } from "./Form";

test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  console.log(screen.getByText("taro"));
});
```

> 단언문 작성

단언문은 `@testing-library/jest-dom`으로 확장한 커스텀 매처를 사용한다.

`toBeInTheDocument()`는 '해당 요소가 DOM에 존재하는가'를 검증하는 커스텀 매처다.

```tsx
import { render, screen } from "@testing-library/react";
import { Form } from "./Form";

test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  console.log(screen.getByText("taro")).toBeInTheDocument();
});
```

jest.setup.js에서 `@testing-library/jest-dom`을 `import`하고 있기 때문에 명시적으로 `import`하지 않아도 된다.

> 특정 DOM 요소를 역할로 취득하기

테스팅 라이브러리에는 특정 DOM 요소를 역할role로 취득할 수 있는 `screen.getByrole` 함수가 있다.

```tsx
test("heading을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("heading"));
});
```

취득한 `heading` 요소에 원하는 문자 포함 여부는 `toHaveTextContent`라는 매처로 검증할 수 있다.

```tsx
test("heading을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("heading")).toHaveTextContent("계정 정보");
});
```

> 이벤트 핸들러 호출 테스트

- 이벤트 랜들러란 어떤 입력이 발생했을 때 호출되는 함수를 말한다.
- 이벤트 핸들러 호출은 함수를 단위 테스트할 때와 동일하게 목 함수로 검증한다.
- 테스트 환경에서는 직접 버튼을 클릭할 수 없다. 이때 `fireEvent.click`를 사용해 버튼 클릭을 재현할 수 있다. 이와 같이 `fireEvent`를 사용하면 임의의 DOM 이벤트 발생이 가능해진다.

```tsx
import { fireEvent, render, screen } from "@testing-library/react";

test("버튼을 클릭하면 이벤트 핸들러가 실행된다", () => {
  const mockFn = jest.fn();
  render(<Form name="taro" onSubmit={mockFn} />);
  fireEvent.click(screen.getByRole("button"));
  expect(mockFn).toHaveBeenCalled();
});
```

## 아이템 목록 UI 컴포넌트 테스트

한 번에 여러 DOM 요소를 취득하는 방법과 '존재하지 않음'을 확인하는 매처로 요소가 화면에 존재하는지 확인하는 방법을 자세히 알아보자.

- 예제 코드: [src/05/04/ArticleList.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/04/ArticleList.tsx)
- 테스트 파일: [src/05/04/ArticleList.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/04/ArticleList.test.tsx)

예제 코드의 UI 컴포넌트는 기사 목록을 표시하는 컴포넌트다. 표시할 기사가 없으면 "게제된 기사가 없습니다"를 표시한다.

이 컴포넌트의 테스트는 아래의 분기 처리에 중점을 둬야 한다.

- 아이템이 존재하는 경우: 목록이 표시돼야 한다.
- 존재하지 않는 경우: 목록이 표시되지 않아야 한다.

> 목록에 표시된 내용 테스트

테스트용 데이터를 준비하자.

- 테스트용 데이터: [src/05/04/fixture.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/04/fixture.ts)

목록에 데이터가 표시되는지 확인해보자.

- `getAllByRole`은 지정한 역할과 일치하는 모든 요소를 배열로 취득하는 API다.
- `toHaveLength`는 배열 길이를 검증하는 매처다.

```tsx
test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});
```

세 개의 `<li>` 요소가 표시된 것을 확인했다. `<ul>` 요소가 존재하는가를 검증해보자.

- `<ul>` 요소는 `list`라는 암묵적 역할을 하므로 `screen.getByRole("list")`로 요소를 취득할 수 있다.

```tsx
test("목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
});
```

> within 함수로 범위 좁히기

- 큰 컴포넌트를 다룰 때는 테스트 대상이 아닌 `listItem`도 `getAllByRole`의 반환값에 포함될 수 있다.
- 따라서 취득한 `list` 노드로 범위를 좁혀 여기에 포함된 `listItem` 요소의 숫자를 검증해야 한다.
- 대상 범위를 좁혀서 취득하고 싶다면 `within` 함수를 사용하자. `within` 함수의 반환값에는 `screen`과 동일한 요소 취득 API가 포함됐다.

```tsx
test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
});
```

> 목록에 표시할 내용이 없는 상황에서의 테스트

목록에 표시할 데이터가 없으면 목록을 표시하지 않고 '게재된 기사가 없습니다'를 표시한다.

- 존재하지 않은 요소를 `getByRole`이나 `getByLabelText`로 취득을 시도하면 오류가 발생한다.
- '존재하지 않음'을 테스트르하려면 `queryBy` 접두사를 붙인 API를 사용해야 한다. `queryBy` 접두사를 붙인 API를 사용하면 테스트가 에러 발생으로 중단되지 않는다.
- `queryByRole`은 취득할 요소가 없으면 `null`을 반환하므로 `not.toBeInTheDocument` 또는 `toBeNull` 매처로 검증할 수 있다.

```tsx
test("목록에 표시할 데이터가 없으면 '게재된 기사가 없습니다'를 표시한다", () => {
  // 빈 배열을 items에 할당하여 목록에 표시할 데이터가 없는 상황을 재현한다.
  render(<ArticleList items={[]} />);
  // 존재하지 않을 것으로 예상하는 요소의 취득을 시도한다.
  const list = screen.queryByRole("list");
  // list가 존재하지 않는다.
  expect(list).not.toBeInTheDocument();
  // list가 null이다.
  expect(list).toBeNull();
  // '게재된 기사가 없습니다'가 표시됐는지 확인한다.
  expect(screen.getByText("게재된 기사가 없습니다")).toBeInTheDocument();
});
```

> 개별 아이템 컴포넌트 테스트

목록 컴포넌트는 별도로 개별 아이템 컴포넌트가 구현됐다. 개별 아이템은 `Props`로 받은 `id`를 사용해 "더 알아보기" 링크에 연결할 URL을 만드는 기능을 한다.

- 예제 코드: [src/05/04/ArticleListItem.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/04/ArticleListItem.tsx)
- 테스트 파일: [src/05/04/ArticleListItem.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/04/ArticleListItem.test.tsx)

`href` 속성에 할당된 URL이 `Props`의 `id`로 만들어진 것인지 "더 알아보기"라는 문자열을 가진 링크에 속성을 조사하는 매처인 `toHaveAttribute`로 테스트한다.

```tsx
test("링크에 id로 만든 URL을 표시한다", () => {
  render(<ArticleListItem {...item} />);
  expect(screen.getByRole("link", { name: "더 알아보기" })).toHaveAttribute(
    "href",
    "/articles/howto-testing-with-typescript"
  );
});
```

## 쿼리(요소 퀴득 API)의 우선순위

테스팅 라이브러리는 '사용자 입력을 제약 없이 재현한다'는 원칙이 있다. 요소 취득 API는 원칙에 따라 다음과 같은 순서로 사용할 것을 권장한다.

> 1. 모두가 접근 가능한 쿼리

신체적, 정신적 특성에 따른 차이 없이 접근할 수 있는 쿼리를 의미한다. 시각적으로 인지한 것과 스크린 리더 등의 보조 기기로 인지한 것이 동일하다는 것을 증명할 수 있다.

- `getByRole`
- `getByLabelText`
- `getByPlaceholderText`
- `getByText`
- `getByDisplayValue`

`getByRole`은 명시적으로 `role` 속성이 할당된 요소뿐만 아니라 암묵적 역할을 가진 요소도 취득할 수 있다.

> 2. 시맨틱 쿼리

공식 표준에 기반한 속성을 사용하는 쿼리를 의미한다. 시맨틱 쿼리를 사용할 대는 브라우저나 보조 기기에 따라 상당히 다른 결과가 나올 수 있으니 주의해야 한다.

- `getByAllText`
- `getByTitle`

> 3. 테스트 ID

테스트용으로 할당된 실별자를 의미한다. 역할이나 문자 콘텐츠를 활용한 쿼리를 사용할 수 없거나 의도적으로 의미 부여를 피하고 싶을 때만 사용할 것을 권장한다.

- `getByTestId`

## 인터랙티브 UI 컴포넌트 테스트

`Form` 요소의 입력과 상태를 체크하는 테스트를 작성해보고, 접근성 기반 쿼리를 사용하면서 DOM 구조를 토대로 만들어진 접근성이 무엇인지 알아보자.

> 접근 가능한 이름 인용하기

- 예제 코드: [src/05/05/Agreement.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/Agreement.tsx)
- 테스트 파일: [src/05/05/Agreement.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/Agreement.test.tsx)

- `<fieldset>` 요소는 `group`이라는 암묵적 역할을 한다.
- `<legend>`는 `<fieldset>`의 하위 요소로서 그룹에 제목을 붙이는 데 사용한다.

아래 코드는 `<legend>`에 이쓴ㄴ 문자를 `<fieldset>`의 접근 가능한 이름accessible name으로 인용할 수 있는지 검증하는 테스트다.

```tsx
test("fieldset의 접근 가능한 이름을 legend에서 인용합니다", () => {
  render(<Agreement />);
  expect(
    screen.getByRole("group", { name: "이용 약관 동의" })
  ).toBeInTheDocument();
});
```

아래 컴포넌트는 예제 코드와 외관상 차이는 없지만, 접근성에서 `<div>`는 역할을 가지지 않기 대문에 하나의 그룹으로서 식별할 수 없다. 아래와 같이 접근성을 지키지 않은 코드는 테스트 작성 시 특정 그룹으로 인식하기 어렵게 만든다.

```tsx
export const Agreement = ({ onChange }: Props) => {
  return (
    <div>
      <legend>이용 약관 동의</legend>
      <label>
        <input type="checkbox" onChange={onChange} />
        서비스&nbsp;<a href="/terms">이용 약관</a>을 확인했으며 이에 동의합니다
      </label>
    </div>
  );
};
```

이와 같이 UI 컴포넌트에 테스트를 작성하면 접근성을 고려하게 된다.

> 체크 박스의 초기 상태 검증

- 체크 박스 상태를 커스텀 매처인 `toBeChecked`로 검증한다.
- 렌더링 직후에는 체크되지 않은 상태이므로 `not.toBeChecked`는 성공한다.

```tsx
test("체크 박스가 체크되어 있지 않습니다", () => {
  render(<Agreement />);
  expect(screen.getByRole("checkbox")).not.toBeChecked();
});
```

> 계정 정보 입력 컴포넌트 테스트

`<input>` 요소에 문자열을 입력하는 테스트를 작성해보자.

- 예제 코드: [src/05/05/InputAccount.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/InputAccount.tsx)
- 테스트 파일: [src/05/05/InputAccount.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/InputAccount.test.tsx)

> userEvent로 문자열 입력하기

문자열 입력은 `@testing-library/react`의 `fireEvent`로도 재현할 수 있다. 하지만 이번에는 실제 사용자 작동에 가깝게 입력을 재현하는 `@testing-library/uesr-event`를 사용한다.

- `userEvent.setup()`으로 API를 호출할 `user` 인스턴스를 생성
- `user`로 테스트마다 입력이 발생하도록 구현
- 그다음 `screen.getByRole`로 "메일주소 입력란"을 취득
- 취득한 `textbox`에 `user.type` API로 입력을 재현한다.

`userEvnet`를 사용한 모든 인터랙션은 입력이 완료될 때까지 기다려야 하는 비동기 처리이므로 `await`를 사용해 입력이 완료될 때까지 기다린다.

- 마지막으로 `getByDisplayValue`로 초깃값이 입력된 폼 요소가 존재하는지 검증하고 테스트를 마친다.

```tsx
import userEvent from "@testing-library/user-event";

// 테스트 파일 작성 초기에 설정
const user = userEvent.setup();

test("메일주소 입력란", async () => {
  render(<InputAccount />);
  // 메일주소 입력란 취득
  const textbox = screen.getByRole("textbox", { name: "메일주소" });
  const value = "taro.tanaka@example.com";
  // textbox에 value를 입력
  await user.type(textbox, value);
  // 초깃값이 입력된 폼 요소가 존재하는지 검증
  expect(screen.getByDisplayValue(value)).toBeInTheDocument();
});
```

> 비밀번호 입력하기

메일 주소와 동일하게 테스트를 작성할 경우 오류가 발생하며 테스트가 실패한다.

- 실패한 이유는 `<input type='password' />`가 역할을 가지지 않기 때문이다.
- HTML 요소는 할당된 속성에 따라 암묵적 역할이 변하기도 한다.(radio, ...)
- 역할이 없는 경우에 요소를 취득하는 대체 수단으로 `placeholder` 값을 참조하는 `getByPlaceholderText`를 사용하면 비밀번호 입력란을 취득할 수 있다.

```tsx
test("비밀번호 입력란", async () => {
  render(<InputAccount />);
  expect(() => screen.getByPlaceholderText("8자 이상")).not.toThrow();
  expect(() => screen.getByRole("textbox", { name: "비밀번호" })).toThrow();
});
```

> 회원가입 버튼의 활성화 여부 테스트

- 예제 코드: [src/05/05/Form.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/Form.tsx)
- 테스트 파일: [src/05/05/Form.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/05/Form.test.tsx)

`Agreement` 컴포넌트에 있는 '이용 약관 동의' 체크 여부는 리액트의 `useState`를 사용해 상태로서 관리한다.
체크박스를 클릭하면 `checked` 상태가 변경되면서 '회원가입' 버튼 활성화 여부도 변경된다.

- `userEvent.setup`으로 만든 `user`를 사용해 `await user.click` 형식으로 클릭을 재현한다.
- 버튼의 비활성화 여부 검증은 `와 ` 매처를 사용한다.

```tsx
test("회원가입 버튼은 비활성화 상태다", () => {
  render(<Form />);
  expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
});

test("이용 약관에 동의하는 체크 박스를 클릭하면 회원가입 버튼은 활성화된다", async () => {
  render(<Form />);
  await user.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled();
});
```

> form의 접근 가능한 이름

폼의 접근 가능한 이름은 `heading` 역할을 하는 `<h2>` 요소에서 인용한다. `aria-labelledby`라는 속성에 `<h2>` 요소의 `id`를 지정하면 접근 가능한 이름으로 인용할 수 있다.

## 유틸리티 함수를 활용한 테스트

UI 컴포넌트 테스트에서 사용자 입력(인터랙션)이 검증의 기점이 된다. 폼 입력 인터랙션을 함수화해서 다시 활용하는 팁을 알아보자.

> 폼 입력을 함수화하기

- 예제 코드: [src/05/06/Form.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/06/Form.tsx)
- 테스트 파일: [src/05/06/Form.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/06/Form.test.tsx)

반복적으로 호출해야 하는 인터랙션을 하나의 함수로 정리하면 여러 곳에서 다시 활용할 수 있다.

사전에 입력할 내용의 초깃값을 인수에 설정하고 필요할 때마다 변경할 수 있어 편리하다.

```tsx
async function inputContactNumber(
  inputValues = {
    name: "배언수",
    phoneNumber: "000-0000-0000",
  }
) {
  await user.type(
    screen.getByRole("textbox", { name: "전화번호" }),
    inputValues.phoneNumber
  );
  await user.type(
    screen.getByRole("textbox", { name: "이름" }),
    inputValues.name
  );
  return inputValues;
}
```

인터랙션의 세부 내용을 함수에 숨기면 각 테스트에서 무엇을 검증하고 싶은지 명확해진다.

## 비동기 처리가 포함된 UI 컴포넌트 테스트

- 예제 코드: [src/05/07/RegisterAddress.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/07/RegisterAddress.tsx)
- 테스트 파일: [src/05/07/RegisterAddress.test.tsx](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/07/RegisterAddress.test.tsx)

> 웹 API 클라이언트의 목 함수

- [src/05/07/fetchers/mock.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/05/07/fetchers/mock.ts)

> 응답 성공 테스트

목 모듈을 사용하는 테스트는 파일 상단에 `jest.mock(모듈 경로);`을 실행해야 하는 것을 잊지 말자.

```tsx
jest.mock("./fetchers");

test("성공하면 '등록됐습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress();
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록됐습니다")).toBeInTheDocument();
});
```

> 응답 실패 테스트

```tsx
test("실패하면 '등록에 실패했습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress(500);
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록에 실패했습니다")).toBeInTheDocument();
});
```

> 유효성 검사 오류 테스트

- `checkPhoneNumber` 함수는 전화번호 입력값을 검증하는 유효성 검사 함수다.
- 유효성 검사에서 오류가 발생하도록 `-` 외의 입력값이 포함된 함수인 `fillInvalidValuesAndSubmit`을 작성해보자.
- `inputContactNumber` 함수의 인수에 올바르지 않은 입력값을 넣어 오류가 발생한다.

```tsx
async function fillInvalidValuesAndSubmit() {
  const contactNumber = await inputContactNumber({
    name: "배언수",
    phoneNumber: "abc-defg-hijkl",
  });
  const deliveryAddress = await inputDeliveryAddress();
  const submitValues = { ...contactNumber, ...deliveryAddress };
  await clickSubmit();
  return submitValues;
}

test("유효성 검사 에러가 발생하면 '올바르지 않은 값이 포함되어 있습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillInvalidValuesAndSubmit();
  expect(
    screen.getByText("올바르지 않은 값이 포함되어 있습니다")
  ).toBeInTheDocument();
});
```

이와 같이 '준비', '실행', '검증' 3단계로 정리한 테스트 코드를 AAA패턴이라고 하며, 가독성이 좋다.

> 알 수 없는 오류 테스트

```tsx
test("원인이 명확하지 않은 에러가 발생하면 '알 수 없는 에러가 발생했습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillValuesAndSubmit();
  expect(
    screen.getByText("알 수 없는 에러가 발생했습니다")
  ).toBeInTheDocument();
});
```

## UI 컴포넌트 스냅숏 테스트

UI 컴포넌트가 예기치 않게 변경됐는지 검증하고 싶다면 스냅숏 테스트를 한다.

> 스냅숏 기록하기

- UI 컴포넌트의 스냅숏 테스트를 실행하면 HTML 문자열로 해당 시점의 렌더링 결과를 외부 파일에 저장한다.
- 스냅숏 테스트를 실행하려면 스냅숏을 남기고 싶은 컴포넌트의 테스트 파일에 아래와 같이 `toMatchSnapshot`을 사용하는 단언문을 실행해야 한다.
- 테스트를 실행하면 테스트 파일과 같은 경로에 **snapshot** 디렉터리가 생성되고, 디렉터리 안에 '테스트 파일명.snap' 형식으로 파일이 저장된다. 파일을 열어보면 UI 컴포넌트가 HTML 문자열로 변경됐다.
- 자동으로 생성되는 .snap 파일은 git의 추적 대상으로 두고 커밋하는 것이 일반적이다.

```tsx
test("Snapshot: 계정명인 'taro'가 표시된다", () => {
  const { container } = render(<Form name="taro" />);
  expect(container).toMatchSnapshot();
});
```

> 회귀 테스트 발생시키기

- 스냅숏 테스트는 이미 커밋된 .snap 파일과 현시점의 스냅숏 파일을 비교하여 차이점이 발견되면 테스트가 실패하게 한다.
- 실패하는 테스트를 실행하면 변경된 부분에 `diff`가 생기고 실패한다.

> 스냅숏 갱신하기

- 실패한 테스트를 성공시키려면 커밋된 스냅숏을 갱신해야 한다.
- 테스트를 실행할 때 `--updatedSnapshot` 혹은 `-u` 옵션을 추가하면 스냅숏이 새로운 내용으로 갱신된다.
- 발견한 변경 사항이 의도한 것이라면 갱신을 허가한다는 의미에서 새로 출력된 스냅숏을 커밋하자.

```bash
$ npx jest --updatedSnapshot
```

## 암묵적 역할과 접근 가능한 이름

테스팅 라이브러리가 제공하는 '누구나 접근 가능한 쿼리'의 대표적인 `getByRole`은 HTML 요소의 역할을 참조한다. 역할은 웹 기술 표준을 정하는 W3C의 WAI-ARIA(Web Accessibility Initiative - Accessible Rich Internet Application)라는 사양에 포함된 내용 중 하나다.

> 암묵적 역할

몇몇 HTML 요소는 처음부터 역할을 가진다.

- 예를 들어 `button`은 `button`이라는 역할을 가진다.
- 명시적으로 `role`을 지정하지 않아도 된다.
- 이처럼 초깃값으로 부여된 역할을 암묵적 역할이라고 한다.

> 역할과 요소는 일대일로 매칭되지 않는다

요소가 가진 암묵적 역할과 요소가 일대일로 매칭되지는 않는다. 암묵적 역할은 요소에 할당한 속성에 따라 변경된다.

대표적인 경우가 input이다.

- input은 type 속성에 지정된 값에 따라 암묵적 역할이 변한다.
- 뿐만 아니라 type 속성에 지정한 값과 역할 명칭이 반드시 일치하지도 않는다.

```html
<!-- role="textbox" -->
<input type="text" />
<!-- role="checkbox" -->
<input type="checkbox" />
<!-- role="radio" -->
<input type="radio" />
<!-- role="spinbutton" -->
<input type="number" />
```

> aria 속성값을 활용해 추출하기

`h1`~`h6` 요소는 `heading`이라는 암묵적 역할을 가진다. 즉 테스트 대상이 `h1`과 `h2`를 동시에 가지면 `heading` 역할을 가진 요소가 여러 개 있는 상황이 생긴다. 이때 `screen.getByRole("heading")`으로 요소를 취득하려고 하면 테스트는 실패하고, `screen.getAllByRole("heading")`은 성공한다.

이런 상황에서 `h1` 하나만 취득하고 싶다면 `level`이라는 옵션을 활용한다.

```ts
getByRole("heading", { level: 1 });
```

> 역할과 접근 가능한 이름 확인하기

역할과 접근 가능한 이름을 확인하는 몇 가지 방법이 있다.

1. 브라우저의 개발자 도구와 확장 프로그램으로 특정 UI 컴포넌트의 접근성을 확인하는 방법
2. 테스트 코드의 렌더링 결과에서 역할과 접근 가능한 이름을 확인하는 방법

```ts
import { logRoles, render } from "@testing-library/react";
import { Form } from "./Form";

test("logRoles: 렌더링 결과로부터 역할과 접근 가능한 이름을 확인한다", () => {
  const { container } = render(<Form name="taro" />);
  logRoles(container);
});
```

테스트를 실행해보면 취득 가능한 요소가 `-------`로 구분돼 로그로 출력되는 것을 확인할 수 있다.

- `heading:`으로 출력된 것이 역할role이고,
- `Name "계정 정보":`로 출력된 것이 접근 가능한 이름이다.

## 암묵적 역할 목록

보조 기기뿐만 아니라 테스팅 라이브러리에서도 동일한 암묵적 역할을 사용한다. 테스팅 라이브러리는 내부적으로 [`aria-query`](https://www.npmjs.com/package/aria-query) 라이브러리로 암묵적 역할을 취득한다(`jsdom`은 접근성에 관여하지 않는다.)

```json
[
  [ 'article', [ {"name": "article"} ] ],
  [ 'button', [ {"name": "button"} ] ],
  [ 'cell', [ {"name": "td"} ] ],
  [ 'checkbox', [ {"name": "input", "attributes": [ {"name": "type", "value": "checkbox"}] } ] ],
  [ 'columnheader', [ {"name": "th"} ] ],
  [ 'combobox', [ {"name": "select"} ] ],
  [ 'command', [ {"name": "menuitem"} ] ],
  [ 'definition', [ {"name": "dd"}', '{"name": "dfn"} ] ],
  [ 'figure', [ {"name": "figure"} ] ],
  [ 'form', [ {"name": "form"} ] ],
  [ 'grid', [ {"name": "table"} ] ],
  [ 'gridcell', [ {"name": "td"} ] ],
  [ 'group', [ {"name": "fieldset"} ] ],
  [ 'heading', [ {"name": "h1"}', '{"name": "h2"}', '{"name": "h3"}', '{"name": "h4"}',  '{"name": "h5"}', '{"name": "h6"} ] ],
  [ 'img', [ {"name": "img"} ] ],
  [ 'link', [ {"name": "a"}', '{"name": "link"} ] ],
  [ 'list', [ {"name": "ol"}', '{"name": "ul"} ] ],
  [ 'listbox', [ {"name": "select"} ] ],
  [ 'listitem', [ {"name": "li"} ] ],
  [ 'menuitem', [ {"name": "menuitem"} ] ],
  [ 'navigation', [ {"name": "nav"} ] ],
  [ 'option', [ {"name": "option"} ] ],
  [ 'radio', [ {"name": "input", "attributes": [ {"name": "type", "value": "radio"}] } ] ],
  [ 'region', [ {"name": "frame"} ] ],
  [ 'roletype', [ {"name": "rel"} ] ],
  [ 'row', [ {"name": "tr"} ] ],
  [ 'rowgroup', [ {"name": "tbody"}', '{"name": "tfoot"}', '{"name": "thead"} ] ],
  [ 'rowheader', [ {"name": "th", "attributes": [ {"name": "scope", "value": "row"}] }, {"name": "th", "attributes": [ {"name": "scope", "value": "rowgroup"}] } ] ],
  [ 'searchbox', [ {"name": "input", "attributes": [ {"name": "type", "value": "search"}] } ] ],
  [ 'separator', [ {"name": "hr"} ] ],
  [ 'table', [ {"name": "table"} ] ],
  [ 'term', [ {"name": "dt"} ] ],
  [ 'textbox', [ {"name": "textarea"}', '{"name": "input", "attributes": [ {"name": "type", "value": "text"}] } ] ],
]
```
