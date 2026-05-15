import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Simulating the GateService based on README instructions
const GateService = {
  async openGate(token: string, baseUrl: string) {
    const response = await axios.post(`${baseUrl}/open`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('GateService', () => {
  const MOCK_TOKEN = 'test_esp32_token';
  const MOCK_BASE_URL = 'http://esp32.local';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully trigger the ESP32 relay', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { status: 'opened' } });

    const result = await GateService.openGate(MOCK_TOKEN, MOCK_BASE_URL);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/open`,
      {},
      { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
    );
    expect(result.status).toBe('opened');
  });

  it('should throw an error when the ESP32 is unreachable', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(GateService.openGate(MOCK_TOKEN, MOCK_BASE_URL))
      .rejects.toThrow('Network Error');
  });
});
