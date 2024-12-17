import type { DefaultTheme } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

const breakpoints = ['600px', '768px', '992px'];

/**
 * Common theme properties.
 */
const theme = {
  fonts: {
    default: 'Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    code: 'ui-monospace,Menlo,Monaco,"Cascadia Mono","Segoe UI Mono","Roboto Mono","Oxygen Mono","Ubuntu Monospace","Source Code Pro","Fira Mono","Droid Sans Mono","Courier New", monospace',
  },
  fontSizes: {
    heading: '18px',
    title: '2.4rem',
    large: '2rem',
    text: '14px',
    small: '12px',
  },
  radii: {
    default: '10px',
    buttonSmall: '16px',
    button: '48px',
  },
  breakpoints,
  mediaQueries: {
    small: `@media screen and (max-width: ${breakpoints[0] as string})`,
    medium: `@media screen and (min-width: ${breakpoints[1] as string})`,
    large: `@media screen and (min-width: ${breakpoints[2] as string})`,
  },
  shadows: {
    default: '0px 0px 0px rgba(0, 0, 0, 0.08)',
  },
};

/**
 * Light theme color properties.
 */
export const light: DefaultTheme = {
  colors: {
    background: {
      default: '#F8F8FA',
      content: '#FFFFFF',
    },
    icon: {
      default: '#141618',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#131313',
      link: '#0EB592',
    },
    primary: {
      default: '#0EB592',
      hover: '#0C8A6F',
      inverse: '#FFFFFF',
    },
    secondary: {
      default100: '#11DEB3',
      default10: 'rgba(14, 181, 146, 0.1)',
    },
    card: {
      default: '#FFFFFF',
    },
    error: {
      default: '#F86E6E',
      default10: 'rgba(248, 110, 110, 0.3)',
      hover: 'rgba(248, 110, 110, 0.4)',
    },
  },
  ...theme,
};

/**
 * Dark theme color properties
 */
export const dark: DefaultTheme = {
  colors: {
    background: {
      default: '#041C41',
      content: '#11284B',
    },
    icon: {
      default: '#FFFFFF',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#FFFFFF',
      link: '#0EB592',
    },
    primary: {
      default: '#0EB592',
      inverse: '#FFFFFF',
    },
    secondary: {
      default100: '#11DEB3',
      default10: 'rgba(14, 181, 146, 0.1)',
    },
    card: {
      default: '#11284B',
    },
    error: {
      default: '#F86E6E',
      default10: 'rgba(248, 110, 110, 0.3)',
      hover: 'rgba(248, 110, 110, 0.4)',
    },
  },
  ...theme,
};

/**
 * Default style applied to the app.
 *
 * @param props - Styled Components props.
 * @returns Global style React component.
 */
export const GlobalStyle = createGlobalStyle`
  html {
    /* 62.5% of the base size of 16px = 10px.*/
    font-size: 62.5%;
  }

  body {
    background-color: ${(props) => props.theme.colors.background?.default};
    color: ${(props) => props.theme.colors.text?.default};
    font-family: ${(props) => props.theme.fonts.default};
    font-size: ${(props) => props.theme.fontSizes.text};
    margin: 0;
  }

  * {
    transition: background-color .1s linear;
  }

  h1, h2, h3, h4, h5, h6 {
    font-size: ${(props) => props.theme.fontSizes.heading};
    ${(props) => props.theme.mediaQueries.small} {
      font-size: ${(props) => props.theme.fontSizes.mobileHeading};
    }
  }

  code {
    background-color: ${(props) => props.theme.colors.background?.alternative};
    font-family: ${(props) => props.theme.fonts.code};
    padding: 1.2rem;
    font-weight: normal;
    font-size: ${(props) => props.theme.fontSizes.text};
  }

  button {
    font-size: ${(props) => props.theme.fontSizes.small};
    border-radius: ${(props) => props.theme.radii.button};
    background-color: ${(props) => props.theme.colors.background?.inverse};
    color: ${(props) => props.theme.colors.text?.inverse};
    border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    font-weight:semi-bold;
    padding: 1rem;
    min-height: 4.2rem;
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:hover {
      background-color: transparent;
      border: 1px solid ${(props) => props.theme.colors.background?.inverse};
      color: ${(props) => props.theme.colors.text?.default};
    }

    &:disabled,
    &[disabled] {
      border: 1px solid ${(props) => props.theme.colors.background?.inverse};
      cursor: not-allowed;
    }

    &:disabled:hover,
    &[disabled]:hover {
      background-color: ${(props) => props.theme.colors.background?.inverse};
      color: ${(props) => props.theme.colors.text?.inverse};
      border: 1px solid ${(props) => props.theme.colors.background?.inverse};
    }
  }
`;
