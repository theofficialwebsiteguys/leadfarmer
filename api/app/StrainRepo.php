<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Database;

/**
 * Strains and their photos.
 *
 * Scope note: a strain is deliberately just a name, a short description and
 * photos. The growing details, tasting notes, formats and badges were dropped
 * when the page sections that displayed them were removed — the admin panel
 * should not collect information that never appears on the site.
 */
final class StrainRepo
{
    public const IMAGE_KINDS = ['main', 'gallery', 'packaging'];

    /**
     * @return list<array<string,mixed>>
     */
    public static function all(bool $publishedOnly = true): array
    {
        $sql = 'SELECT * FROM strains';
        if ($publishedOnly) {
            $sql .= ' WHERE is_published = 1';
        }
        $sql .= ' ORDER BY sort_order ASC, id ASC';

        $strains = Database::all($sql);
        if ($strains === []) {
            return [];
        }

        $ids = array_map(static fn (array $s): int => (int) $s['id'], $strains);
        $images = self::imagesByStrain($ids);

        return array_map(
            static fn (array $row): array => self::hydrate($row, $images),
            $strains
        );
    }

    /** @return array<string,mixed>|null */
    public static function findBySlug(string $slug, bool $publishedOnly = true): ?array
    {
        $sql = 'SELECT * FROM strains WHERE slug = :slug';
        if ($publishedOnly) {
            $sql .= ' AND is_published = 1';
        }

        $row = Database::one($sql . ' LIMIT 1', ['slug' => $slug]);
        return $row === null ? null : self::hydrate($row, self::imagesByStrain([(int) $row['id']]));
    }

    /** @return array<string,mixed>|null */
    public static function findById(int $id): ?array
    {
        $row = Database::one('SELECT * FROM strains WHERE id = :id LIMIT 1', ['id' => $id]);
        return $row === null ? null : self::hydrate($row, self::imagesByStrain([$id]));
    }

    /**
     * All photos for the given strains in one query, grouped by strain id —
     * avoids an N+1 query per strain on the catalog page.
     *
     * @param list<int> $strainIds
     * @return array<int,list<array<string,mixed>>>
     */
    private static function imagesByStrain(array $strainIds): array
    {
        if ($strainIds === []) {
            return [];
        }

        // Ids are bound; the table and ordering are internal constants.
        $placeholders = implode(',', array_fill(0, count($strainIds), '?'));
        $rows = Database::all(
            "SELECT * FROM strain_images WHERE strain_id IN ({$placeholders}) ORDER BY sort_order ASC, id ASC",
            $strainIds
        );

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[(int) $row['strain_id']][] = $row;
        }

        return $grouped;
    }

    /**
     * @param array<int,list<array<string,mixed>>> $images
     * @return array<string,mixed>
     */
    private static function hydrate(array $row, array $images): array
    {
        $id = (int) $row['id'];

        $mainImage = null;
        $gallery = [];
        $packaging = [];

        foreach ($images[$id] ?? [] as $image) {
            $shaped = [
                'id'    => (int) $image['id'],
                'src'   => Media::url((string) $image['src']),
                'path'  => (string) $image['src'],
                'alt'   => (string) $image['alt'],
                'label' => $image['label'] !== null && $image['label'] !== '' ? (string) $image['label'] : null,
            ];

            match ((string) $image['image_kind']) {
                'main'      => $mainImage ??= $shaped,
                'packaging' => $packaging[] = $shaped,
                default     => $gallery[] = $shaped,
            };
        }

        return [
            'id'               => $id,
            'slug'             => (string) $row['slug'],
            'name'             => (string) $row['name'],
            'shortDescription' => (string) ($row['short_description'] ?? ''),
            'featured'         => (bool) $row['featured'],
            'isPublished'      => (bool) $row['is_published'],
            'releaseDate'      => $row['release_date'] !== null ? (string) $row['release_date'] : null,
            'sortOrder'        => (int) $row['sort_order'],
            'mainImage'        => $mainImage,
            'galleryImages'    => $gallery,
            'packagingImages'  => $packaging,
        ];
    }

    /**
     * Creates or updates a strain and replaces its photos, inside a single
     * transaction so a partial save can never be observed.
     *
     * @param array<string,mixed> $data Already validated by the route handler.
     */
    public static function save(?int $id, array $data): int
    {
        return (int) Database::transaction(static function () use ($id, $data): int {
            $columns = [
                'slug'              => $data['slug'],
                'name'              => $data['name'],
                'short_description' => $data['shortDescription'],
                'featured'          => $data['featured'] ? 1 : 0,
                'is_published'      => $data['isPublished'] ? 1 : 0,
                'release_date'      => $data['releaseDate'],
            ];

            if ($id === null) {
                $next = Database::one('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM strains');
                $columns['sort_order'] = (int) ($next['next'] ?? 1);

                $names = implode(', ', array_keys($columns));
                $binds = implode(', ', array_map(static fn (string $c): string => ':' . $c, array_keys($columns)));
                Database::run("INSERT INTO strains ({$names}) VALUES ({$binds})", $columns);
                $id = Database::lastInsertId();
            } else {
                $assignments = implode(', ', array_map(static fn (string $c): string => "{$c} = :{$c}", array_keys($columns)));
                Database::run("UPDATE strains SET {$assignments} WHERE id = :id", $columns + ['id' => $id]);
            }

            self::replaceImages($id, $data);

            return $id;
        });
    }

    /** @param array<string,mixed> $data */
    private static function replaceImages(int $id, array $data): void
    {
        Database::run('DELETE FROM strain_images WHERE strain_id = :id', ['id' => $id]);

        $insert = static function (array $image, string $kind, int $sort) use ($id): void {
            Database::run(
                'INSERT INTO strain_images (strain_id, image_kind, src, alt, label, sort_order)
                 VALUES (:strain_id, :kind, :src, :alt, :label, :sort_order)',
                [
                    'strain_id'  => $id,
                    'kind'       => $kind,
                    'src'        => $image['src'],
                    'alt'        => $image['alt'] ?? '',
                    'label'      => ($image['label'] ?? '') !== '' ? $image['label'] : null,
                    'sort_order' => $sort,
                ]
            );
        };

        if (!empty($data['mainImage']['src'])) {
            $insert($data['mainImage'], 'main', 0);
        }

        foreach (array_values($data['galleryImages'] ?? []) as $index => $image) {
            if (!empty($image['src'])) {
                $insert($image, 'gallery', $index);
            }
        }

        foreach (array_values($data['packagingImages'] ?? []) as $index => $image) {
            if (!empty($image['src'])) {
                $insert($image, 'packaging', $index);
            }
        }
    }

    public static function delete(int $id): bool
    {
        // Photos go with it via ON DELETE CASCADE.
        return Database::run('DELETE FROM strains WHERE id = :id', ['id' => $id])->rowCount() > 0;
    }

    public static function slugExists(string $slug, ?int $exceptId = null): bool
    {
        $sql = 'SELECT id FROM strains WHERE slug = :slug';
        $params = ['slug' => $slug];

        if ($exceptId !== null) {
            $sql .= ' AND id <> :id';
            $params['id'] = $exceptId;
        }

        return Database::one($sql . ' LIMIT 1', $params) !== null;
    }

    /** @param list<int> $orderedIds */
    public static function reorder(array $orderedIds): void
    {
        Database::transaction(static function () use ($orderedIds): void {
            foreach (array_values($orderedIds) as $index => $id) {
                Database::run(
                    'UPDATE strains SET sort_order = :sort_order WHERE id = :id',
                    ['sort_order' => $index, 'id' => (int) $id]
                );
            }
        });
    }
}
