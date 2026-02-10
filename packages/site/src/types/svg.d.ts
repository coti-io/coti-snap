/* eslint-disable import-x/unambiguous */

declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';

  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;

  const content: string;
  export default content;
}
