/**
 * Normalized error shape for every failure that crosses the API boundary,
 * regardless of whether it came from axios, a timeout, or a malformed payload.
 * Catch this type in UI code instead of inspecting raw axios errors.
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly cause?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.cause = options?.cause;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { error?: string; message?: string } };
        message?: string;
      };
      return new ApiError(
        axiosError.response?.data?.error ?? axiosError.message ?? 'Network request failed',
        { status: axiosError.response?.status, cause: error }
      );
    }

    return new ApiError(error instanceof Error ? error.message : 'Unknown error', {
      cause: error,
    });
  }
}
