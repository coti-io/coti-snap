import { getSVGfromMetadata } from '../utils/image';

describe('Image Utilities URL validation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('blocks metadata fetch to private IPv4 hosts', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const result = await getSVGfromMetadata('https://169.254.169.254/latest/meta-data');

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('blocks metadata fetch to localhost', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const result = await getSVGfromMetadata('https://localhost:3000/metadata.json');

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('blocks nested image URL when metadata response is malicious', async () => {
    const metadataJson = {
      image: 'https://127.0.0.1:8080/internal.png',
    };
    const metadataResponse = {
      ok: true,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(metadataJson),
    } as unknown as Response;
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(metadataResponse);

    const result = await getSVGfromMetadata('https://example.com/metadata.json');

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/metadata.json',
      expect.any(Object),
    );
  });
});
