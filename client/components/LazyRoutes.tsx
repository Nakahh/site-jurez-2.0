import {
  lazy,
  Suspense,
  Component,
  ErrorInfo,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

// Enhanced error types
interface LoadingError extends Error {
  code?: string;
  chunk?: string;
  retry?: () => void;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  exponentialBackoff: true,
};

// Performance metrics
interface LoadMetrics {
  startTime: number;
  endTime?: number;
  retryCount: number;
  error?: string;
  componentName: string;
}

// Global metrics store
const loadMetrics: LoadMetrics[] = [];

// Enhanced loading component with progress indication
export const PageLoader = ({
  className,
  message = "Carregando página...",
  showProgress = true,
  timeout = 15000,
}: {
  className?: string;
  message?: string;
  showProgress?: boolean;
  timeout?: number;
}) => {
  const [progress, setProgress] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    const timeoutTimer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutTimer);
    };
  }, [showProgress, timeout]);

  if (isTimedOut) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-background",
          className,
        )}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tempo limite excedido
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              A página está demorando mais que o esperado para carregar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background",
        className,
      )}
    >
      <div className="text-center max-w-sm mx-auto p-6">
        {/* Logo/Branding */}
        <div className="mb-8">
          <img
            src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150"
            alt="Siqueira Campos Imóveis"
            className="h-12 w-auto mx-auto mb-4 dark:hidden"
          />
          <img
            src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=150"
            alt="Siqueira Campos Imóveis"
            className="hidden h-12 w-auto mx-auto mb-4 dark:block"
          />
        </div>

        {/* Loading Animation */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            {/* Inner pulse */}
            <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-muted-foreground font-medium">{message}</p>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Performance info for development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-xs text-muted-foreground">
            {showProgress && `${Math.round(progress)}% • `}
            {loadMetrics.length > 0 &&
              `${loadMetrics.length} componentes carregados`}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Error Boundary with retry capabilities
interface ErrorBoundaryState {
  hasError: boolean;
  error?: LoadingError;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class LazyErrorBoundary extends Component<
  {
    children: ReactNode;
    componentName?: string;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  },
  ErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: LoadingError,
  ): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: LoadingError, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error with metrics
    console.error(
      `LazyErrorBoundary caught error in ${this.props.componentName}:`,
      error,
    );
    console.error("Error info:", errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Track error metrics
    const metrics: LoadMetrics = {
      startTime: Date.now(),
      retryCount: this.state.retryCount,
      error: error.message,
      componentName: this.props.componentName || "Unknown",
    };
    loadMetrics.push(metrics);
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount >= RETRY_CONFIG.maxRetries) {
      return; // Max retries reached
    }

    const delay = RETRY_CONFIG.exponentialBackoff
      ? Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay,
        )
      : RETRY_CONFIG.baseDelay;

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: retryCount + 1,
    });

    // Reload the page as a last resort for chunk loading errors
    if (this.state.error?.name === "ChunkLoadError") {
      this.retryTimeout = setTimeout(() => {
        window.location.reload();
      }, delay);
    }
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;
      const canRetry = retryCount < RETRY_CONFIG.maxRetries;
      const isChunkError =
        error?.name === "ChunkLoadError" ||
        error?.message?.includes("Loading chunk");

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-lg mx-auto">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Details */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isChunkError ? "Erro de Carregamento" : "Erro Inesperado"}
            </h2>

            <p className="text-muted-foreground mb-6">
              {isChunkError
                ? "Houve um problema ao carregar esta página. Isso pode acontecer após atualizações do sistema."
                : "Ocorreu um erro inesperado. Nossa equipe foi notificada."}
            </p>

            {/* Error Code/Details */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                <h4 className="font-semibold mb-2">Detalhes técnicos:</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Componente:</strong>{" "}
                  {this.props.componentName || "Desconhecido"}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Tentativas:</strong> {retryCount}/
                  {RETRY_CONFIG.maxRetries}
                </p>
                {error && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Erro:</strong> {error.message}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Tentar Novamente ({RETRY_CONFIG.maxRetries - retryCount}{" "}
                  restantes)
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors font-medium"
              >
                Recarregar Página
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="bg-muted text-muted-foreground px-6 py-3 rounded-md hover:bg-muted/90 transition-colors font-medium"
              >
                Ir para Início
              </button>
            </div>

            {/* Performance Metrics for Development */}
            {process.env.NODE_ENV === "development" &&
              loadMetrics.length > 0 && (
                <div className="mt-8 p-4 bg-muted rounded-lg text-left">
                  <h4 className="font-semibold mb-2">
                    Métricas de Performance:
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Total de componentes carregados: {loadMetrics.length}</p>
                    <p>
                      Média de tentativas:{" "}
                      {(
                        loadMetrics.reduce((acc, m) => acc + m.retryCount, 0) /
                        loadMetrics.length
                      ).toFixed(1)}
                    </p>
                    <p>
                      Componentes com erro:{" "}
                      {loadMetrics.filter((m) => m.error).length}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced lazy loading with retry mechanism
const createRobustLazyComponent = (
  importFunc: () => Promise<any>,
  componentName: string,
  preload: boolean = false,
) => {
  // Create lazy component with enhanced error handling
  const LazyComponent = lazy(() => {
    const startTime = Date.now();

    return importFunc()
      .then((module) => {
        // Track successful load
        const metrics: LoadMetrics = {
          startTime,
          endTime: Date.now(),
          retryCount: 0,
          componentName,
        };
        loadMetrics.push(metrics);

        return module;
      })
      .catch((error) => {
        // Enhanced error for chunk loading issues
        if (
          error.name === "ChunkLoadError" ||
          error.message?.includes("Loading chunk")
        ) {
          const enhancedError = new Error(
            `Failed to load ${componentName}: ${error.message}`,
          ) as LoadingError;
          enhancedError.name = "ChunkLoadError";
          enhancedError.code = "CHUNK_LOAD_ERROR";
          enhancedError.chunk = componentName;
          throw enhancedError;
        }
        throw error;
      });
  });

  // Preload component if requested
  if (preload && typeof window !== "undefined") {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFunc().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  // Return wrapped component with error boundary
  return (props: any) => (
    <LazyErrorBoundary
      componentName={componentName}
      onError={(error, errorInfo) => {
        // Send error to monitoring service in production
        if (process.env.NODE_ENV === "production") {
          // Integration with error monitoring service would go here
          console.error("Production error in lazy component:", {
            componentName,
            error,
            errorInfo,
          });
        }
      }}
    >
      <Suspense
        fallback={<PageLoader message={`Carregando ${componentName}...`} />}
      >
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Main page components - preload critical routes
export const LazyIndex = createRobustLazyComponent(
  () => import("../pages/Index"),
  "Página Inicial",
  true,
);

export const LazyLogin = createRobustLazyComponent(
  () => import("../pages/Login"),
  "Login",
  true,
);

// Secondary pages
export const LazySobre = createRobustLazyComponent(
  () => import("../pages/Sobre"),
  "Sobre Nós",
);

export const LazyContato = createRobustLazyComponent(
  () => import("../pages/Contato"),
  "Contato",
);

export const LazySimulador = createRobustLazyComponent(
  () => import("../pages/Simulador"),
  "Simulador",
);

export const LazyDesenvolvedor = createRobustLazyComponent(
  () => import("../pages/Desenvolvedor"),
  "Desenvolvedor",
);

export const LazyBlog = createRobustLazyComponent(
  () => import("../pages/Blog"),
  "Blog",
);

export const LazyImoveis = createRobustLazyComponent(
  () => import("../pages/Imoveis"),
  "Imóveis",
  true, // Preload as it's a main feature
);

export const LazyImovel = createRobustLazyComponent(
  () => import("../pages/Imovel"),
  "Detalhes do Imóvel",
);

export const LazyComparador = createRobustLazyComponent(
  () => import("../pages/Comparador"),
  "Comparador",
);

// Dashboard components - preload for authenticated users
export const LazyCorretorDashboard = createRobustLazyComponent(
  () => import("../pages/dashboards/CorretorDashboard"),
  "Dashboard Corretor",
  true,
);

export const LazyAdminDashboard = createRobustLazyComponent(
  () => import("../pages/dashboards/AdminDashboard"),
  "Dashboard Admin",
  true,
);

export const LazyClienteDashboard = createRobustLazyComponent(
  () => import("../pages/dashboards/ClienteDashboard"),
  "Dashboard Cliente",
  true,
);

export const LazyMarketingDashboard = createRobustLazyComponent(
  () => import("../pages/dashboards/MarketingDashboard"),
  "Dashboard Marketing",
);

export const LazyDesenvolvedorDashboard = createRobustLazyComponent(
  () => import("../pages/dashboards/DesenvolvedorDashboard"),
  "Dashboard Desenvolvedor",
);

export const LazyNotFound = createRobustLazyComponent(
  () => import("../pages/NotFound"),
  "Página Não Encontrada",
);

// Performance monitoring utility
export const getLoadMetrics = () => [...loadMetrics];

export const clearLoadMetrics = () => {
  loadMetrics.length = 0;
};

// Preload strategy for route prediction
export const preloadRoute = (routeName: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    index: () => import("../pages/Index"),
    login: () => import("../pages/Login"),
    imoveis: () => import("../pages/Imoveis"),
    "dashboard-corretor": () => import("../pages/dashboards/CorretorDashboard"),
    "dashboard-admin": () => import("../pages/dashboards/AdminDashboard"),
    "dashboard-cliente": () => import("../pages/dashboards/ClienteDashboard"),
  };

  const importFunc = componentMap[routeName];
  if (importFunc) {
    importFunc().catch(() => {
      // Ignore preload errors
    });
  }
};

// Export error boundary for direct use
export { LazyErrorBoundary };
