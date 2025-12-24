export const getSVGfromMetadata = async (
  url: string,
): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const responseJson = await response.json();
    if (!responseJson.image) {
      throw new Error(`No image found in metadata`);
    }

    const imageResponse = await fetch(responseJson.image);
    const blob = await imageResponse.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = blob.type;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">
        <image href="data:${mimeType};base64,${base64}" width="200" height="200"/>
      </svg>
    `;
  } catch {
    return null;
  }
};

/**
 * Generates an SVG avatar with the first letter of the token symbol
 * @param symbol - The token symbol
 * @returns SVG string with gray background and first letter
 */
export const generateTokenAvatar = (symbol: string): string => {
  const firstLetter = symbol.charAt(0).toUpperCase();
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="16" fill="#CCCCCC"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="400" fill="#000000" text-anchor="middle" dominant-baseline="central">${firstLetter}</text>
    </svg>
  `;
};
