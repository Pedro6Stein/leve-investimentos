export interface HttpRequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

export type RequestInterceptor = (config: HttpRequestOptions) => HttpRequestOptions | Promise<HttpRequestOptions>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export class HttpClient {
    private readonly baseURL: string;
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];

    constructor(baseURL: string) {
        if (!baseURL) throw new Error('[HttpClient] Base URL is required.');
        this.baseURL = baseURL;
    }

    public useRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    public useResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    public async request<TResponse>(endpoint: string, options: HttpRequestOptions = {}): Promise<TResponse> {
        let config: HttpRequestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // Executa interceptors de requisição (Ex: injeção dinâmica de JWT)
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }

        try {
            let response = await fetch(`${this.baseURL}${endpoint}`, config);

            // Executa interceptors de resposta (Ex: captura de 401 Global)
            for (const interceptor of this.responseInterceptors) {
                response = await interceptor(response);
            }

            // Tratamento explícito de Status Codes fora da faixa de sucesso
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new HttpError(response.status, errorData.error || 'Request failed', errorData.details);
            }

            // Evita erro de parsing em respostas 204 (No Content)
            if (response.status === 204) {
                return {} as TResponse;
            }

            return await response.json() as TResponse;
        } catch (error) {
            if (error instanceof HttpError) throw error;
            throw new Error(`[Network Error] Falha ao comunicar com ${endpoint}: ${(error as Error).message}`);
        }
    }

    public get<T>(endpoint: string, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public post<T>(endpoint: string, body: unknown, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }

    public patch<T>(endpoint: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
    }
}

// Custom Error para tipagem forte de exceções HTTP
export class HttpError extends Error {
    constructor(
        public status: number, 
        public message: string, 
        public details?: any
    ) {
        super(message);
        this.name = 'HttpError';
    }
}