<?php
declare(strict_types=1);

namespace LeadFarmer\App;

use LeadFarmer\Lib\Database;

/**
 * Page content blocks — the non-repeating copy on each page, addressed by a
 * descriptive key such as `homepage.heroTagline`.
 */
final class ContentRepo
{
    /**
     * Public shape: a flat map of key => value, plus resolved URLs for image
     * fields. Angular looks fields up by key, so this stays small and cheap.
     *
     * @return array{values:array<string,string>,images:array<string,array{url:?string,alt:string}>}
     */
    public static function publicMap(): array
    {
        $rows = Database::all(
            'SELECT content_key, content_value, alt_text, field_type FROM content_blocks'
        );

        $values = [];
        $images = [];

        foreach ($rows as $row) {
            $key = (string) $row['content_key'];
            $value = $row['content_value'] !== null ? (string) $row['content_value'] : '';

            if ((string) $row['field_type'] === 'image') {
                $images[$key] = [
                    'url' => Media::url($value),
                    'alt' => $row['alt_text'] !== null ? (string) $row['alt_text'] : '',
                ];
                // Also expose the raw stored path, for callers that want it.
                $values[$key] = $value;
                continue;
            }

            $values[$key] = $value;
        }

        return ['values' => $values, 'images' => $images];
    }

    /**
     * Admin shape: full rows with labels/help text, grouped by section so the
     * dashboard can render editing screens without hard-coding field lists.
     *
     * @return list<array<string,mixed>>
     */
    public static function adminList(?string $section = null): array
    {
        $sql = 'SELECT id, content_key, content_value, alt_text, field_type, section,
                       group_label, field_label, help_text, sort_order, updated_at
                  FROM content_blocks';
        $params = [];

        if ($section !== null && $section !== '') {
            $sql .= ' WHERE section = :section';
            $params['section'] = $section;
        }

        $sql .= ' ORDER BY section ASC, sort_order ASC, id ASC';

        return array_map(
            static fn (array $row): array => [
                'id'          => (int) $row['id'],
                'key'         => (string) $row['content_key'],
                'value'       => $row['content_value'] !== null ? (string) $row['content_value'] : '',
                'altText'     => $row['alt_text'] !== null ? (string) $row['alt_text'] : '',
                'imageUrl'    => (string) $row['field_type'] === 'image' ? Media::url((string) $row['content_value']) : null,
                'fieldType'   => (string) $row['field_type'],
                'section'     => (string) $row['section'],
                'groupLabel'  => (string) $row['group_label'],
                'fieldLabel'  => (string) $row['field_label'],
                'helpText'    => $row['help_text'] !== null ? (string) $row['help_text'] : '',
                'sortOrder'   => (int) $row['sort_order'],
                'updatedAt'   => (string) $row['updated_at'],
            ],
            Database::all($sql, $params)
        );
    }

    /** @return list<string> Distinct section names, in display order. */
    public static function sections(): array
    {
        $rows = Database::all(
            'SELECT section, MIN(sort_order) AS first_order
               FROM content_blocks
              GROUP BY section
              ORDER BY first_order ASC, section ASC'
        );

        return array_map(static fn (array $r): string => (string) $r['section'], $rows);
    }

    /** @return array<string,mixed>|null */
    public static function findByKey(string $key): ?array
    {
        return Database::one(
            'SELECT id, content_key, content_value, alt_text, field_type, field_label
               FROM content_blocks WHERE content_key = :key LIMIT 1',
            ['key' => $key]
        );
    }

    /**
     * Updates values for existing keys only — the admin panel edits the fields
     * the site actually renders, it does not invent new ones. Unknown keys are
     * reported back so a typo surfaces instead of silently doing nothing.
     *
     * @param list<array{key:string,value:string,altText?:string}> $updates
     * @return list<string> Keys that did not exist.
     */
    public static function updateMany(array $updates): array
    {
        $unknown = [];

        Database::transaction(static function () use ($updates, &$unknown): void {
            foreach ($updates as $update) {
                $existing = self::findByKey($update['key']);
                if ($existing === null) {
                    $unknown[] = $update['key'];
                    continue;
                }

                $isImage = (string) $existing['field_type'] === 'image';

                Database::run(
                    'UPDATE content_blocks
                        SET content_value = :value,
                            alt_text = CASE WHEN :is_image = 1 THEN :alt ELSE alt_text END
                      WHERE content_key = :key',
                    [
                        'value'    => $update['value'],
                        'is_image' => $isImage ? 1 : 0,
                        'alt'      => $update['altText'] ?? '',
                        'key'      => $update['key'],
                    ]
                );
            }
        });

        return $unknown;
    }
}
