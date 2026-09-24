<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Minimal path router with `{param}` placeholders.
 *
 *     $router->get('/strains/{slug}', fn(Request $r, array $p) => ...);
 *
 * Reusable across projects.
 */
final class Router
{
    /** @var list<array{method:string,pattern:string,regex:string,params:list<string>,handler:callable}> */
    private array $routes = [];

    public function get(string $pattern, callable $handler): void
    {
        $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): void
    {
        $this->add('POST', $pattern, $handler);
    }

    public function put(string $pattern, callable $handler): void
    {
        $this->add('PUT', $pattern, $handler);
    }

    public function delete(string $pattern, callable $handler): void
    {
        $this->add('DELETE', $pattern, $handler);
    }

    private function add(string $method, string $pattern, callable $handler): void
    {
        $params = [];
        $regex = preg_replace_callback(
            '/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/',
            function (array $m) use (&$params): string {
                $params[] = $m[1];
                return '([^/]+)';
            },
            $pattern
        );

        $this->routes[] = [
            'method'  => $method,
            'pattern' => $pattern,
            'regex'   => '#^' . $regex . '$#',
            'params'  => $params,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): never
    {
        $allowedForPath = [];

        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $request->path, $matches)) {
                continue;
            }

            if ($route['method'] !== $request->method) {
                $allowedForPath[] = $route['method'];
                continue;
            }

            array_shift($matches);
            $params = [];
            foreach ($route['params'] as $index => $name) {
                $params[$name] = rawurldecode((string) ($matches[$index] ?? ''));
            }

            ($route['handler'])($request, $params);
            // Handlers always terminate via Response::*; this is a safety net.
            Response::ok();
        }

        if ($allowedForPath !== []) {
            header('Allow: ' . implode(', ', array_unique($allowedForPath)));
            Response::error(405, 'method_not_allowed', 'That action is not supported on this endpoint.');
        }

        Response::notFound('Unknown API endpoint: ' . $request->path);
    }
}
