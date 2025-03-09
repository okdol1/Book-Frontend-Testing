# UI 컴포넌트 탐색기

### 목차

- [스토리북 기초](#스토리북-기초)
- [스토리북 필수 애드온](#스토리북-필수-애드온)
- [Context API에 의존하는 스토리 등록](#Context-API에-의존하는-스토리-등록)
- [웹 API에 의존하는 스토리 등록](#웹-API에-의존하는-스토리-등록)
- [Next.js Router에 의존하는 스토리 등록](#Next.js-Router에-의존하는-스토리-등록)
- [Play function을 활용한 인터랙션 테스트](#Play-function을-활용한-인터랙션-테스트)
- [스토리북 테스트 러너](#스토리북-테스트-러너)
- [스토리를 통합 테스트에 재사용하기](#스토리를-통합-테스트에-재사용하기)

<br />

## 스토리북 기초

스토리북의 UI 컴포넌트 테스트는 통합 테스트, E2E 테스트 중간에 위치한 테스트다.

기본적으로 스토리북은 UI 컴포넌트 탐색기이지만 테스트 기능도 강화했다.

### 스토리북 설치

[storybook.js.org/docs](https://storybook.js.org/docs)

### 스토리 등록

- 스토리를 등록하려면 프로젝트에 스토리 파일을 추가해야 한다. `Button.stories.jsx`
- 아래 스토리에서는 `export default`로 한 객체를 `export`하고 있다. 객체 내부를 보면 `import`한 `Button`을 `component`라는 프로퍼티에 지정하고 있기 때문에, `Button` 컴포넌트 전용 스토리 파일로 등록할 수 있다.
- UI 컴포넌트는 `Props`의 조합으로 다른 스타일과 작동을 제공할 수 있다.(ex: `label`, `primary`, `size`, ...) 스토리북에서는 `Props`에 해당하는 변수명이 `props`가 아닌 `args`이다. `args.primary`에 다른 값을 지정하고 다른 이름으로 `export`하면 서로 다른 스토리로 등록된다.
- `export`할 객체 이름은 자유다. 해당 스토리를 설명할 적절한 이름을 할당하자.

```ts
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    primary: true,
    label: "Button",
  },
};
```

### 3단계 깊은 병합

모든 스토리에는 'Global', 'Componenet', 'Story'라는 세 단계의 설정이 깊은 병합(deep merge) 방식으로 적용된다.

공통으로 적용할 항목을 스코프에 설정하여 스토리마다 개별적으로 설정해야 하는 작업을 최소화할 수 있다. 스토리북에 있는 대부분 기능에서 설정할 수 있다.

- Global 단계: 모든 스토리에 적용할 설정 (`.storybook/preview.js`)
- Component 단계: 스토리 파일에 적용할 설정 (`export default`)
- Story 단계: 개별 스토리에 적용할 설정 (`export const`)

## 스토리북 필수 애드온

스토리북은 애드온(add-on)으로 필요한 기능을 추가할 수 있다. 스토리북을 설치할 때 기본적으로 추가되는 `@storybook/addon-essentials`은 필수 애드온이다.

```bash
$ npm run storybook
```

스토리북 실행

### Controls를 활용한 디버깅

스토리북 탐색기에서는 `Props`를 변경해 컴포넌트가 어떻게 표시되는지 실시간으로 디버깅할 수 있다. 이를 Controls라고 한다.

- [src/components/atoms/AnchorButton/index.stories.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/atoms/AnchorButton/index.stories.tsx)

예제 코드 `AnchorButton`에서는 여러 `Props`를 지정할 수 있다. 해당 `Props`들을 변경하면 UI 컴포넌트가 어떻게 변화되는지 바로 확인할 수 있다.

- [ ] 긴 문자열을 입력했을 때 레이아웃은 제대로 되었는가?
- [ ] 의도한 대로 줄넘김이 되었는가?
- [ ] ...

### Actions를 활용한 이벤트 핸들로 검증

UI 컴포넌트는 내부 로직을 처리할 때 `Props`로 전달받은 이벤트 핸들러를 호출하기도 한다. 이벤트 핸들러가 어떻게 호출됐는지 로그를 출력하는 기능이 Actions이며, `@storybook/addon-actions` 패키지에서 제공한다.

- [src/components/templates/MyPostsCreate/PostForm/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/PostForm/index.tsx)

`PostForm` UI 컴포넌트는 '이미지'와 '제목'이 필수 항목인데, 이 필수 항목을 입력하지 않았다는 로그를 Actions 패널에서 확인할 수 있다.

- 해당 애드온은 설치할 때 적용된 `@storybook/addon-essentials`에 포함되어 있기 때문에 처음부터 설정되어 있다.
- Global 단계 설정인 `.storybook/preview.js`를 보면 `argTypesRegex: "^on[A-Z].*"`라는 설정을 확인할 수 있다. `on`으로 시작하는 모든 이벤트 핸들러는 자동적으로 `Actions` 패널에 로그를 출력하게 된다.
- 만약 프로젝트에 이벤트 핸들러의 이름으로 사용하는 다른 네이밍 컨벤션이 있다면 해당 컨벤션에 따라 정규표현식을 수정해야 한다.

### 반응형 대응을 위한 뷰포트 설정

반응형으로 구현한 UI 컴포넌트는 화면 크기별로 스토리를 등록할 수 있다. `@storybook/addon-viewport` 패키지에서 지원한다.

- [src/components/layouts/BasicLayout/Header/index.stories.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/layouts/BasicLayout/Header/index.stories.tsx)

SP(스마트폰) 레이아웃으로 스토리를 등록하려면 `parameters.viewport`를 설정해야 한다.

```ts
import { SPStory } from "@/tests/storybook";

export const SPLoggedIn: Story = {
  parameters: {
    ...SPStory.parameters,
  },
};
```

적용된 공통 설정은 아래와 같다. `screenshot`은 스토리로 시각적 회귀 테스트를 하기 위한 설정이다.

- [src/tests/storybook.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/tests/storybook.tsx)

```ts
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

export const SPStory = {
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "iphone6",
    },
    screenshot: {
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 1,
      },
      fullPage: false,
    },
  },
};
```

## Context API에 의존하는 스토리 등록

- [Decorators](https://storybook.js.org/docs/writing-stories/decorators)

리액트의 Context API에 의존하는 스토리에는 스토리북의 데커레이터를 활용하는 것이 편리하다.

### 데커레이터란?

데커레이터는 각 스토리의 렌더링 함수에 적용할 래퍼(wrapper)다.

### Provider를 소유한 데커레이터

데커레이터에 `Context`의 `Provider`를 설정할 수 있다.

애플리케이션에서 필요한 `Provider`라면 실제 구현 코드와 똑같이 사용해도 상관없지만, 이 밖에는 스토리북 전용 `Provider`를 데커레이터로 만드는 것이 좋다.

### 데커레이터 고차 함수

데커레이터를 만드는 함수(고차 함수 HOF)를 작성하면 데커레이터를 쉽게 만들 수 있다.

- [src/components/providers/ToastProvider/Toast/index.stories.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/providers/ToastProvider/Toast/index.stories.tsx)

위 코드에서 각 스토리는 `createDecorator`라는 고차 함수를 사용해 설정을 최소화한다.

이와 같이 고차 함수를 만들면 초깃값을 쉽게 주입할 수 있다.

## 웹 API에 의존하는 스토리 등록

웹 API에 의존하는 컴포넌트는 스토리에도 웹 API가 필요하며, 컴포넌트를 렌더링하려면 웹 API 서버를 실행하고 있어야 한다. 스토리북을 빌드해서 정적 사이트로 호스팅할 때도 서버 상태가 좋지 않으면 API 요청이 원만하게 이루어지지 않는다.

이와 같은 UI 컴포넌트는 7장에서 다뤘던 MSW를 사용해야 한다.

### 애드온 설정

스토리북에서 MSW를 사용하려면 `msw`와 `msw-storybook-addon`을 설치해야 한다.

```bash
$ npm install msw msw-storybook-addon --save-dev
```

다음으로 `.storybook/preview.js` 에서 `initialize` 함수를 실행해 MSW를 활성화한다. `mswDecorator는` 모든 스토리에 필요하므로 여기에 설정한다.

- [src/tests/storybook.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/tests/storybook.tsx)

```js
import { initialize, mswDecorator } from "msw-storybook-addon";

export const decorators = [mswDecorator];

initalize();
```

프로젝트에 처음 MSW를 설치한다면 public 디렉터리의 경로를 다음의 커맨드대로 실행한다. 커맨드를 실행하면 mockServiceWorker.js가 생성되며, 커밋해야 한다.

```bash
$ npx msw init <PUBLIC_DIR>
```

스토리북에도 public 디렉터리의 경로를 명시한다.

- [.storybook/preview.js](https://github.com/frontend-testing-book-kr/nextjs/blob/main/.storybook/preview.js)

```js
export const parameters = {
  // 기타 설정 생략
  msw: {
    handlers: [
      rest.get("/api/my/profile", async (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 1,
            name: "EonsuBae",
            bio: "프런트엔드 엔지니어. 타입스크립트와 UI 컴포넌트 테스트에 관심이 있습니다.",
            twitterAccount: "eonsu-bae",
            githubAccount: "eonsu-bae",
            imageUrl: "/__mocks__/images/img01.jpg",
            email: "eonsubae@example.com",
            likeCount: 1,
          })
        );
      }),
    ],
  },
};
```

요청 핸들러가 스토리에 적용되는 우선순위는 1.Story, 2.Componenet, 3.Global이다. 따라서 동일한 URL을 가진 요청 핸들러를 Story 단계에 설정하면 이 설정이 적용된다.

요청 핸들러는 스토리마다 독립적으로 설정할 수 있기 때문에 같은 컴포넌트에서 웹 API 응답에 따라 다른 내용을 표시할 때도 유연하게 대응할 수 있다. 또한, 오류 응답의 상태 코드에 따라 다른 내용이 표시되는 상황을 검증할 때도 활용이 가능하다.

### 고차 함수로 요청 핸들러 리팩터링하기

웹 API에서 URL과 응답 내용은 불가분의 관계다. 스토리나 테스트에 URL을 하드코딩하면 URL 사양이 변경돼도 변경된 사양이 반영되지 않아 기대하지 않은 내용으로 응답할 수 있다.

이를 피하려면 웹 API 클라이언트 설정에 있는 고차 함수를 통해 만든 요청 핸들러에 URL을 정의해야 한다.

- [미로그인 상태의 헤더](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/layouts/BasicLayout/Header/index.stories.tsx)
- [로그인 화면의 스토리 파일](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/Login/index.stories.tsx)

## Next.js Router에 의존하는 스토리 등록

UI 컴포넌트에는 특정 URL에서만 사용할 수 있는 컴포넌트가 있다. `storybook-addon-next-router` 애드온을 추가하면 `Router` 상태를 스토리마다 설정할 수 있다.

```bash
$ npm install storybook-addon-next-router --save-dev
```

- [.storybook/main.js](https://github.com/frontend-testing-book-kr/nextjs/blob/main/.storybook/main.js)

```js
module.export = {
  // 다른 설정은 생략
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx"],
  addons: ["storybook-addon-next-router"],
};
```

- [.storybook/preview.js](https://github.com/frontend-testing-book-kr/nextjs/blob/main/.storybook/preview.js)

```js
import { RouterContext } from "next/dist/shared/lib/router-context";

export const parameters = {
  // 다른 설정은 생략
  nextRouter: {
    Provider: RouterContext.Provider,
  },
};
```

### Router에 의존하는 스토리 등록 예시

```ts
export const RouteMyPosts: Story = {
  parameters: {
    nextRouter: { pathname: "/my/posts" },
  },
};

export const RouteMyPostsCreate: Story = {
  parameters: {
    nextRouter: { pathname: "/my/posts/create" },
  },
};
```

## Play function을 활용한 인터랙션 테스트

`Props`를 UI 컴포넌트에 전달해 다양한 상황을 재현할 수 있다. 그런데 UI에 인터랙션을 할당하는 방법으로만 재현할 수 있는 상황도 있다.

예를 들어 폼에서 값을 전송하기 전 브라우저에 입력된 내용에 유효성 검사를 실시해서 문제가 있으면 오류를 표시하는 상황이다. 이러한 UI를 구현하려면 '문자 입력', 'focusout 이벤트', '전송 버튼 클릭' 같은 인터랙션이 필요하다.

스토리북 기능인 Play function을 사용하면 인터랙션 할당 상태를 스토리로 등록할 수 있다.

### 애드온 설정

```bash
$ npm install @storybook/testing-library @storybook/jest @storybook/addon-interactions --save-dev
```

- [.storybook/main.js](https://github.com/frontend-testing-book-kr/nextjs/blob/main/.storybook/main.js)

```js
module.exports = {
  // 다른 설정은 생략
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx"],
  addons: ["storybook/addon-interactions"],
  features: {
    interactionsDebugger: true,
  },
};
```

### 인터랙션 할당

인터랙션을 할당하기 위해 스토리에 `play` 함수를 설정한다. 테스팅 라이브러리 및 `jsdom` 사용할 때와 동일하게 `userEvent`를 사용해서 UI 컴포넌트에 인터랙션을 할당한다.

```ts
export const SucceedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
  },
};
```

### 단언문 작성

- [src/components/templates/MyPostsCreate/PostForm/index.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/templates/MyPostsCreate/PostForm/index.tsx)

`@storybook/jest`의 `export` 함수를 사용하면 UI 컴포넌트에 인터랙션을 할당한 상태에서 단언문을 작성할 수 있다.

```ts
export const SavePublish: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
    await user.click(canvas.getByRole("switch", { name: "공개 여부" }));
    await expect(
      canvas.getByRole("button", { name: "공개하기" })
    ).toBeInTheDocument();
  },
};
```

waitFor를 사용하는 방법도 테스팅 라이브러리와 jsdom을 사용할 때와 동일하다. 단언문이 실패해도 동일한 경고가 애드온 패널에 표시된다.

```ts
export const FailedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.click(
      canvas.getByRole("button", { name: "비공개 상태로 저장" })
    );
    const textbox = canvas.getByRole("textbox", { name: "제목" });
    await waitFor(() =>
      expect(textbox).toHaveErrorMessage("한 글자 이상의 문자를 입력해주세요")
    );
  },
};
```

## 스토리북 테스트 러너

테스트 러너는 스토리를 실행가능한 테스트로 변환한다.

테스트로 변환된 스토리는 제스트와 플레이라이트에서 실행된다. 이 기능을 활용해서 스토리북에 스모크 테스트는 몰론 앞서 살펴본 Play function이 정상적으로 종료됐는지와 접근성 위반 사항이 있는지도 테스트할 수 있어 UI 컴포넌트 테스트로도 활용할 수 있다.

```bash
npm install @storybook/test-runner --save-dev
```

```json
{
  "scripts": {
    "test:storybook": "test-storybook"
  }
}
```

## 스토리를 통합 테스트에 재사용하기

### 스토리 재사용

- [src/components/organisms/AlertDialog/index.stories.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/organisms/AlertDialog/index.stories.tsx)

```ts
// 스토리 등록용 함수
function createDecorator(defaultState?: Partial<AlertDialogState>) {
  return function Decorator(Story: PartialStoryFn<ReactFramework, Args>) {
    return (
      <AlertDialogProvider defaultState={{ ...defaultState, isShown: true }}>
        <Story />
      </AlertDialogProvider>
    );
  };
}

// 실제로 등록할 스토리
export const Default: Story = {
  decorators: [createDecorator({ message: "성공했습니다" })],
};

export const CustomButtonLabel: Story = {
  decorators: [
    createDecorator({
      message: "기사를 공개합니다. 진행하시겠습니까?",
      cancelButtonLabel: "CANCEL",
      okButtonLabel: "OK",
    }),
  ],
};

export const ExcludeCancel: Story = {
  decorators: [
    createDecorator({
      message: "전송됐습니다",
      cancelButtonLabel: undefined,
      okButtonLabel: "OK",
    }),
  ],
};
```

### 스토리를 import하여 테스트 대상으로 만들기

```bash
$ npm install --save-dev @storybook/testing-react
```

- [src/components/organisms/AlertDialog/index.test.tsx](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/components/organisms/AlertDialog/index.test.tsx)

### @storybook/test-runner와의 차이점

- 제스트에서 스토리를 재사용할 때의 장점
  - 목 모듈 혹은 스파이가 필요한 테스트를 작성할 수 있다(제스트의 목 함수 사용)
  - 실행 속도가 빠르다(헤드리스 브라우저를 사용하지 않기 때문)
- 테스트 러너의 장점
  - 테스트 파일을 따로 만들지 않아도 된다(적은 작업량)
  - 실제 환경과 유사성이 높다(브라우저를 사용해 CSS가 적용된 상황 재현 가능)
