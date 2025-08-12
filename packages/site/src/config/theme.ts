import type { DefaultTheme } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

import SofiaProBold from '../fonts/SofiaProBold.otf';
import SofiaProMedium from '../fonts/SofiaProMedium.otf';
import SofiaProRegular from '../fonts/SofiaProRegular.otf';
import SofiaProSemiBold from '../fonts/SofiaProSemiBold.otf';

const breakpoints = ['600px', '768px', '992px'];

/**
 * Common theme properties.
 */
const theme = {
  fonts: {
    default:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    code: 'ui-monospace,Menlo,Monaco,"Cascadia Mono","Segoe UI Mono","Roboto Mono","Oxygen Mono","Ubuntu Monospace","Source Code Pro","Fira Mono","Droid Sans Mono","Courier New", monospace',
  },
  fontSizes: {
    heading: '5.2rem',
    mobileHeading: '3.6rem',
    title: '2rem',
    large: '1.7rem',
    text: '1.6rem',
    small: '1.6rem',
  },
  lineHeights: {
    heading: '1.2',
    title: '1.5',
    text: '1.5',
  },
  radii: {
    default: '10px',
    small: '16px',
    button: '48px',
  },
  breakpoints,
  mediaQueries: {
    small: `@media screen and (max-width: ${breakpoints[0] as string})`,
    medium: `@media screen and (min-width: ${breakpoints[1] as string})`,
    large: `@media screen and (min-width: ${breakpoints[2] as string})`,
  },
  shadows: {
    default: '0px 7px 42px rgba(0, 0, 0, 0.1)',
    button: '0px 0px 16.1786px rgba(0, 0, 0, 0.15);',
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
      alternative: '#F0F0F0',
      inverse: '#131313',
      default10: 'rgba(255, 255, 255, 0.1)',
    },
    icon: {
      default: '#141618',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#131313',
      link: '#0EB592',
      inverse: '#FFFFFF',
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
      alternative: '#1E3A5F',
      inverse: '#FFFFFF',
      default10: 'rgba(17, 40, 75, 0.1)',
    },
    icon: {
      default: '#FFFFFF',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#FFFFFF',
      link: '#0EB592',
      inverse: '#041C41',
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

@font-face {
  font-family: 'Sofia Pro';
  src: url(${SofiaProRegular}) format('opentype'), url(${SofiaProMedium}) format('opentype'), local('Sofia Pro'), url(${SofiaProSemiBold}) format('opentype'), url(${SofiaProBold}) format('opentype');
  font-weight: 400,500,600,700;
  font-style: normal;
}

  html {
    /* 62.5% of the base size of 16px = 10px.*/
    font-size: 62.5%;
  }

  body {
    background: transparent;
    color: #FFFFFF;
    //font-family: ${(props) => props.theme.fonts.default};
    font-family: "Sofia Pro";
    font-size: ${(props) => props.theme.fontSizes.text};
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  html {
    margin: 0;
    padding: 0;
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
    font-family: "Sofia Pro";
  }

  * {
    color: #FFFFFF;
  }

  p, h1, h2, h3, h4, h5, h6, span, div, a {
    color: #FFFFFF !important;
  }
`;
