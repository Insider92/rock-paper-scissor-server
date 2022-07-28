/* eslint-disable @typescript-eslint/ban-types*/
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};
