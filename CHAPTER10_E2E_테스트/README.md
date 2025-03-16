# E2E 테스트

### 목차

- [E2E 테스트란](#E2E-테스트란)
- [E2E 테스트 프레임워크 플레이라이트(Playwright)](#E2E-테스트-프레임워크-플레이라이트Playwright)
- [개발 환경에서 E2E 테스트 실행하기](#개발-환경에서-E2E-테스트-실행하기)
- [프리즈마를 활용한 테스트](#프리즈마를-활용한-테스트)
- [로그인 기능 E2E 테스트](#로그인-기능-E2E-테스트)
- [프로필 기능 E2E 테스트](#프로필-기능-E2E-테스트)
- [Like 기능 E2E 테스트](#Like-기능-E2E-테스트)
- [신규 작성 페이지 E2E 테스트](#신규-작성-페이지-E2E-테스트)
- [기사 편집 페이지 E2E 테스트](#기사-편집-페이지-E2E-테스트)
- [게재된 기사 목록 페이지 E2E 테스트](#게재된-기사-목록-페이지-E2E-테스트)
- [불안정한 테스트 대처 방법](#불안정한-테스트-대처-방법)

<br />

## E2E 테스트란

프런트엔드에서 E2E 테스트는 브라우저를 사용할 수 있기 때문에 실제 애플리케이션에 가까운 테스트가 가능하다. 브라우저 고유의 API를 사용하는 상황이나 화면을 이동하며 테스트해야 하는 상황에 안성맞춤이다.

일반적으로 E2E 테스트 프레임워크로 테스트를 실시할 때는 다음 상황을 구분하지 않고 E2E 테스트라고 한다.

- 브라우저 고유 기능과 연동된 UI 테스트
- 데이터베이스 및 하위 시스템과 연동된 E2E 테스트

E2E 테스트는 무엇을 테스트할지 목적을 명확히 세우는 것이 가장 중요하다. 실제 애플리케이션은 데이터베이스 서버나 외부 저장소 서비스와 연결된다. E2E 테스트에서는 이 시스템들을 포함한 전체 구조에서 얼마나 실제와 유사한 상황을 재현할 것인지가 중요한 기준점이 된다. 어떤 관점에서 어떤 선택을 내려야 할지 상활별로 살펴보자.

### 브라우저 고유 기능과 연동한 UI 테스트

웹 애플리케이션은 브라우저 고유 기능을 사용한다. 다음과 같은 상황들은 `jsdom`에서 제대로 된 테스트를 할 수 없다.

- 화면 간의 이동
- 화면 크기를 측정해서 실행되는 로직
- CSS의 미디어 쿼리를 사용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소 등에 데이터를 저장

상황에 따라 브라우저로 실제 상황과 최대한 유사하게 테스트하고 싶다면 UI 테스트를 하자. API 서버나 다른 하위 시스템은 목 서버를 만들어 E2E 테스트 프레임워크에서 연동된 기능을 검증하면 된다. 피처 테스트라고도 부른다.

### 데이터베이스 및 서브 시스템과 연동한 E2E xptmxm

데이터베이스 서버나 외부 시스템과 연동하여 다음과 같은 기능을 최대한 실제와 유사하게 재현해 검증하는 테스트를 E2E 테스트라고 한다.

- 데이터베이스 서버와 연동하여 데이터를 불러오거나 저장한다.
- 외부 저장소 서비스와 연동하여 이미지 등을 업로드한다.
- 레디스와 연동하여 세션을 관리한다.

이처럼 E2E 테스트는 표현 계층, 응용 계층, 영속 계층을 연동하여 검증하므로 실제 상황과 유사성이 높은 테스트로 자리매김했다.

반대로 많은 시스템과 연동하기 때문에 실행 시간이 길고, 불안정하다는 단점도 있다.

## E2E 테스트 프레임워크 플레이라이트(Playwright)

- [playwright.dev/docs](https://playwright.dev/docs/intro)

플레이라이트는 마이크로소프트가 공개한 E2E 테스트 프레임워크다.

- 크로스 브라우징 지원
- 디버깅 테스트
- 리포터
- 트레이스 뷰어
- 테스트 코드 생성기

### 처음 시작하는 E2E 테스트

- [playwright.dev/docs/writing-tests](https://playwright.dev/docs/writing-tests)
- [e2e/example.spec.ts](https://github.com/frontend-testing-book-kr/playwright/blob/main/e2e/example.spec.ts)

```ts
import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // 페이지 제목에 "Playwright"가 포함됐는지 검증한다.
  await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // "Get started"라는 접근 가능한 이름을 가진 링크를 취득하고, 링크를 클릭한다.
  await page.getByRole("link", { name: "Get started" }).click();

  // 페이지 URL에 "intro"가 포함됐는지 검증한다.
  await expect(page).toHaveURL(/.*intro/);
});
```

### 로케이터

- [playwright.dev/docs/locators](https://playwright.dev/docs/locators)

로케이터는 플레이라이트의 핵심 API다. 현재 페이지에서 특정 요소를 가져온다.

1.27.0 버전에서는 테스팅 라이브러리로부터 영향을 받은 접근성 기반 로케이터가 추가됐다.

테스팅 라이브러리와 다른 점이 있다면 대기 시간이 필요한지에 따라 `findByRole` 등을 구분해서 사용하지 않아도 된다는 것이다. 인터랙션은 비동기 함수이기 때문에 `await`로 인터랙션이 완료될 때까지 기다린 후 다음 인터랙션을 실행하는 방식으로 동작한다.

### 단언문

- [e2e/example.spec.ts](https://github.com/frontend-testing-book-kr/playwright/blob/main/e2e/example.spec.ts)

> 로케이터를 사용한 단언문 작성법

```ts
import { expect } from "@playwright/test";

test("Locator를 사용한 단언문 작성법", async ({ page }) => {
  // 특정 문자열을 가진 요소를 취득해서 화면에 보이는 상태인지 검증한다.
  await expect(page.getByText("Welcome, John!")).toBeVisible();
  // 체크박스체크 박스를 취득해서 체크되어 있는지됐는지 검증한다.
  await expect(page.getByRole("checkbox")).toBeChecked();
  // not으로 진릿값을 반전시킨다.
  await expect(page.getByRole("heading")).not.toContainText("some text");
});
```

> 페이지를 사용한 단언문 작성법

```ts
import { expect } from "@playwright/test";

test("페이지를 사용한 단언문 작성법", async ({ page }) => {
  // 페이지 URL에 "intro"가 포함됐는지 검증한다.
  await expect(page).toHaveURL(/.*intro/);
  // 페이지 제목에 "Playwright"가 포함됐는지 검증한다.
  await expect(page).toHaveTitle(/Playwright/);
});
```

## 개발 환경에서 E2E 테스트 실행하기

### E2E 테스트 실행

```bash
$ npx playwright test
```

### 파일변 테스트 실행

```bash
$ npx playwright test Login.spec.ts
```

### 플레이라이트 검사 도구를 활용한 디버깅

```bash
$ npx playwright test Login.spec.ts --debug
```

## 프리즈마를 활용한 테스트

- [prisma.io/docs/guides/nextjs](https://www.prisma.io/docs/guides/nextjs)

> 프리즈마 스키마

- [prisma/schema.prisma](https://github.com/frontend-testing-book-kr/nextjs/blob/main/prisma/schema.prisma)

프리즈마는 프리즈마 스키마라는 엔티티 간 관계를 나타내는 도메인 특화 언어를 사용해 데이터베이스를 정의한다. 해당 스키마 파일이 마이그레이션 스크립트로 변환되는 동시에 프리즈마 클라이언트가 생성된다.

> 프리즈마 클라이언트 사용하기

- [src/services/server/index.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/services/server/index.ts)
- [src/services/server/MyPost/index.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/services/server/MyPost/index.ts)

> 시드 스크립트 등록 `package.json`

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed/index.ts"
  }
}
```

> 시드 스크립트 실행 파일

- [prisma/seed/index.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/prisma/seed/index.ts)
- [prisma/seed/like.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/prisma/seed/like.ts)
- [prisma/fixtures/like.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/prisma/fixtures/like.ts)

## 로그인 기능 E2E 테스트

- [e2e/util.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/util.ts)

```ts
// 등록 완료된 사용자로 로그인하기
export async function login({
  page,
  userName = "JPub",
}: {
  page: Page;
  userName?: UserName;
}) {
  const user = getUser(userName)!;
  await page.getByRole("textbox", { name: "메일주소" }).fill(user.email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(user.password);
  await page.getByRole("button", { name: "로그인" }).click();
}

// 로그인 상태에서 로그아웃하기
export async function logout({
  page,
  userName = "JPub",
}: {
  page: Page;
  userName?: UserName;
}) {
  const user = getUser(userName)!;
  const loginUser = page
    .locator("[aria-label='로그인한 사용자']")
    .getByText(user.name);
  await loginUser.hover();
  await page.getByText("로그아웃").click();
}

// 로그인 상태가 아니면 로그인 화면으로 리다이렉트시키기
export async function assertUnauthorizedRedirect({
  page,
  path,
}: {
  page: Page;
  path: string;
}) {
  // 지정된 페이지에 접근한다.
  await page.goto(url(path));
  // 리다이렉트될 때까지 기다린다.
  await page.waitForURL(url("/login"));
  // 로그인 페이지로 이동했는지 확인한다.
  await expect(page).toHaveTitle("로그인 | Tech Posts");
}
```

- [src/lib/next/gssp.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/src/lib/next/gssp.ts)

```ts
// 로그인 후 리다이렉트 이전 화면으로 돌아가기
if (err instanceof UnauthorizedError) {
  session.redirectUrl = ctx.resolvedUrl;
  return { redirect: { permanent: false, destination: "/login" } };
}
```

## 프로필 기능 E2E 테스트

> 프로필 정보 갱신 과정을 E2E 테스트하기

세부 내용은 건드리지 않는 블랙박스 테스트 형식으로 작성됐다.

- [e2e/MyProfileEdit.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/MyProfileEdit.spec.ts)

## Like 기능 E2E 테스트

- [e2e/Post.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/Post.spec.ts)

## 신규 작성 페이지 E2E 테스트

- [e2e/postUtil.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/postUtil.ts)

> 신규 작성 페이지에 접근해 콘텐츠를 입력하는 함수

```ts
export async function gotoAndFillPostContents({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await page.goto(url("/login"));
  await login({ page, userName });
  await expect(page).toHaveURL(url("/"));
  await page.goto(url("/my/posts/create"));
  await page.setInputFiles("data-testid=file", [
    "public/__mocks__/images/img01.jpg",
  ]);
  await page.waitForLoadState("networkidle", { timeout: 30000 });
  await page.getByRole("textbox", { name: "제목" }).fill(title);
}
```

> 신규 기사를 비공개 상태로 저장하는 함수

```ts
export async function gotoAndCreatePostAsDraft({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await gotoAndFillPostContents({ page, title, userName });
  await page.getByRole("button", { name: "비공개 상태로 저장" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
}
```

> 신규 기사를 공개하는 함수

```ts
export async function gotoAndCreatePostAsPublish({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await gotoAndFillPostContents({ page, title, userName });
  await page.getByText("공개 여부").click();
  await page.getByRole("button", { name: "공개하기" }).click();
  await page.getByRole("button", { name: "네" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
}
```

> 지금까지 만든 함수들을 E2E 테스트에 활용하기

- [e2e/MyPostsCreate.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/MyPostsCreate.spec.ts)

```ts
import { test } from "@playwright/test";
import { UserName } from "../prisma/fixtures/user";
import {
  gotoAndCreatePostAsDraft,
  gotoAndCreatePostAsPublish,
} from "./postUtil";

test.describe("신규 기사 페이지", () => {
  const path = "/my/posts/create";
  const userName: UserName = "JPub";

  test("신규 기사를 비공개 상태로 저장할 수 있다", async ({ page }) => {
    const title = "비공개 상태로 저장하기 테스트";
    await gotoAndCreatePostAsDraft({ page, title, userName });
  });

  test("신규 기사를 공개할 수 있다", async ({ page }) => {
    const title = "공개하기 테스트";
    await gotoAndCreatePostAsPublish({ page, title, userName });
  });
});
```

## 기사 편집 페이지 E2E 테스트

> 새로 추가할 공통 함수

- [e2e/postUtil.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/postUtil.ts)

```ts
export async function gotoEditPostPage({
  page,
  title,
}: {
  page: Page;
  title: string;
}) {
  await page.getByRole("link", { name: "편집하기" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(`기사 편집 | ${title}`);
}
```

- [e2e/MyPostEdit.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/MyPostEdit.spec.ts)

```ts
test("비공개 기사를 편집할 수 있다", async ({ page }) => {
  const title = "비공개 편집 테스트";
  const newTitle = "비공개 편집 테스트 갱신 완료";
  await gotoAndCreatePostAsDraft({ page, title, userName });
  await gotoEditPostPage({ page, title });
  await page.getByRole("textbox", { name: "제목" }).fill(newTitle);
  await page.getByRole("button", { name: "비공개 상태로 저장" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(newTitle);
});

test("비공개 기사를 공개할 수 있다", async ({ page }) => {
  const title = "비공개 기사 공개 테스트";
  await gotoAndCreatePostAsDraft({ page, title, userName });
  await gotoEditPostPage({ page, title });
  await page.getByText("공개 여부").click();
  await page.getByRole("button", { name: "공개하기" }).click();
  await page.getByRole("button", { name: "네" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
});

test("공개된 기사를 비공개할 수 있다", async ({ page }) => {
  const title = "기사 비공개 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
  await gotoEditPostPage({ page, title });
  await page.getByText("공개 여부").click();
  await page.getByRole("button", { name: "비공개 상태로 저장" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
});

test("공개된 기사를 삭제할 수 있다", async ({ page }) => {
  const title = "기사 삭제 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
  await gotoEditPostPage({ page, title });
  await page.getByRole("button", { name: "삭제하기" }).click();
  await page.getByRole("button", { name: "네" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(`${userName}님의 기사 목록`);
});
```

## 게재된 기사 목록 페이지 E2E 테스트

> 작성한 기사가 목록에 추가됐는지 검증하기

- [e2e/MyPosts.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/MyPosts.spec.ts)

> 공개된 기사가 메인 페이지에 추가됐는지 검증하기

- [e2e/Top.spec.ts](https://github.com/frontend-testing-book-kr/nextjs/blob/main/e2e/Top.spec.ts)

## 불안정한 테스트 대처 방법

흔히 E2E 테스트 프레임워크를 통한 테스트는 안정적이지 않다고 생각한다. 불안정한 테스트는 네트워크 지연이나 메모리 부족에 의한 서버 응답 지연 등 다양한 원인으로 발생한다.

불안정한 테스트에 직면했을 때의 몇 가지 대처 방법을 살펴보자.

- 실행할 때마다 데이터베이스 재설정하기
- 테스트마다 사용자를 새로 만들기
- 테스트 간 리소스가 경합하지 않도록 주의하기
- 빌드한 애플리케이션 서버로 테스트하기
- 비동기 처리 대기하기
- `--debug`로 테스트 실패 원인 조사하기
- CI 환경과 CPU 코어 수 맞추기
- 테스트 범위 최적화
