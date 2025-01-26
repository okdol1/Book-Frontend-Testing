# CHAPTER 3 처음 시작하는 단위 테스트

### 목차

- [환경 설정](#환경-설정)
- [테스트 구성 요소](#테스트-구성-요소)
- [테스트 실행 방법](#테스트-실행-방법)
- [조건 분기](#조건-분기)
- [에지 케이스와 예외 처리](#에지-케이스와-예외-처리)
- [용도별 매처](#용도별-매처)
- [비동기 처리 테스트](#비동기-처리-테스트)

<br />

## 환경 설정

이 책에서는 테스트 코드를 작성할 때 JS(TS)에서 가장 인기 있는 테스트 프레임워크이자 테스트 러너인 [Jest](https://jestjs.io/)를 사용한다.

Jest는 간단한 설정만으로도 사용할 수 있으며, *\*목 객체*와 _\*코드 커버리지_ 수집 기능까지 갖춘 메타의 오픈소스다.

<br />

<i>
*목 객체: 테스트 시 실제 객체를 대신하여 동작하도록 만든 모방 객체. 함수 호출 여부, 전달된 매개변수 등을 검증하거나 의존성을 제거하여 특정 동작만 테스트할 때 사용.
<br />
*코드 커버리지: 테스트 시 실제 객체를 대신하여 동작하도록 만든 모방 객체. 함수 호출 여부, 전달된 매개변수 등을 검증하거나 의존성을 제거하여 특정 동작만 테스트할 때 사용.
</i>

## 테스트 구성 요소

> 테스트 구성 요소

테스트는 Jest가 제공하는 API인 `test` 함수로 정의한다. `test` 함수는 두 개의 매개변수를 받는다.

```ts
test(테스트명, 테스트 함수)
```

- 첫 번째 인수에는 테스트 내용을 잘 나타내는 제목을 할당한다.
- 두 번째 인수에는 단언문을 작성한다. 단언문은 검증값이 기대값과 일치하는지 검증하는 문이다.

```ts
test("add: 1 + 2는 3", () => {
  expect(add(1, 2)).toBe(3);
});
```

단언문은 `expect` 함수와 이에 덧붙이는 매처(matcher)로 구성되어 있다. 제스트는 공식적으로 [여러 종류의 _\*매처_](https://jestjs.io/docs/next/expect#matchers)를 제공한다.

- 단언문: `expect(검증값).toBe(기댓값)`
- 매처: `toBe(기댓값)`

<br />

<i>
*매처: 테스트에서 값을 비교하거나 조건을 검증하는 데 사용되는 함수.
</i>

<br />

> 테스트 그룹 작성

연관성 있는 테스트들을 그룹화하고 싶을 때는 [`describe` 함수](https://jestjs.io/docs/next/api#describename-fn)를 사용한다. `describe` 함수는 `test` 함수와 유사하게 `describe(그룹명, 그룹함수)` 형식, 즐 두 개의 매개변수로 구성된다.

> 가장 단순한 테스트

- 구현 파일: [src/03/02/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/02/index.ts)
- 테스트 파일: [src/03/02/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/02/index.test.ts)

테스트는 구현 파일에 작성하지 않고 별도의 파일을 만들어 테스트 대상을(이 예시에서는 `add` 함수) `import`로 불러와서 테스트한다.

## 테스트 실행 방법

> 명령줄 인터페이스로 실행

제스트가 설치된 프로젝트의 `package.json`에 `npm script`를 추가한다. → [Getting Started](https://jestjs.io/docs/getting-started)

- 모든 테스트 파일 실행
  ```bash
  $ npm test
  ```
- 지정된 테스트 파일 실행
  ```bash
  $ npm test 'src/03/02/index/test/ts'
  ```

> 제스트 러너로 실행

VSCode 제스트용 확장 프로그램 - [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner)

설치가 완료되면 테스트와 테스트 그룹 좌측 상단에 `Run | Debug`라는 텍스트가 나타난다. [Run] 버튼을 누르면 해당 테스트 혹은 테스트 그룹이 터미널에서 실행된다.

터미널에서 실행할 파일 경로를 직접 입력할 필요가 없어지므로 테스트 코드 작성에 집중할 수 있다.

### 실행 결과 확인

테스트를 실행하면 프로젝트에 있는 테스트 파일의 실행 결과가 한 줄씩 표시된다.

- 각 행의맨 앞에 `PASS`가 표시되면 해당 파일이 테스트를 통과했다는 것을 뜻한다.
- 실패한 테스트가 있는 경우 해당 테스트 파일의 결과 앞에 `FAIL`이라는 글자가 표시된다.

## 조건 분기

테스트는 테스트할 모듈이 의도(사양)대로 구현됐는지 검증할 때 도움이 된다. 특히 사양이 복잡할수록 조건 분기에서 버그가 많이 생긴다.

> 상한이 있는 덧셈 함수 테스트

- 테스트 파일: [src/03/04/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/04/index.test.ts)

```ts
test("반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {
  expect(add(50, 50)).toBe(100);
});
test("반환값의 상한은 '100'이다", () => {
  expect(add(70, 80)).toBe(100);
});
```

`test` 함수를 사용할 때는 테스트 코드가 어떤 의도로 작성됐으며, 어떤 작업이 포함됐는지 테스트명으로 명확하게 표현해야 한다.

## 에지 케이스와 예외 처리

모듈을 사용할 때 실수 등의 이유로 예상하지 못한 입력값을 보낼 때가 있다. 만약 모듈에 예외 처리를 했다면 예상하지 못한 입력값을 받았을 때 실행 중인 디버거로 문제를 빨리 발견할 수 있다.

> 타입스크립트로 입력값 제약 설정

- 구현 파일: [src/03/04/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/04/index.ts)

타입스크립트를 사용하는 프로젝트는 함수의 매개변수에 *\*타입 애너테이션*을 붙일 수 있다. 타입 애너테이션을 붙일 경우 다른 타입의 값이 할당되면 실행하기 전에 오류가 발생한다.

```ts
export function add(a: number, b: number) {
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

하지만 정적 타입을 붙이는 것만으로는 부족할 때가 있다. 예를 들어 특정 범위로 입력값을 제한하고 싶을 때는 런타임에 예외를 발생시키는 처리를 추가해야 한다.

<br />

<i>
*타입 애너테이션: 변수나 함수의 매개변수에 대해 특정 데이터 타입을 명시하는 것.
</i>

<br />

> 예외 발생시키기

- 구현 파일: [src/03/05/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/05/index.ts)

`add` 함수에 '매개변수 `a`, `b`는 `0`에서 `100`까지 숫자만 받을 수 있다'는 조건을 추가해보자.

타입 애너테이션만으로는 커버할 수 없으며, `add` 함수에 아래와 같은 코드를 추가하면 조건을 충족시킬 수 있다. 수정된 코드는 입력값이 기댓값과 다르면 예외를 발생시켜 값을 반환하기 전에 프로그램을 중지시킨다.

```ts
export function add(a: number, b: number) {
  if (a < 0 || a > 100) {
    throw new Error("0〜100 사이의 값을 입력해주세요");
  }
  if (b < 0 || b > 100) {
    throw new Error("0〜100 사이의 값을 입력해주세요");
  }
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

이처럼 분기를 추가하면 앞서 작성한 테스트는 다음과 같은 메시지를 출력하며 실패한다. 테스트 함수 안에서 처리되지 않은 예외가 발생해도 테스트는 실패한다.

```bash
0〜100 사이의 값을 입력해주세요
```

<br />

> 예외 발생 검증 테스트

```ts
expect(예외가 발생하는 함수).toThrow();
```

예외가 발생하는 함수는 화살표 함수로 감싸서 작성한다.

```ts
// 잘못된 작성법
expect(add(-10, 110)).toThrow();
// 올바른 작성법
expect(() => add(-10, 110)).toThrow();
```

예외가 발생하지 않는 입력값으로 테스트할 경우 실패한다.

```ts
expect(() => add(70, 80)).toThrow();
```

```bash
Received function did not throw

test("예외가 발생하지 않으므로 실패한다.", () => {
  expect(() => add(70, 80)).toThrow();
                            ^
})
```

<br />

> 오류 메시지를 활용한 세부 사항 검증

예외 처리용 매처인 `toThrow`에 인수를 할당하면 예외에 대해 더욱 상세한 내용을 검증할 수 있다.

```ts
throw new Error("0~100 사이의 값을 입력해주세요");
```

```ts
expect(() => add(110, -10)).toThrow("0~100 사이의 값을 입력해주세요"); // 성공
expect(() => add(110, -10)).toThrow("0~1000 사이의 값을 입력해주세요"); // 실패
```

<br />

> instanceof 연산자를 활용한 세부 사항 검증

- 구현 파일: [src/03/05/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/05/index.ts)
- 테스트 파일: [src/03/05/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/05/index.test.ts)

`Error` 클래스를 더욱 쿠페적인 상황에 맞춰 작성해보자. 설계의 폭을 넓힐 수 있다.

`Error`를 `extends` 키워드로 상속받아 생성된 `HttpError`와 `RangeError` 인스턴스틑 `instanceof` 연산자를 사용해서 다른 인스턴스와 구분할 수 있다.

```ts
export class HttpError extends Error {}
export class RangeError extends Error {}

if (err instanceof HttpError) {
  // 발생한 에러가 HttpError인 경우
}
if (err instanceof RangeError) {
  // 발생한 에러가 RangeError인 경우
}
```

상속받은 클래스들을 활용해 입력값을 체크하는 함수를 작성해보자. 인수가 `0~100` 사이의 값이 아니면 `RangeError` 인스턴스를 `throw`하는 함수다.

```ts
function checkRange(value: number) {
  if (value < 0 || value > 100) {
    throw new RangeError("0〜100 사이의 값을 입력해주세요");
  }
}

export function add(a: number, b: number) {
  checkRange(a);
  checkRange(b);
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

`checkRange` 함수에서 사용하는 `RangeError`는 테스트 검증에도 사용할 수 있다. `toThrow` 매처의 인수에는 메시지뿐만 아니라 클래스도 할당이 가능하다. 이와 같이 테스트를 작성하면 발생한 예외가 특정 클래스의 인스턴스인지 검증할 수 있다.

이때 세 번째처럼 `RangeError`의 부모 클래스인 `Error`를 인수로 지정하는 것을 주의해야 한다. 서로 다른 클래스지만 `RangeError`가 `Error`를 상속받은 클래스이므로 테스트가 성공한다.

이 경우에는 오류를 세부적으로 구분하고자 `RangeError`를 만든 것이기 때문에 단언문을 작성할 때 `Error` 대신 `RangeError`를 지정하는 것이 적절하다.

```ts
test("특정 클래스의 인스턴스인지 검증한다", () => {
  // 발생한 예외가 RangeError이므로 실패한다
  expect(() => add(110, -10)).toThrow(HttpError);
  // 발생한 예외가 RangeError이므로 성공한다
  expect(() => add(110, -10)).toThrow(RangeError);
  // 발생한 예외가 Error를 상속받은 클래스이므로 성공한다
  expect(() => add(110, -10)).toThrow(Error);
});
```

## 용도별 매처

- 테스트 파일: [src/03/06/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/06/index.test.ts)

<br />

> 진리값 검증

```ts
describe("진릿값 검증", () => {
  test("참인 진릿값 검증", () => {
    expect(1).toBeTruthy();
    expect("1").toBeTruthy();
    expect(true).toBeTruthy();
    expect(0).not.toBeTruthy();
    expect("").not.toBeTruthy();
    expect(false).not.toBeTruthy();
  });
  test("거짓인 진릿값 검증", () => {
    expect(0).toBeFalsy();
    expect("").toBeFalsy();
    expect(false).toBeFalsy();
    expect(1).not.toBeFalsy();
    expect("1").not.toBeFalsy();
    expect(true).not.toBeFalsy();
  });
  test("null과 undefined 검증", () => {
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect(undefined).not.toBeDefined();
  });
});
```

<br />

> 수치 검증

```ts
describe("수치 검증", () => {
  const value = 2 + 2;
  test("검증값이 기댓값과 일치한다", () => {
    expect(value).toBe(4);
    expect(value).toEqual(4);
  });
  test("검증값이 기댓값보다 크다", () => {
    expect(value).toBeGreaterThan(3); // 4 > 3
    expect(value).toBeGreaterThanOrEqual(4); // 4 >= 4
  });
  test("검증값이 기댓값보다 작다", () => {
    expect(value).toBeLessThan(5); // 4 < 5
    expect(value).toBeLessThanOrEqual(4); // 4 <= 4
  });
  test("소수 계산은 정확하지 않다", () => {
    expect(0.1 + 0.2).not.toBe(0.3);
  });
  test("소수 계산 시 지정한 자릿수까지 비교한다", () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3); // 두 번째 인수의 기본값은 2다.
    expect(0.1 + 0.2).toBeCloseTo(0.3, 15);
    expect(0.1 + 0.2).not.toBeCloseTo(0.3, 16);
  });
});
```

<br />

> 문자열 검증

```ts
describe("문자열 검증", () => {
  const str = "Hello World";
  const obj = { status: 200, message: str };
  test("검증값이 기댓값과 일치한다", () => {
    expect(str).toBe("Hello World");
    expect(str).toEqual("Hello World");
  });
  test("toContain", () => {
    expect(str).toContain("World");
    expect(str).not.toContain("Bye");
  });
  test("toMatch", () => {
    expect(str).toMatch(/World/);
    expect(str).not.toMatch(/Bye/);
  });
  test("toHaveLength", () => {
    expect(str).toHaveLength(11);
    expect(str).not.toHaveLength(12);
  });
  test("stringContaining", () => {
    expect(obj).toEqual({
      status: 200,
      message: expect.stringContaining("World"),
    });
  });
  test("stringMatching", () => {
    expect(obj).toEqual({
      status: 200,
      message: expect.stringMatching(/World/),
    });
  });
});
```

<br />

> 배열 검증

```ts
describe("배열 검증", () => {
  describe("원시형 값들로 구성된 배열", () => {
    const tags = ["Jest", "Storybook", "Playwright", "React", "Next.js"];
    test("toContain", () => {
      expect(tags).toContain("Jest");
      expect(tags).toHaveLength(5);
    });
  });
  describe("객체들로 구성된 배열", () => {
    const article1 = { author: "taro", title: "Testing Next.js" };
    const article2 = { author: "jiro", title: "Storybook play function" };
    const article3 = { author: "hanako", title: "Visual Regression Testing" };
    const articles = [article1, article2, article3];
    test("toContainEqual", () => {
      expect(articles).toContainEqual(article1);
    });
    test("arrayContaining", () => {
      expect(articles).toEqual(expect.arrayContaining([article1, article3]));
    });
  });
});
```

<br />

> 객체 검증

```ts
describe("객체 검증", () => {
  const author = { name: "taroyamada", age: 38 };
  const article = {
    title: "Testing with Jest",
    author,
  };
  test("toMatchObject", () => {
    expect(author).toMatchObject({ name: "taroyamada", age: 38 });
    expect(author).toMatchObject({ name: "taroyamada" });
    expect(author).not.toMatchObject({ gender: "man" });
  });
  test("toHaveProperty", () => {
    expect(author).toHaveProperty("name");
    expect(author).toHaveProperty("age");
  });
  test("objectContaining", () => {
    expect(article).toEqual({
      title: "Testing with Jest",
      author: expect.objectContaining({ name: "taroyamada" }),
    });
    expect(article).toEqual({
      title: "Testing with Jest",
      author: expect.not.objectContaining({ gender: "man" }),
    });
  });
});
```

## 비동기 처리 테스트

- 구현 파일: [src/03/07/index.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/07/index.ts)
- 테스트 파일: [src/03/07/index.test.ts](https://github.com/frontend-testing-book-kr/unittest/blob/main/src/03/07/index.test.ts)

> 테스트할 함수

```ts
export function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(duration);
    }, duration);
  });
}

export function timeout(duration: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(duration);
    }, duration);
  });
}
```

<br />

> Resolve 검증 테스트

```ts
describe("wait", () => {
  test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
    return wait(50).then((duration) => {
      expect(duration).toBe(50);
    });
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
    return expect(wait(50)).resolves.toBe(50);
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
    await expect(wait(50)).resolves.toBe(50);
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
    expect(await wait(50)).toBe(50);
  });
});
```

- Promise를 반환하는 작성법

  1. `Promise`를 반환하면서 `then`에 전달할 함수에 단언문을 작성하는 방법
  2. `resolves` 매처를 사용하여 `wait` 함수가 `resolve` 됐을 때의 값을 검증

- async/await를 활용한 작성법

  3. 테스트 함수를 `async` 함수로 만들고 함수 내에서 `Promise`가 완료될 때까지 기다리는 방법
  4. 검증값인 `Promise`가 완료되는 것을 기다린 뒤 단언문을 실행하는 방법

<br />

> Reject 검증 테스트

```ts
describe("timeout", () => {
  test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
    return timeout(50).catch((duration) => {
      expect(duration).toBe(50);
    });
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
    return expect(timeout(50)).rejects.toBe(50);
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
    expect.assertions(1);
    try {
      await timeout(50);
    } catch (err) {
      expect(err).toBe(50);
    }
  });
});
```

1. `catch` 메서드에 전달할 함수에 단언문을 작성하는 방법
2. `rejects` 매처를 사용하는 단언문을 활용하는 방법
3. `try-catch` 문을 사용하여 `Unhandled Rejection`을 `try` 블록에서 발생시키고, 발생한 오류를 `catch` 블록에서 받아 단언문으로 검증한다.

<br />

> 테스트 결과가 기댓값과 일치하는지 확인하기

아래에는 실수로 작성한 코드가 있다. 테스트는 주석에 적혀 있듯이 실행하고 싶은 단언문에 도달하지 못한 채로 성공하며 종료된다.

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  try {
    await wait(50); // timeout 함수를 사용할 생각이었는데 실수로 wait을 사용했다
    // 에러가 발생하지 않으므로 여기서 종료되면서 테스트는 성공한다
  } catch (err) {
    // 단언문은 실행되지 않는다
    expect(err).toBe(50);
  }
});
```

이와 같은 실수를 하지 않으려면 테스트 함수 첫 줄에 `expect.assertions`를 호출해야 한다.

이 메서드는 실행되어야 하는 단언문의 횟수를 인수로 받아 기대한 횟수만큼 단언문이 호출됐는지 검증한다. 비동기 처리 테스트를 할 때는 첫 번째 줄에 `expect.assertions`를 추가하면 사소한 실수를 줄일 수 있다.

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1); // 단언문이 한 번 실행되는 것을 기대하는 테스트가 된다
  try {
    await wait(50);
    // 단언문이 한 번도 실행되지 않은채로 종료되므로 테스트는 실패한다
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

<br />

> `.resolves`, `.rejects` 매처 사용 시 주의사항

`wait` 함수는 `2000ms`를 기다리면 `2000`을 반환하는 함수이기 때문에 아래 코드는 실패할 것 같지만, 실제로 실행하면 성공한다. 좀 더 정확하게 표현하면 테스트가 성공한 것이 아니라 단언문이 한 번도 평가되지 않고 종료된 것이다.

```ts
test("return하고 있지 않으므로 Promise가 완료되기 전에 테스트가 종료된다", () => {
  // 실패할 것을 기대하고 작성한 단언문
  expect(wait(2000)).resolves.toBe(3000);
  // 올바르게 고치려면 다음 주석처럼 단언문을 return해야 한다
  // return expect(wait(2000)).resolves.toBe(3000);
});
```

주석에 있듯이 비동기 처리를 테스트할 때 테스트 함수가 동기 함수라면 반드시 단언문을 `return`해야 한다. 이 같은 실수를 하지 않으려면 비동기 처리가 포함된 부분을 테스트할 때 다음과 같은 원칙을 가지고 접근해야 한다.

- 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 `async` 함수로 만든다.
- `.resolves`나 `.rejects`가 포함된 단언문은 `await` 한다.
- `try-catch` 문의 예외 발생을 검증할 때는 `expect.assertions`를 사용한다.
