export function extractApiDetail(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: {
        data?: {
          detail?: string;
          title?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    if (err.response?.data?.detail) return err.response.data.detail;
    if (err.response?.data?.title) return err.response.data.title;
    if (err.response?.data?.errors) {
      const first = Object.values(err.response.data.errors)[0];
      if (first && first.length > 0) return first[0];
    }
  }
  return null;
}
