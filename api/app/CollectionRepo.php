<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Database;
use LeadFarmer\Lib\Response;

/**
 * Generic CRUD for the "simple" repeatable tables — dispensaries, articles,
 * story sections, story stats. Each resource declares its table, its writable
 * columns and how rows map to/from JSON; everything else is shared.
 *
 * Column names always come from the whitelist below, never from request data,
 * so a client cannot write to a column the resource did not declare
 * (no mass-assignment) and cannot inject SQL through a field name.
 */
final class CollectionRepo
{
    /**
     * Writable columns per resource, and the JSON key each maps to.
     * Image columns are listed so their URLs get resolved on the way out.
     *
     * @var array<string,array{table:string,columns:array<string,string>,order:string,images:array<string,string>}>
     */
    private const RESOURCES = [
        // Ordering is alphabetical, not manual: regions A–Z, then shops A–Z
        // within each region. Nothing for the client to arrange by hand.
        'dispensaries' => [
            'table'   => 'dispensaries',
            'columns' => [
                'name'         => 'name',
                'location'     => 'location',
                'region'       => 'region',
                'website_url'  => 'websiteUrl',
                'is_published' => 'isPublished',
            ],
            'order'  => 'region ASC, name ASC, id ASC',
            'images' => [],
        ],
        'articles' => [
            'table'   => 'articles',
            'columns' => [
                'slug'         => 'slug',
                'title'        => 'title',
                'excerpt'      => 'excerpt',
                'published_on' => 'publishedOn',
                'image_src'    => 'imageSrc',
                'image_alt'    => 'imageAlt',
                'external_url' => 'externalUrl',
                'sort_order'   => 'sortOrder',
                'is_published' => 'isPublished',
            ],
            'order'  => 'sort_order ASC, id ASC',
            'images' => ['image_src' => 'imageUrl'],
        ],
        'story-sections' => [
            'table'   => 'story_sections',
            'columns' => [
                'eyebrow'      => 'eyebrow',
                'heading'      => 'heading',
                'body'         => 'body',
                'image_src'    => 'imageSrc',
                'image_alt'    => 'imageAlt',
                'sort_order'   => 'sortOrder',
                'is_published' => 'isPublished',
            ],
            'order'  => 'sort_order ASC, id ASC',
            'images' => ['image_src' => 'imageUrl'],
        ],
        'gallery' => [
            'table'   => 'gallery_images',
            'columns' => [
                'image_src'    => 'imageSrc',
                'image_alt'    => 'imageAlt',
                'caption'      => 'caption',
                'sort_order'   => 'sortOrder',
                'is_published' => 'isPublished',
            ],
            'order'  => 'sort_order ASC, id ASC',
            'images' => ['image_src' => 'imageUrl'],
        ],
        'story-stats' => [
            'table'   => 'story_stats',
            'columns' => [
                'value'         => 'value',
                'label'         => 'label',
                'auto_source'   => 'autoSource',
                'is_text_style' => 'isTextStyle',
                'sort_order'    => 'sortOrder',
                'is_published'  => 'isPublished',
            ],
            'order'  => 'sort_order ASC, id ASC',
            'images' => [],
        ],
    ];

    private const BOOLEAN_COLUMNS = ['is_published', 'is_text_style'];

    public static function isKnown(string $resource): bool
    {
        return array_key_exists($resource, self::RESOURCES);
    }

    /** @return array{table:string,columns:array<string,string>,order:string,images:array<string,string>} */
    private static function config(string $resource): array
    {
        if (!self::isKnown($resource)) {
            Response::notFound("Unknown resource: {$resource}");
        }

        return self::RESOURCES[$resource];
    }

    /**
     * @return list<array<string,mixed>>
     */
    public static function all(string $resource, bool $publishedOnly = false): array
    {
        $config = self::config($resource);

        $sql = "SELECT * FROM {$config['table']}";
        if ($publishedOnly && array_key_exists('is_published', $config['columns'])) {
            $sql .= ' WHERE is_published = 1';
        }
        $sql .= " ORDER BY {$config['order']}";

        return array_map(
            static fn (array $row): array => self::toJson($row, $config),
            Database::all($sql)
        );
    }

    /** @return array<string,mixed>|null */
    public static function find(string $resource, int $id): ?array
    {
        $config = self::config($resource);
        $row = Database::one("SELECT * FROM {$config['table']} WHERE id = :id LIMIT 1", ['id' => $id]);

        return $row === null ? null : self::toJson($row, $config);
    }

    /**
     * @param array<string,mixed> $config
     * @return array<string,mixed>
     */
    private static function toJson(array $row, array $config): array
    {
        $json = ['id' => (int) $row['id']];

        foreach ($config['columns'] as $column => $jsonKey) {
            $value = $row[$column] ?? null;

            if (in_array($column, self::BOOLEAN_COLUMNS, true)) {
                $json[$jsonKey] = (bool) $value;
                continue;
            }

            if (in_array($column, ['sort_order', 'region_order'], true)) {
                $json[$jsonKey] = (int) $value;
                continue;
            }

            $json[$jsonKey] = $value === null ? null : (string) $value;
        }

        foreach ($config['images'] as $column => $jsonKey) {
            $json[$jsonKey] = Media::url($row[$column] !== null ? (string) $row[$column] : null);
        }

        return $json;
    }

    /**
     * @param array<string,mixed> $data Validated JSON-keyed values.
     */
    public static function create(string $resource, array $data): int
    {
        $config = self::config($resource);
        $columns = self::mapToColumns($config, $data);

        if (!array_key_exists('sort_order', $columns) && array_key_exists('sort_order', $config['columns'])) {
            $next = Database::one("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM {$config['table']}");
            $columns['sort_order'] = (int) ($next['next'] ?? 1);
        }

        $names = implode(', ', array_keys($columns));
        $binds = implode(', ', array_map(static fn (string $c): string => ':' . $c, array_keys($columns)));

        Database::run("INSERT INTO {$config['table']} ({$names}) VALUES ({$binds})", $columns);

        return Database::lastInsertId();
    }

    /** @param array<string,mixed> $data */
    public static function update(string $resource, int $id, array $data): bool
    {
        $config = self::config($resource);
        $columns = self::mapToColumns($config, $data);

        if ($columns === []) {
            return false;
        }

        $assignments = implode(', ', array_map(static fn (string $c): string => "{$c} = :{$c}", array_keys($columns)));
        Database::run("UPDATE {$config['table']} SET {$assignments} WHERE id = :id", $columns + ['id' => $id]);

        return true;
    }

    public static function delete(string $resource, int $id): bool
    {
        $config = self::config($resource);
        return Database::run("DELETE FROM {$config['table']} WHERE id = :id", ['id' => $id])->rowCount() > 0;
    }

    /** @param list<int> $orderedIds */
    public static function reorder(string $resource, array $orderedIds): void
    {
        $config = self::config($resource);

        if (!array_key_exists('sort_order', $config['columns'])) {
            Response::error(400, 'not_reorderable', 'This list cannot be reordered.');
        }

        Database::transaction(static function () use ($config, $orderedIds): void {
            foreach (array_values($orderedIds) as $index => $id) {
                Database::run(
                    "UPDATE {$config['table']} SET sort_order = :sort_order WHERE id = :id",
                    ['sort_order' => $index, 'id' => (int) $id]
                );
            }
        });
    }

    /**
     * Maps JSON keys back to their whitelisted column names, dropping anything
     * the resource did not declare.
     *
     * @param array<string,mixed> $config
     * @param array<string,mixed> $data
     * @return array<string,mixed>
     */
    private static function mapToColumns(array $config, array $data): array
    {
        $columns = [];

        foreach ($config['columns'] as $column => $jsonKey) {
            if (!array_key_exists($jsonKey, $data)) {
                continue;
            }

            $value = $data[$jsonKey];

            if (in_array($column, self::BOOLEAN_COLUMNS, true)) {
                $columns[$column] = $value ? 1 : 0;
                continue;
            }

            $columns[$column] = $value === '' && !in_array($column, ['name', 'title', 'heading', 'label', 'location', 'region', 'value'], true)
                ? null
                : $value;
        }

        return $columns;
    }
}
