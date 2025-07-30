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
