<?php
declare(strict_types=1);

namespace LeadFarmer\Lib;

/**
 * Server-side validation. The admin UI validates too, but this is the copy that
 * actually matters — the client is never trusted.
 *
 * Collects every failure so the UI can highlight all bad fields at once:
 *
 *     $v = new Validator($request->body());
 *     $name = $v->string('name', required: true, max: 120);
 *     $v->stopIfFailed();
 *
 * Reusable across projects.
 */
final class Validator
{
    /** @var array<string,string> */
    private array $errors = [];

    /** @param array<string,mixed> $data */
    public function __construct(private readonly array $data)
    {
    }

    public function has(string $field): bool
    {
        return array_key_exists($field, $this->data);
    }

    public function raw(string $field): mixed
    {
        return $this->data[$field] ?? null;
    }

    public function string(string $field, bool $required = false, int $max = 65535, int $min = 0, string $label = null): ?string
    {
        $label ??= $field;
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '') {
            if ($required) {
                $this->errors[$field] = ucfirst($label) . ' is required.';
            }
            return $value === '' ? '' : null;
        }

        if (!is_string($value)) {
            $this->errors[$field] = ucfirst($label) . ' must be text.';
            return null;
        }

        $value = trim($value);

        if ($required && $value === '') {
            $this->errors[$field] = ucfirst($label) . ' is required.';
            return $value;
        }

        if (mb_strlen($value) > $max) {
            $this->errors[$field] = ucfirst($label) . " must be {$max} characters or fewer.";
        }

        if ($value !== '' && mb_strlen($value) < $min) {
            $this->errors[$field] = ucfirst($label) . " must be at least {$min} characters.";
        }

        return $value;
    }

    public function slug(string $field, bool $required = false): ?string
    {
        $value = $this->string($field, $required, 190);
        if ($value === null || $value === '') {
            return $value;
        }

        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value)) {
            $this->errors[$field] = 'Web address must use lowercase letters, numbers and hyphens only (for example: blue-zushi).';
        }

        return $value;
    }

    public function int(string $field, bool $required = false, ?int $min = null, ?int $max = null): ?int
    {
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '') {
            if ($required) {
                $this->errors[$field] = ucfirst($field) . ' is required.';
            }
            return null;
        }

        if (!is_int($value) && !(is_string($value) && preg_match('/^-?\d+$/', $value))) {
            $this->errors[$field] = ucfirst($field) . ' must be a whole number.';
            return null;
        }

        $int = (int) $value;

        if ($min !== null && $int < $min) {
            $this->errors[$field] = ucfirst($field) . " must be {$min} or more.";
        }
        if ($max !== null && $int > $max) {
            $this->errors[$field] = ucfirst($field) . " must be {$max} or less.";
        }

        return $int;
    }

    public function bool(string $field, bool $default = false): bool
    {
        $value = $this->data[$field] ?? $default;
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    /** ISO date (YYYY-MM-DD) or null. */
    public function date(string $field, bool $required = false): ?string
    {
        $value = $this->string($field, $required, 10);
        if ($value === null || $value === '') {
            return null;
        }

        $parsed = \DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if ($parsed === false || $parsed->format('Y-m-d') !== $value) {
            $this->errors[$field] = 'Date must look like 2026-01-31.';
            return null;
        }

        return $value;
    }

    /**
     * Accepts a site-relative path (assets/..., /uploads/...) or an absolute
     * http(s) URL. Rejects javascript:/data: and anything else that could turn
     * into script execution when placed in an href or src.
     */
    public function url(string $field, bool $required = false, bool $allowRelative = true): ?string
    {
        $value = $this->string($field, $required, 2048);
        if ($value === null || $value === '') {
            return $value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            if (filter_var($value, FILTER_VALIDATE_URL) === false) {
                $this->errors[$field] = 'Enter a valid web address starting with https://.';
            }
            return $value;
        }

        if (str_starts_with($value, 'mailto:')) {
            return $value;
        }

        // Bare "#" is used by the merch link as a deliberate placeholder.
        if ($value === '#') {
            return $value;
        }

        if ($allowRelative && preg_match('#^/?[A-Za-z0-9._\-/]+$#', $value)) {
            return $value;
        }

        $this->errors[$field] = 'Enter a valid web address (https://example.com) or a path on this site.';
        return $value;
    }

    /**
     * @param list<string> $allowed
     */
    public function enum(string $field, array $allowed, bool $required = false): ?string
    {
        $value = $this->string($field, $required, 190);
        if ($value === null || $value === '') {
            return $value;
        }

        if (!in_array($value, $allowed, true)) {
            $this->errors[$field] = 'Choose one of: ' . implode(', ', $allowed) . '.';
        }

        return $value;
    }

    /**
     * A list of non-empty strings (e.g. flavors, effects).
     * @return list<string>
     */
    public function stringList(string $field, int $maxItems = 50, int $maxLength = 190): array
    {
        $value = $this->data[$field] ?? [];

        if ($value === null || $value === '') {
            return [];
        }

        if (!is_array($value)) {
            $this->errors[$field] = ucfirst($field) . ' must be a list.';
            return [];
        }

        if (count($value) > $maxItems) {
            $this->errors[$field] = ucfirst($field) . " cannot have more than {$maxItems} entries.";
            return [];
        }

        $clean = [];
        foreach ($value as $item) {
            if (!is_string($item)) {
                $this->errors[$field] = ucfirst($field) . ' entries must be text.';
                return [];
            }
            $item = trim($item);
            if ($item === '') {
                continue;
            }
            if (mb_strlen($item) > $maxLength) {
                $this->errors[$field] = ucfirst($field) . " entries must be {$maxLength} characters or fewer.";
                return [];
            }
            $clean[] = $item;
        }

        return array_values($clean);
    }

    /**
     * A list of objects, each validated by $itemValidator which receives a
     * Validator for that item and returns the cleaned row.
     *
     * @param callable(Validator, int):array<string,mixed> $itemValidator
     * @return list<array<string,mixed>>
     */
    public function objectList(string $field, callable $itemValidator, int $maxItems = 100): array
    {
        $value = $this->data[$field] ?? [];

        if ($value === null || $value === '') {
            return [];
        }

        if (!is_array($value)) {
            $this->errors[$field] = ucfirst($field) . ' must be a list.';
            return [];
        }

        if (count($value) > $maxItems) {
            $this->errors[$field] = ucfirst($field) . " cannot have more than {$maxItems} entries.";
            return [];
        }

        $rows = [];
        foreach (array_values($value) as $index => $item) {
            if (!is_array($item)) {
                $this->errors[$field] = ucfirst($field) . ' entries are malformed.';
                return [];
            }

            $itemValidator_ = new self($item);
            $row = $itemValidator($itemValidator_, $index);

            foreach ($itemValidator_->errors() as $key => $message) {
                $this->errors["{$field}.{$index}.{$key}"] = $message;
            }

            $rows[] = $row;
        }

        return $rows;
    }

    public function addError(string $field, string $message): void
    {
        $this->errors[$field] = $message;
    }

    public function failed(): bool
    {
        return $this->errors !== [];
    }

    /** @return array<string,string> */
    public function errors(): array
    {
        return $this->errors;
    }

    public function stopIfFailed(): void
    {
        if ($this->failed()) {
            Response::validationFailed($this->errors);
        }
    }
}
